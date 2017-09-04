import os
import decimal
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
    return os.environ.get('SERVER_NAME') is None

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

@app.route('/')
def show_entries():
    if isLocal():
        if 'user' in session:
            print('user {0} is already logged in'.format(session['user']))
            return render_template('index.html')
        else:
            redirect('/login')
    if 'google_token' in session and 'user' in session:
        return render_template('index.html')
    return redirect(
        '{0}/login'.format(os.environ.get(
            'SERVER_NAME', 'http://127.0.0.1:5000'))
    )

@app.route('/api/context', methods=['GET'])
def context():
    return json.dumps({
        'user': session['user']
    })

@app.route('/api/links', methods=['GET'])
def links():
    response = MO_ENTRIES_TABLE.scan()
    items = response.get('Items')
    return json.dumps(items, use_decimal=True)

@app.route('/api/links/<alias>', methods=['DELETE'])
def delete_link(alias):
    response = MO_ENTRIES_TABLE.delete_item(
        Key={
            'alias': alias
        }
    )
    print(response)
    return ('Link deleted', 204)

@app.route('/api/links', methods=['PUT'])
def put_link():
    ddb_response = MO_ENTRIES_TABLE.get_item(
        Key={
            'alias': request.json['alias']
        }
    )
    item = ddb_response.get('Item')
    if item:
        if item['owner'] != session['user']:
            return ('Only link owners can update their links', 401)
    response = MO_ENTRIES_TABLE.put_item(
        Item={
            'alias': request.json['alias'],
            'url': request.json['url'],
            'owner': request.json.get('owner') or session['user'],
            'clicks': 0
        }
    )
    return '201'


@app.route('/api/links/<alias>', methods=['GET'])
def get_link(alias):
    response = MO_ENTRIES_TABLE.get_item(
        Key={
            'alias': alias
        }
    )
    print(response)
    return json.dumps(response, use_decimal=True)

@app.route('/edit', methods=['GET'])
def edit_page():
    return render_template('edit_entry.html')

@app.route('/delete', methods=['GET'])
def delete_page():
    return render_template('edit_entry.html')

@app.route('/edit_link', methods=['POST'])
def edit_entry():
    ddb_response = MO_ENTRIES_TABLE.get_item(
        Key={
            'alias': request.form['alias']
        }
    )
    item = ddb_response.get('Item')
    MO_ENTRIES_TABLE.put_item(
        Item={
            'alias': request.form['alias'],
            'url': request.form['url'],
            'owner': request.form['owner'],
            'clicks': item['clicks']
        }
    )
    flash('Entry was successfully updated.')
    return redirect('/')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if isLocal():
        if request.method == 'POST':
            session['user'] = request.form['user']
            return redirect('/')
        return '''
            <form method="post">
                <p><input type=text required name=user>
                <p><input type=submit value=Login>
            </form>
        '''
    else:
        url = '{0}/oauth2callback'.format(
            os.environ.get('SERVER_NAME', 'http://127.0.0.1:5000'))
        return google.authorize(callback=url)

@app.route('/logout')
def logout():
    session.pop('google_token', None)
    session['user'] = None
    session.clear()
    for key in session.keys():
        session.pop(key, None)
    return redirect('/')
    #return render_template('landing.html')

@app.route('/oauth2callback')
def authorized():
    """Authorization callback."""
    resp = google.authorized_response()
    if resp is None:
        return 'Access denied: reason=%s error=%s' % (
            request.args['error_reason'],
            request.args['error_description']
        )
    session['google_token'] = (resp['access_token'], '')
    session['user'] = google.get('userinfo').data
    #print(jsonify({"data": me.data}))
    return redirect('/')

@google.tokengetter
def get_google_oauth_token():
    return session.get('google_token')


@app.route('/account')
def whoami():
    if 'google_token' in session:
        me = google.get('userinfo')
        return jsonify({'data': me.data})
    return redirect('/login')

@app.route('/env')
def environ():
    if app.debug:
        return str(os.environ)
    return 'not in debug mode'

@app.route('/add', methods=['POST'])
def add_entry():
    """"Add an alias."""
    alias = request.form['alias']
    ddb_response = MO_ENTRIES_TABLE.get_item(
        Key={
            'alias': request.form['alias']
        }
    )
    item = ddb_response.get('Item')
    if item:
        flash('An entry for alias {0} already exists.'.format(alias))
    else:
        MO_ENTRIES_TABLE.put_item(
            Item={
                'alias': request.form['alias'],
                'url': request.form['url'],
                'owner': session['user'].get('email'),
                'clicks': 0,
            }
        )
        flash('New entry was successfully posted')
    return redirect('/')

@app.route('/<alias>')
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

@app.route('/messages', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        text = request.form['text']
        MO_MESSAGES_TABLE.put_item(
            Item={
                'id': str(uuid.uuid4()),
                'message': text,
                'author': session['user'].get('email')
                }
        )
        flash('New entry was successfully posted')
    response = MO_MESSAGES_TABLE.scan()
    items = response.get('Items')
    return render_template('messages.html')


if __name__ == '__main__':
    # The following code only gets executed when the app is run locally
    # on the host. NOT inside of docker.
    app.debug = True
    app.run(host='127.0.0.1')
