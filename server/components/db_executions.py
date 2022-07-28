import os, sqlite3
from sqlite3 import Error
from os import path
from components.db_components import *
from components.config import DATABASE_URI as DATABASE

def connect_database(app):
    setup_databse = False
    if not path.exists(os.path.abspath(os.path.join(os.path.dirname(__file__),"..")) + '\\' +  DATABASE):
        setup_databse = True
    try:
        connection = sqlite3.connect(DATABASE)
        cursor = connection.cursor()
        app.logger.info('Established database connection')
    except Error as sqlite_error:
        app.logger.error('Unable to establish connection with database: {}'.format(sqlite_error))
    
    if setup_databse:
        try:
            cursor = connection.cursor()
            cursor.execute(table_user)
            cursor.execute(table_book)
            cursor.execute(table_book_status)
            cursor.executemany(insert_books, books)
            cursor.execute(insert_user, default_user)
            connection.commit()
            app.logger.info('Setup: successfully created tables and inserted data')
        except Error as database_setup_error:
            app.logger.error('Setup failed: {}'.format(database_setup_error))
    return cursor, connection

def query(cursor, query_name, values, commit = False, connection = None):
    if values:
        cursor.execute(query_name, values)
    else:
        cursor.execute(query_name)
    if not commit:
        return cursor.fetchall()
    else:
        connection.commit()