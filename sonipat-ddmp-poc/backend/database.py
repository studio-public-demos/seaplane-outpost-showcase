import sqlite3

def get_db_connection():
    conn = sqlite3.connect('ddmp.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS resources
                 (id INTEGER PRIMARY KEY, name TEXT, department TEXT, location TEXT)''')
    conn.commit()
    conn.close()

def add_resource(name, department, location):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO resources (name, department, location) VALUES (?, ?, ?)', (name, department, location))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
