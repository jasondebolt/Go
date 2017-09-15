#!/usr/bin/env python

import os
import sys
from argparse import ArgumentParser
import argcomplete
import flask_s3
from flask_s3 import FlaskS3
from app import app

s3 = FlaskS3()

__author__ = 'Jason DeBolt (jasondebolt@gmail.com)'

VERSION='0.0.1'

def get_parser():
    """Generates and returns an ArgumentParser object."""
    if sys.version_info[0] < 3:
        # Using a version of Python < 3.
        parser = ArgumentParser(version=VERSION) # pylint: disable=E1123
    else:
        parser = ArgumentParser()
        parser.add_argument('--version', action='version', version=VERSION)

    subparsers = parser.add_subparsers(
        title='actions', help='Types of zappa commands',
        dest='command')

    parser_update_stack = subparsers.add_parser(
        'update', help='Update a zappa deploy')
    parser_update_stack.add_argument(
        '--name', required=True,
        help='Name of the deployment (dev, prod, etc.)')

    parser_create_stack = subparsers.add_parser(
        'deploy', help='Create a zappa deploy')
    parser_create_stack.add_argument(
        '--name', required=True,
        help='Name of the deployment (dev, prod, etc.)')

    return parser


def update_zappa(args):
    # Upload the static files to S3
    print('uploading static files to S3...')
    s3.init_app(app)
    app.config['FLASKS3_BUCKET_NAME'] = 'zappa-go'
    flask_s3.create_all(app)
    os.system('zappa update {0}'.format(args.name))

def deploy_zappa(args):
    # Upload the static files to S3
    print('uploading static files to S3...')
    s3.init_app(app)
    app.config['FLASKS3_BUCKET_NAME'] = 'zappa-go'
    flask_s3.create_all(app)
    os.system('zappa deploy {0}'.format(args.name))

def main():
    namespace = get_parser().parse_args()
    if namespace.command == 'update':
        update_zappa(namespace)
    if namespace.command == 'deploy':
        deploy_zappa(namespace)
    else:
        print('Invalid command.')


if __name__ == '__main__':
    main()
