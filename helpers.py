import json

def parse_json_config(file_path):
    config = open(file_path, 'rb').read()
    try:
        return json.loads(config)
    except ValueError as e:
        print('\nYour JSON is not valid! Did you check trailing commas??\n')
        raise(e)
