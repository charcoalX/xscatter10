#!/usr/bin/env python3

print('Important Hints: ******************************************************')
print('Please make sure that you have installed the followings: ')
print('1. PostgreSQL Database. The default port number is 5432.')
print('2. Localhost server')
print('3. Install python libraries such as Flask, psycopg2')
print('***********************************************************************')

# start import modules
from modules import *
from query import *
# from info import *

app = Flask(__name__)
app.debug = True

# Read connection information from config.json
with open('config.json') as config_file:
    conn_info = json.load(config_file)

# Define database connection
host = conn_info['host']
dbname = conn_info['dbname']
user = conn_info['user']
port = conn_info['port']
password = conn_info['password']

# Create connection string
conn_str =  "host='" + host + "' dbname='" + dbname + "' user='" + user + "' password='" + password + "' port='" + port + "'"

# try connecting to postgresql database
try:
    conn = psycopg2.connect(conn_str)
    cursor = conn.cursor()
    print('Connected to postgresql database ...')
    print('')
except:
    print('Please check the following! then run this code again: ')
    print('1. You have installed the PostgreSQL database.')
    print('2. The connection information in the config.json file are correct.')
    sys.exit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/QueryAll', methods = ['POST'])
def Route_query_all():
    """ Query all data """
    obj = request.json
    json = query_all(params = obj, conn = conn, cursor = cursor)
    return jsonify(json)

@app.route('/QueryAll_Count', methods = ['POST'])
def Route_query_all_count():
    """ Query all data """
    obj = request.json
    json = query_all(params = obj, conn = conn, cursor = cursor)
    return jsonify(json)

@app.route('/GetCluster', methods = ['POST'])
def Route_get_cluster():
    obj = request.json 
    json = query_clustering(params = obj)
    return jsonify(json)

@app.route('/GetMutualInfo', methods = ['POST'])
def Route_get_metual_info():
    obj = request.json
    json = query_get_mutual_info(params = obj, conn = conn, cursor = cursor)
    return jsonify(json)


@app.route('/GetCountInfo', methods = ['POST'])
def Route_get_count_info():
    obj = request.json
    json = query_get_count_info(params = obj, conn = conn, cursor = cursor)
    return jsonify(json)

@app.route('/GetTsne', methods = ['POST'])
def Route_get_tsne():
    obj = request.json
    json = query_get_tsne(params = obj, conn = conn, cursor = cursor)
    return jsonify(json)

if __name__ == '__main__':
    print('Running local server at: http://127.0.0.1:8085/')
    # app.run(host = "0.0.0.0", port = 8888)
    app.run(host = "127.0.0.1", port = 8085)