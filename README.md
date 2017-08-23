# go

## Setting up python
```
$ virtualenv venv --python=python3.6
$ source venv/bin/activate
$ pip install -r requirements.txt
```

## Setting up React
```
$ npm install -g webpack
$ npm install
```

## Running the Flask local dev server
```
$ export FLASK_APP=app
$ export FLASK_DEBUG=1
$ flask run
```

## Development
```
DISABLE CHROME CACHING
- Open developer tools
- Click the triple vertical dot icon, then settings.
- Select the "Disable cache (while DevTools is open)" option

The entry point for the app is in js/app.js.

While developing on the frontend, run webpack --watch to keep re-compiling your JavaScript code.

Running webpack creates a file in static/bundle.js, which is the bundled version of your frontend code.

The "backend" here is a bare-bones Flask app, app.py.
```

## Deploying the dev server to AWS Lambda
```
$ zappa deploy dev
$ ./zappa_cli.py update --name dev
```

## Setting up the JS frontend
```
https://realpython.com/blog/python/the-ultimate-flask-front-end/
```
