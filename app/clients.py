# encoding=utf8  
from lib.flask import render_template, jsonify, json, request, redirect
from app import app
from app import db

#=======CLASS MODEL=========================
class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    vat_type = db.Column(db.String(10))
    vat = db.Column(db.String(64), index=True, unique=True)
    credit_limit = db.Column(db.Float)

    def get_dict(self):
        obj = self.__dict__
        if obj.has_key('_sa_instance_state'):
            obj.pop('_sa_instance_state')
        return obj

    def __repr__(self):
        return '%r' % (self.name)

@app.route('/clientes')
def clients():
    data = {'client':'active'}
    return render_template("clientes.html", data=data)

@app.route('/clientes/get')
def get_clients():
    clients = [c.get_dict() for c in Client.query.all()]
    return jsonify({'clients':clients})

#Crear un nuevo cliente
@app.route('/clientes/add', methods=['POST'])
def add_client():
    data = json.loads(request.data.decode('utf-8'))
    client = Client.query.filter_by(vat=data['vat']).first()
    if client:
        return jsonify({'code_exists':True})
    c = Client(
            name = data['name'],
            vat_type = data['vat_type'],
            vat = data['vat'],
            credit_limit = data.get('credit_limit', False) and data['credit_limit'] or 0,
            )
    db.session.add(c)
    db.session.commit()
    clients = [c.get_dict() for c in Client.query.all()]
    return jsonify({'clients':clients})

#Modificar un nuevo cliente
@app.route('/clientes/update', methods=['POST'])
def update_client():
    data = json.loads(request.data.decode('utf-8'))
    client = Client.query.filter_by(id=data['id']).first()
    check_cl = Client.query.filter_by(vat=data['vat']).first()
    if check_cl:
        #Check if is not the same client
        if check_cl.id != client.id:
            return jsonify({'code_exists':True})
    client.name = data['name']
    client.vat_type = data['vat_type']
    client.vat = data['vat']
    client.credit_limit = data['credit_limit']
    db.session.commit()
    clients = [c.get_dict() for c in Client.query.all()]
    return jsonify({'clients':clients})

#Obtener un unico cliente dado su id
@app.route('/clientes/<int:cid>')
def get_client(cid):
    c = Client.query.filter_by(id=cid).first()
    c = c.get_dict() if c else False
    return jsonify({'client':c})

#Eliminar un cliente dado su id
@app.route('/clientes/<int:cid>', methods=['DELETE'])
def delete_client(cid):
    c = Client.query.filter_by(id=cid).first()
    db.session.delete(c)
    db.session.commit()
    return jsonify({'result': True})

