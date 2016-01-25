from lib.flask import render_template, jsonify, json, request, redirect
from app import app

user_list = [  # fake array of users
        { 'id':1, 'name':'Eduardo Pina Fonseca', 'phone': '0967856056'},
        { 'id':2, 'name':'Yaima Garcia Garcia', 'phone': '0967856056'},
        { 'id':3, 'name':'Alicia Fonseca Sanchez', 'phone': '53404496'},
        { 'id':4, 'name':'Manuel Pina Sanchez', 'phone': '53404496'},
]

@app.route('/')
@app.route('/index')
def index():
    server = 'http://localhost:5000/'
    return render_template("index.html",server=server)

@app.route('/ventas')
def ventas():
    server = 'http://localhost:5000/'
    return render_template("ventas.html",server=server)

@app.route('/clientes')
def clientes():
    return render_template("clientes.html")

@app.route('/productos')
def productos():
    return render_template("productos.html")

@app.route('/users')
def users():
    return jsonify({'users':user_list})

@app.route('/add_user', methods=['POST'])
def add_user():
    data = json.loads(request.data.decode())
    data['id'] = 1
    if user_list:
        data['id']= user_list[-1]['id'] + 1
    user_list.append(data)
    return jsonify(data)

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = [user for user in user_list if user['id'] == user_id]
    if user:
        user_list.remove(user[0])
    return jsonify({'result': True})
