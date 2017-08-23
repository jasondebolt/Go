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
from flask_s3 import FlaskS3

app = Flask(__name__)

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

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # The following code only gets executed when the app is run locally
    # on the host. NOT inside of docker.
    app.debug = True
    app.run()
