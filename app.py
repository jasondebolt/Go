import os
import decimal
import socket
import uuid
import logging
import simplejson as json
import helpers
import boto3
import flask
from flask import Flask, request, session, g, redirect, url_for, abort
from flask import render_template, flash, jsonify
from flask_json import FlaskJSON, JsonError, json_response, as_json
import flask_s3
from flask_oauthlib.client import OAuth
from flask_s3 import FlaskS3
import pdb

app = Flask(__name__)
oauth = OAuth(app)

def isLocal():
    return os.environ.get('SERVER_NAME', '') == ''

if not isLocal():
    # Use S3 bucket instead for static assets.
    s3 = FlaskS3()
    s3.init_app(app)
    app.config['FLASKS3_BUCKET_NAME'] = 'zappa-go'

# pylint: disable=C0103,E1101
secrets_dict = helpers.parse_json_config(
    os.path.join(app.root_path, 'go_config.json'))

# Load default config and override config from an environment variable
app.config.update(dict(
    SECRET_KEY=secrets_dict['secret_key'],
    USERNAME=secrets_dict['username'],
    PASSWORD=secrets_dict['password'],
    GOOGLE_ID=secrets_dict['google_id'],
    GOOGLE_SECRET=secrets_dict['google_secret']
))

google = oauth.remote_app(
    'google',
    consumer_key=app.config.get('GOOGLE_ID'),
    consumer_secret=app.config.get('GOOGLE_SECRET'),
    request_token_params={
        'scope': 'email'
    },
    base_url='https://www.googleapis.com/oauth2/v1/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
)

DYNAMODB = boto3.resource('dynamodb', region_name='us-west-2')
MO_ENTRIES_TABLE = DYNAMODB.Table('mo-entries')
MO_MESSAGES_TABLE = DYNAMODB.Table('mo-messages')
API_URL = '/api'

RESERVED_PATHS = ['/api', '/static']


@app.route("/hostname/")
def return_hostname():
    return "This is an example wsgi app served from {} to {}".format(socket.gethostname(), request.remote_addr)


@app.route('/')
def show_entries():
    # session['user'] is JSON!!
    # session['user'] = {'user': {'email': 'foo@gmail.com', ...}}
    # user_dict = {'user': {'email': 'foo@gmail.com', ...}}
    if isLocal():
        user_dict = json.loads(session.get('user', '{}'))
        if 'user' in user_dict:
            print('user {0} is already logged in'.format(user_dict['user']))
            return render_template('index.html')
        else:
            return redirect(API_URL + '/login')
    if 'google_token' in session and 'user' in session:
        return render_template('index.html')
    return redirect(os.environ.get('SERVER_NAME') + API_URL + '/login')

@app.route(API_URL + '/context', methods=['GET'])
def context():
    user_dict = json.loads(session.get('user', '{}'))
    return json.dumps(user_dict)

@app.route(API_URL + '/links', methods=['GET'])
def links():
    response = MO_ENTRIES_TABLE.scan()
    items = response.get('Items')
    return json.dumps(items, use_decimal=True)

@app.route(API_URL + '/links/<alias>', methods=['DELETE'])
def delete_link(alias):
    ddb_response = MO_ENTRIES_TABLE.get_item(
        Key={
            'alias': alias
        }
    )
    item = ddb_response.get('Item')
    if item:
        user_dict = json.loads(session['user'])
        if item['owner'] != user_dict['user']['email']:
            return ('Only link owners can delete their links', 401)
    response = MO_ENTRIES_TABLE.delete_item(
        Key={
            'alias': alias
        }
    )
    print(response)
    return ('Link deleted', 204)

@app.route(API_URL + '/links', methods=['PUT'])
def put_link():
    ddb_response = MO_ENTRIES_TABLE.get_item(
        Key={
            'alias': request.json['alias']
        }
    )
    item = ddb_response.get('Item')
    user_dict = json.loads(session['user'])
    if item:
        if item['owner'] != user_dict['user']['email']:
            return ('Only link owners can update their links', 401)
    response = MO_ENTRIES_TABLE.put_item(
        Item={
            'alias': request.json['alias'],
            'url': request.json['url'],
            'owner': request.json.get('owner') or user_dict['user']['email'],
            'clicks': 0
        }
    )
    return 'Link was put', 201


@app.route(API_URL + '/links/<alias>', methods=['GET'])
def get_link(alias):
    response = MO_ENTRIES_TABLE.get_item(
        Key={
            'alias': alias
        }
    )
    print(response)
    return json.dumps(response, use_decimal=True)

@app.route(API_URL + '/login', methods=['GET', 'POST'])
def login():
    if isLocal():
        if request.method == 'POST':
            session['user'] = json.dumps({
                'user': {
                    'email': request.form['email']
                }
            })
            print(session['user'])
            return redirect('/')
        return '''
            <form method="post" action="{0}/login">
                <p>Enter your email
                <p><input type=text required name=email>
                <p><input type=submit value=Login>
            </form>
        '''.format(API_URL)
    else:
        url = '{0}{1}/oauth2callback'.format(
            os.environ.get('SERVER_NAME'), API_URL)
        return google.authorize(callback=url)

@app.route(API_URL + '/logout')
def logout():
    session.pop('google_token', None)
    session['user'] = None
    session.clear()
    for key in session.keys():
        session.pop(key, None)
    if isLocal():
        return redirect('/')
    return redirect(os.environ.get('SERVER_NAME'))
    #return render_template('landing.html')

@app.route(API_URL + '/oauth2callback')
def authorized():
    """Authorization callback."""
    resp = google.authorized_response()
    if resp is None:
        return 'Access denied: reason=%s error=%s' % (
            request.args['error_reason'],
            request.args['error_description']
        )
    session['google_token'] = (resp['access_token'], '')
    session['user'] = json.dumps(google.get('userinfo').data)
    #print(jsonify({"data": me.data}))
    return redirect('/')

@google.tokengetter
def get_google_oauth_token():
    return session.get('google_token')


@app.route(API_URL + '/account')
def whoami():
    if 'google_token' in session:
        me = google.get('userinfo')
        return jsonify({'data': me.data})
    return redirect(API_URL + '/login')

@app.route(API_URL + '/env')
def environ():
    if isLocal():
        return str(os.environ)
    return 'not running locally.', 200

@app.route('/<path:alias>')
def redirect_url(alias):
    """Redirects to the URL associated with the entry."""
    ddb_response = MO_ENTRIES_TABLE.get_item(
        Key={
            'alias': alias
        }
    )
    item = ddb_response.get('Item')
    if item:
        increment_clicks(alias)
        return redirect(item.get('url'))
    return redirect('/')


def increment_clicks(alias):
    ddb_response = MO_ENTRIES_TABLE.get_item(
        Key={
            'alias': alias
        }
    )
    item = ddb_response.get('Item')
    MO_ENTRIES_TABLE.put_item(
        Item={
            'alias': item.get('alias'),
            'url': item.get('url'),
            'owner': item.get('owner'),
            'clicks': item.get('clicks', 0) + 1
        }
    )

if __name__ == '__main__':
    # The following code only gets executed when the app is run locally
    # on the host. NOT inside of docker.
    app.debug = True
    app.run(host='127.0.0.1')
