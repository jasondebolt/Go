import os
import uuid
import logging
import json
import helpers
import boto3
import flask
from flask import Flask, request, session, g, redirect, url_for, abort
from flask import render_template, flash, jsonify
import flask_s3
from flask_oauthlib.client import OAuth
from flask_s3 import FlaskS3

app = Flask(__name__)
oauth = OAuth(app)

if not app.debug:
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

DYNAMODB = boto3.resource('dynamodb')
MO_ENTRIES_TABLE = DYNAMODB.Table('mo-entries')
MO_MESSAGES_TABLE = DYNAMODB.Table('mo-messages')

@app.route('/')
def show_entries():
    #response = MO_ENTRIES_TABLE.scan()
    #items = response.get('Items')
    #return render_template('show_entries.html', entries=items)
    if 'google_token' in session and 'user' in session:
        response = MO_ENTRIES_TABLE.scan()
        items = response.get('Items')
        return render_template('index.html')
    return redirect(
        '{0}/login'.format(os.environ.get(
            'SERVER_NAME', 'http://127.0.0.1:5000'))
    )

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

@app.route('/login')
def login():
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
    return render_template('landing.html')

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
    return render_template('messages.html', items=items)


if __name__ == '__main__':
    # The following code only gets executed when the app is run locally
    # on the host. NOT inside of docker.
    app.debug = True
    app.run(host='127.0.0.1')
