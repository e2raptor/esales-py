import sys, os
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../lib/'))
if not path in sys.path:
    sys.path.insert(1, path)

from lib.flask import Flask
from lib.flask_sqlalchemy import SQLAlchemy
app = Flask(__name__)
db_path =  os.path.abspath(os.path.join(os.path.dirname(__file__), '../db/app.db'))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'+db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_MIGRATE_REPO'] = os.path.abspath(os.path.join(os.path.dirname(__file__), '../db/db_repository'))
db = SQLAlchemy(app)

@app.after_request
def after_request(response):
  response.headers.add('Access-Control-Allow-Origin', '*')
  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  return response

from app import products,sales,clients,stock
