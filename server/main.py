from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, set_access_cookies, unset_jwt_cookies
import flask_login, datetime, logging
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from components.db_executions import connect_database, query
from components.db_components import *

app = Flask(__name__)
app.config.from_object('components.config.DevelopmentConfig')
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies', 'json', 'query_string']

jwt = JWTManager(app)
CORS(app, supports_credentials = True)

logging.basicConfig(filename = 'logs.log', level = logging.INFO, format = f'%(asctime)s-%(process)d-%(levelname)s-%(name)s-%(threadName)s: %(message)s')

login_manager = flask_login.LoginManager()
login_manager.init_app(app)
app.permanent_session_lifetime = datetime.timedelta(minutes = 30)
limiter = Limiter(app, key_func = get_remote_address)

connect_database(app)

class User(flask_login.UserMixin):
    role = ''
    user_id = ''
    pass

@login_manager.user_loader
def user_loader(username):
    cursor, _ = connect_database(app)

    fetched = query(cursor, select_user_credentials, (username, ))
    
    if len(fetched) > 0:
        fetched_username = fetched[0][1]
        if username != fetched_username:
            return
    else:
        app.logger.error('No data for user "{}".'.format(username))
        return

    user = User()
    user.id = username
    user.role = fetched[0][3]
    user.user_id = fetched[0][0]

    return user

@app.route('/login', methods = ['POST'])
def login():
    login_data = request.get_json()
    login_username = login_data['username']
    
    cursor, _ = connect_database(app)
    fetched = query(cursor, select_user_credentials, (login_username, ))

    if len(fetched) > 0:
        password_hash_value = fetched[0][2]
        username = fetched[0][1]
        if check_password_hash(password_hash_value, login_data['password']):
            user = User()
            user.id = login_username
            flask_login.login_user(user)

            response = jsonify({'msg': 'Login successful'})
            access_token = create_access_token(identity = username)
            set_access_cookies(response, access_token)

            app.logger.info('User "{}" successfully logged in!'.format(login_data['username']))

            return response, 200
    else:
        app.logger.error('User "{}" does not exist.'.format(login_username))
        return 'Could not verify.', 401
    
    return 'Could not verify.', 403

@app.route('/protected')
@jwt_required()
@flask_login.login_required
def protected():
    return {'user_id': flask_login.current_user.user_id,
            'username': flask_login.current_user.id,
            'role': flask_login.current_user.role}

@app.route('/logout')
def logout():
    flask_login.logout_user()
    response = jsonify({'msg': 'Logout successful'})
    unset_jwt_cookies(response)
    return response, 205

@login_manager.unauthorized_handler
def unauthorized_handler():
    return 'Unauthorized', 401

@app.route('/books', defaults={'book_id': None}, methods = ['GET', 'POST', 'PUT', 'DELETE'])
@app.route('/books/<int:book_id>', methods = ['GET'])
@limiter.limit('5/second')
def book(book_id):
    try:
        cursor, connection = connect_database(app)
        if request.method == 'GET':
            if book_id:
                fetched = query(cursor, select_book_by_id, (book_id,))
            else:
                fetched = query(cursor, select_books, None)
            if len(fetched) > 0:
                app.logger.info('Successful {} {} request.'.format(request.method, request.path))
                return jsonify([{'id': f[0], 'name': f[1], 'author': f[2], 'quantity': f[3], 'borrowing_weeks': f[4]} for f in fetched]), 200
            else:
                app.logger.warning('No data fetched by {} {} request.'.format(request.method, request.path))
                return jsonify([]), 200 
        else:
            new_book_data = request.get_json()
            if request.method == 'POST':
                cursor.execute(insert_book, (new_book_data['name'], new_book_data['author'], new_book_data['quantity'], 
                                            new_book_data['borrowing_weeks'], new_book_data['name'], new_book_data['author']))
                connection.commit()
                if cursor.rowcount == 1:
                    app.logger.info('Successful POST {} request.'.format(request.path))
                    return new_book_data, 200
                else:
                    app.logger.warning('Unsuccessful POST {} request: data already exists'.format(request.path))
                    return 'Data already exists!', 409
            elif request.method == 'PUT':
                query(cursor, update_book, (new_book_data['name'], new_book_data['author'], new_book_data['quantity'], 
                                            new_book_data['borrowing_weeks'], new_book_data['id']), 
                    commit = True, connection = connection)
                app.logger.info('Successful PUT {} request: book with id {} updated.'.format(request.path, new_book_data['id']))
                return 'Book with id {} updated'.format(new_book_data['id']), 200
            elif request.method == 'DELETE':
                query(cursor, delete_book, (new_book_data['id'],), commit = True, connection = connection)
                app.logger.info('Successful DELETE {} request: book with id {} deleted.'.format(request.path, new_book_data['id']))
                return 'Book with id {} deleted'.format(new_book_data['id']), 200
    except:
        app.logger.error('Requested resource not found: {} {} request.'.format(request.method, request.path))
        return {'error': 'Requested resource not found.'}, 404

