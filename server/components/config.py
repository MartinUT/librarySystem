from os import environ, path
from dotenv import load_dotenv

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))

DATABASE_URI = 'library.db'

class Config:
    SECRET_KEY = environ.get('SECRET_KEY')
    SESSION_COOKIE_NAME = environ.get('SESSION_COOKIE_NAME')
    JWT_SECRET_KEY = environ.get('JWT_SECRET_KEY')

class ProductionConfig(Config):
    FLASK_ENV = 'production'
    DEBUG = False
    TESTING = False
    JWT_COOKIE_SECURE = True
    #DATABASE_URI = environ.get('PROD_DATABASE_URI')

class DevelopmentConfig(Config):
    FLASK_ENV = 'development'
    DEBUG = True
    TESTING = True
    JWT_COOKIE_SECURE = False
    #DATABASE_URI = environ.get('DEV_DATABASE_URI')