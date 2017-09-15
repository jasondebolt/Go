"""Creates DynamoDB tables for the mo app."""
import boto3
import botocore
from faker import Faker
from random import random

TABLE_SESSION = boto3.Session()
DB_CLIENT = TABLE_SESSION.client('dynamodb')
DB_RESOURCE = TABLE_SESSION.resource('dynamodb')

def get_table_configs():
    """Creates DynamoDB table configs."""
    table_config = {}
    for table_name in ['go-entries']:
        table_config[table_name] = {}
    table_config['go-entries']['ProvisionedThroughput'] = {
        'ReadCapacityUnits' : 5, 'WriteCapacityUnits' : 5
        }

    # Key schemas
    table_config['go-entries']['key_schema'] = [
        {'AttributeName' : 'alias', 'KeyType' : 'HASH'}]

    # Attribute schemas
    table_config['go-entries']['attribute_definitions'] = [
        {'AttributeName' : 'alias', 'AttributeType' : 'S'},
        {'AttributeName' : 'owner', 'AttributeType' : 'S'},
        {'AttributeName' : 'clicks', 'AttributeType' : 'N'},
        {'AttributeName' : 'url', 'AttributeType' : 'S'}
    ]

    table_config['GlobalSecondaryIndexes'] = []
    table_config['GlobalSecondaryIndexes'].append({
        'IndexName' : 'OwnerAlias',
        'KeySchema' : [
            {'AttributeName' : 'owner', 'KeyType' : 'HASH'},
            {'AttributeName' : 'alias', 'KeyType' : 'RANGE'},
        ],
        'Projection' : {
            'ProjectionType' : 'INCLUDE',
            'NonKeyAttributes' : ['url', 'clicks']
        },
        'ProvisionedThroughput' : {
            'ReadCapacityUnits' : 5, 'WriteCapacityUnits' : 5}
        })
    table_config['GlobalSecondaryIndexes'].append({
        'IndexName' : 'ClicksAlias',
        'KeySchema' : [
            {'AttributeName' : 'clicks', 'KeyType' : 'HASH'},
            {'AttributeName' : 'alias', 'KeyType' : 'RANGE'},
        ],
        'Projection' : {
            'ProjectionType' : 'INCLUDE',
            'NonKeyAttributes' : ['owner', 'url']
        },
        'ProvisionedThroughput' : {
            'ReadCapacityUnits' : 5, 'WriteCapacityUnits' : 5}
        })
    table_config['GlobalSecondaryIndexes'].append({
        'IndexName' : 'UrlAlias',
        'KeySchema' : [
            {'AttributeName' : 'url', 'KeyType' : 'HASH'},
            {'AttributeName' : 'alias', 'KeyType' : 'RANGE'},
        ],
        'Projection' : {
            'ProjectionType' : 'INCLUDE',
            'NonKeyAttributes' : ['owner', 'clicks']
        },
        'ProvisionedThroughput' : {
            'ReadCapacityUnits' : 5, 'WriteCapacityUnits' : 5}
        })

    return table_config

def create_table(table_name, table_config):
    try:
        print('Creating table {0}'.format(table_name))
        DB_RESOURCE.create_table(
            AttributeDefinitions=table_config[
                table_name]['attribute_definitions'],
            TableName=table_name,
            KeySchema=table_config[table_name]['key_schema'],
            GlobalSecondaryIndexes=table_config['GlobalSecondaryIndexes'],
            ProvisionedThroughput=table_config[
                table_name]['ProvisionedThroughput']
        )
        print('Waiting for table {0} to be created...'.format(table_name))
        DB_RESOURCE.Table(table_name).wait_until_exists()
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            response = input(
                '{0} table already exists, would you like to delete/replace '
                'it (y/n)?'.format(table_name))
            if response == 'y':
                DB_RESOURCE.Table(table_name).delete()
                print('Waiting for table {0} to be '
                      'deleted...'.format(table_name))
                DB_RESOURCE.Table(table_name).wait_until_not_exists()
                create_table(table_name, table_config)
                DB_RESOURCE.Table(table_name).wait_until_exists()
                print('Table {0} has been created.'.format(table_name))
        else:
            raise
    finally:
        print('You may exit if running in container.')

def populate_tables():
    go_entries = {}
    fake = Faker('en_US')
    for _ in range(10000):
        go_entries[fake.word().replace(' ', '')] = {
            'url': fake.uri(),
            'owner': fake.email(),
            'clicks': int(random() * 1000)
        }
    #go_entries = {
    #    'goog': {
    #        'url': 'https://www.google.com',
    #        'owner': 'jasondebolt@gmail.com',
    #        'clicks': 0
    #    },
    #    'mosaic': {
    #        'url': 'https://www.joinmosaic.com',
    #        'owner': 'jasondebolt@gmail.com',
    #        'clicks': 0
    #    },
    #    'tesla': {
    #        'url': 'https://www.tesla.com',
    #        'owner': 'jasondebolt@gmail.com',
    #        'clicks': 0
    #    }
    #}
    with DB_RESOURCE.Table('go-entries').batch_writer() as batch:
        for alias, data in go_entries.items():
            batch.put_item(
                Item={
                    'alias': alias,
                    'url': data['url'],
                    'owner': data['owner'],
                    'clicks': data['clicks']
                }
            )

def main():
    table_configs = get_table_configs()
    create_table('go-entries', table_configs)
    populate_tables()

if __name__ == '__main__':
    main()
