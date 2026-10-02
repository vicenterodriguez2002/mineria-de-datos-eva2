from flask import Flask

from app.loader import load_resources
from app.routes import register_routes

app = Flask(__name__)
models, association_rules, df = load_resources()
register_routes(app, models, association_rules, df)
