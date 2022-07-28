from werkzeug.security import generate_password_hash
from os import environ, path
from dotenv import load_dotenv

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))

table_user = """ 
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                password VARCHAR(406) NOT NULL,
                role VARCHAR(50) NOT NULL
            );
            """
table_book = """
            CREATE TABLE IF NOT EXISTS book (
                id INTEGER PRIMARY KEY,
                name VARCHAR(225) NOT NULL,
                author VARCHAR(225) NOT NULL,
                quantity INTEGER NOT NULL,
                borrowing_weeks INTEGER
            );
            """
table_book_status = """
                    CREATE TABLE IF NOT EXISTS status (
                        book_id INTEGER,
                        user_id INTEGER, 
                        reserved DATETIME,
                        received_borrowing DATETIME,
                        returned_borrowing DATETIME,
                        handed_over_borrower DATETIME,
                        returned_borrower DATETIME
                    );
                    """

# Source: https://www.theguardian.com/books/2003/oct/12/features.fiction
# Book with name, author and quantity. Here just chosen 10 as the quantity for every book with no particular reason.
books = [
    ("Don Quixote", "Miguel De Cervantes", 10, 4),
    ("Pilgrim's Progress", "John Bunyan", 10, 4),
    ("Robinson Crusoe", "Daniel Defoe", 10, 4),
    ("Gulliver's Travels", "Jonathan Swift", 10, 4),
    ("Tom Jones", "Henry Fielding", 10, 4),
    ("Clarissa", "Samuel Richardson", 10, 4),
    ("Tristram Shandy", "Laurence Sterne", 10, 4),
    ("Dangerous Liaisons", "Pierre Choderlos De Laclos", 10, 4),
    ("Emma", "Jane Austen", 10, 4),
    ("Frankenstein", "Mary Shelley", 10, 4),
    ("Nightmare Abbey", "Thomas Love Peacock", 10, 4),
    ("The Black Sheep", "Honoré De Balzac", 10, 4),
    ("The Charterhouse of Parma", "Stendhal", 10, 4),
    ("The Count of Monte Cristo", "Alexandre Dumas", 10, 4),
    ("Sybil", "Benjamin Disraeli", 10, 4),
    ("David Copperfield", "Charles Dickens", 10, 4),
    ("Wuthering Heights", "Emily Bronte", 10, 4),
    ("Jane Eyre", "Charlotte Bronte", 10, 4),
    ("Vanity Fair", "William Makepeace Thackeray", 10, 4),
    ("The Scarlet Letter", "Nathaniel Hawthorne", 10, 4),
    ("Moby-Dick", "Herman Melville", 10, 4),
    ("Madame Bovary", "Gustave Flaubert", 10, 4),
    ("The Woman in White", "Wilkie Collins", 10, 4),
    ("Alice's Adventures In Wonderland", "Lewis Carroll", 10, 4),
    ("Little Women", "Louisa M. Alcott", 10, 4),
    ("The Way We Live Now", "Anthony Trollope", 10, 4),
    ("Anna Karenina", "Leo Tolstoy", 10, 4),
    ("Daniel Deronda", "George Eliot", 10, 4),
    ("The Brothers Karamazov", "Fyodor Dostoevsky", 10, 4),
    ("The Portrait of a Lady", "Henry James", 10, 4),
    ("Huckleberry Finn", "Mark Twain", 10, 4),
    ("The Strange Case of Dr Jekyll and Mr Hyde", "Robert Louis Stevenson", 10, 4),
    ("Three Men in a Boat", "Jerome K. Jerome", 10, 4),
    ("The Picture of Dorian Gray", "Oscar Wilde", 10, 4),
    ("The Diary of a Nobody", "George Grossmith", 10, 4),
    ("Jude the Obscure", "Thomas Hardy", 10, 4),
    ("The Riddle of the Sands", "Erskine Childers", 10, 4),
    ("The Call of the Wild", "Jack London", 10, 4),
    ("Nostromo", "Joseph Conrad", 10, 4),
    ("The Wind in the Willows", "Kenneth Grahame", 10, 4),
    ("In Search of Lost Time", "Marcel Proust", 10, 4),
    ("The Rainbow", "D. H. Lawrence", 10, 4),
    ("The Good Soldier", "Ford Madox Ford", 10, 4),
    ("The Thirty-Nine Steps", "John Buchan", 10, 4),
    ("Ulysses", "James Joyce", 10, 4),
    ("Mrs Dalloway", "Virginia Woolf", 10, 4),
    ("A Passage to India", "EM Forster", 10, 4),
    (" The Great Gatsby", "F. Scott Fitzgerald", 10, 4),
    ("The Trial", "Franz Kafka", 10, 4),
    ("Men Without Women", "Ernest Hemingway", 10, 4)
]

insert_books = "INSERT INTO book (name, author, quantity, borrowing_weeks) VALUES (?, ?, ?, ?)"

default_user = ('admin',  generate_password_hash(environ.get('admin_password'), method = 'pbkdf2:sha512', salt_length = 256), 'laenaja')
insert_user = 'INSERT INTO user (username, password, role) VALUES (?, ?, ?)'

select_user_credentials = 'SELECT id, username, password, role FROM user WHERE username = ?'

select_books = 'SELECT * FROM book'
select_book_by_id = 'SELECT * FROM book WHERE id = ?'
insert_book = 'INSERT INTO book (name, author, quantity, borrowing_weeks) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM book WHERE name = ? AND author = ?)'
update_book = 'UPDATE book SET name = ?, author = ?, quantity = ?, borrowing_weeks = ? WHERE id = ?'
delete_book = 'DELETE FROM book WHERE id = ?'

select_book_status_by_id = 'SELECT * FROM status WHERE book_id = ?'
insert_book_status = 'INSERT INTO status (book_id, user_id, reserved, received_borrowing, returned_borrowing, handed_over_borrower, returned_borrower) VALUES (?, ?, ?, ?, ?, ?, ?)'
update_book_status = 'UPDATE status SET reserved = ?, received_borrowing = ?, returned_borrowing = ?, handed_over_borrower = ?, returned_borrower = ? WHERE book_id = ? and user_id = ?'
delete_book_status = 'DELETE FROM status WHERE book_id = ? AND user_id = ?'

select_book_statuses = 'SELECT * FROM status'
select_book_statuses_by_user_id = 'SELECT * FROM status WHERE user_id = ?'