@app.route('/book_status', defaults = {'book_status_id': None}, methods = ['POST', 'PUT', 'DELETE'])
@app.route('/book_status/<int:book_status_id>', methods = ['GET'])
@app.route('/book_statuses', defaults = {'user_id': None}, methods = ['GET'])
@app.route('/book_statuses/<int:user_id>', methods = ['GET'])
@limiter.limit('5/second')
def book_status(book_status_id = None, user_id = None):
    try:
        cursor, connection = connect_database(app)
        if not book_status_id and not user_id:
            if request.method == 'GET':
                fetched = query(cursor, select_book_statuses, None)
            else:
                new_book_status_data = request.get_json()
                if request.method == 'POST':
                    new_book_status_data = request.get_json()
                    query(cursor, insert_book_status, 
                    (new_book_status_data['book_id'], 
                    new_book_status_data['user_id'], 
                    new_book_status_data['reserved'], 
                    new_book_status_data['received_borrowing'], 
                    new_book_status_data['returned_borrowing'], 
                    new_book_status_data['handed_over_borrower'], 
                    new_book_status_data['returned_borrower']), commit = True, connection = connection)
                    app.logger.info('Successful POST {} request.'.format(request.path))
                    return new_book_status_data, 200
                elif request.method == 'PUT':
                    query(cursor, update_book_status,
                    (new_book_status_data['reserved'], 
                    new_book_status_data['received_borrowing'],
                    new_book_status_data['returned_borrowing'], 
                    new_book_status_data['handed_over_borrower'], 
                    new_book_status_data['returned_borrower'],
                    new_book_status_data['book_id'], 
                    new_book_status_data['user_id']), commit = True, connection = connection)
                    app.logger.info('Successful PUT {} request: book status with with book_id {} and user_id {} updated.'.format(request.path, new_book_status_data['book_id'], new_book_status_data['user_id']))
                    return 'Book status with with book_id {} and user_id {} updated.'.format(new_book_status_data['book_id'], new_book_status_data['user_id']), 200
                elif request.method == 'DELETE':
                    query(cursor, delete_book_status, (new_book_status_data['book_id'], new_book_status_data['user_id']), commit = True, connection = connection)
                    app.logger.info('Successful DELETE {} request: book status with book_id {} and user_id {} deleted.'.format(request.path, new_book_status_data['book_id'], new_book_status_data['user_id']))
                    return 'Book status with book_id {} and user_id {} deleted.'.format(new_book_status_data['book_id'], new_book_status_data['user_id']), 200
        else:
            if book_status_id:
                fetched = query(cursor, select_book_status_by_id, (book_status_id,))
            elif user_id:
                fetched = query(cursor, select_book_statuses_by_user_id, (user_id,))
        if len(fetched) > 0:
            app.logger.info('Successful GET {} request.'.format(request.path))
            return jsonify([{'book_id': f[0], 
                            'user_id': f[1], 
                            'reserved': f[2], 
                            'received_borrowing': f[3], 
                            'returned_borrowing': f[4], 
                            'handed_over_borrower': f[5], 
                            'returned_borrower': f[6]} 
                            for f in fetched]), 200
        else:
            app.logger.warning('No data fetched by GET {} request.'.format(request.path))
            return jsonify([]), 200
    except:
        app.logger.error('Requested resource not found: {} {} request.'.format(request.method, request.path))
        return {'error': 'Requested resource not found!'}, 404

@app.route('/register', methods = ['POST'])
def register():
    try:
        cursor, connection = connect_database(app)
        new_user_data = request.get_json()
        new_username = new_user_data['username']
        fetched = query(cursor, select_user_credentials, (new_username,))
        if len(fetched) > 0:
            app.logger.error('User "{}" already exists: POST {} request.'.format(new_username, request.path))
            return 'User "{}" already exists!'.format(new_username), 409
        else:
            query(cursor, insert_user, (new_username, 
                            generate_password_hash(new_user_data['password'], method = 'pbkdf2:sha512', salt_length = 256), 
                            new_user_data['role']), commit = True, connection = connection)
    except:
        message = 'Requested resource not found: POST request /register'
        app.logger.error(message)
        return {'error': message}, 404
    
    app.logger.info('Successful POST request /register: user "{}" registered.'.format(new_username))
    return new_user_data, 200

if __name__ == '__main__':
    app.run(debug = True)