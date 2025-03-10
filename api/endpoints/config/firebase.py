# File: app/config/firebase.py
import firebase_admin
from firebase_admin import credentials
import os

def initialize_firebase():
    firebase_config_path = os.getenv("FIREBASE_CONFIG_PATH")
    cred = credentials.Certificate(firebase_config_path)
    firebase_admin.initialize_app(cred)
