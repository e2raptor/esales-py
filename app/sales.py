from lib.flask import render_template, jsonify, json, request, redirect
from app import app
from app import db
from app.products import Product

#=======CLASS MODEL=========================
class SaleLine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(64)) 
    description = db.Column(db.Unicode)
    unit_price = db.Column(db.Float)
    quantity = db.Column(db.Float)
    amount = db.Column(db.Float)
    stock = db.Column(db.Integer)
    ticket = db.Column(db.String(2))
    sale_id = db.Column(db.Integer)
    product_id = db.Column(db.Integer)

    def get_dict(self):
        obj = self.__dict__
        if obj.has_key('_sa_instance_state'):
            obj.pop('_sa_instance_state')
        return obj

    def __repr__(self):
        return '<Sale Line %r>' % (self.code)

def get_lines():
    #Aqui recordar incluir la sesion activa del usuario
    sales_list = SaleLine.query.filter_by(sale_id=0).all()
    sale_lines_json = {'t'+str(x+1): [] for x in range(10)}
    act_tickets = []
    for l in sales_list:
        act_tickets.append(l.ticket)
        sale_lines_json[l.ticket].append(l.get_dict())
    return {'lines':sale_lines_json, 'act_tickets':act_tickets}

@app.route('/')
@app.route('/index')
def index():
    data = {'server': 'http://localhost:5000/', 'sale':'active'}
    return render_template("ventas.html",data=data)

@app.route('/ventas')
def ventas():
    data = {'server': 'http://localhost:5000/', 'sale':'active'}
    return render_template("ventas.html",data=data)

@app.route('/ventas/form/modificar/linea')
def modify_line():
    data = {'server': 'http://localhost:5000/', 'sale':'active'}
    return render_template("forms/modify_ticket_line.html",data=data)

#Modificar la cantidad del producto
@app.route('/ventas/modificar/linea', methods=['POST'])
def update_line_quantity():
    data = json.loads(request.data.decode('utf-8'))
    line = SaleLine.query.filter_by(id=data['id']).first()
    prod = Product.query.filter_by(id=line.product_id).first()
    #Devuelvo todo lo que se ha usado en esa linea de ese producto
    prod.quantity = line.quantity + prod.quantity
    line.quantity = float(data['qty'])
    line.amount = line.unit_price * float(data['qty'])
    #Actualizo la cantidad del producto en stock restandole la nueva cantidad
    prod.quantity = prod.quantity - float(data['qty'])
    #Y actualizo stock visible en la linea
    line.stock = prod.quantity
    db.session.commit()
    return jsonify(get_lines())

@app.route('/ventas/lineas/get')
def get_sale_lines():
    return jsonify(get_lines())

@app.route('/ventas/lineas/<ticket>/<int:id>')
def get_sale_line(ticket,id):
    c = SaleLine.query.filter_by(ticket=ticket,id=id,sale_id=0).first()
    c = c.get_dict() if c else False
    response = get_lines()
    response.update({'line':c})
    return jsonify(response)

@app.route('/ventas/lineas/add', methods=['POST'])
def add_sale_line():
    data = json.loads(request.data.decode('utf-8'))
    try:
        code,sep,name = data['product'].split(' ', 2)
    except:
        response = get_lines()
        response.update({'incorrect_format':True})
        return jsonify(response)
    prod = Product.query.filter_by(code=code).first()
    #Busca si ya hay una linea registrada con el mismo producto (por codigo)
    line = SaleLine.query.filter_by(ticket=data['active_ticket'], code=code, sale_id =0).first()
    if line:
        response = get_lines()
        response.update({'exists':True})
        return jsonify(response)
    #Si lleva iva
    if prod.quantity < data['quantity']:
        response = get_lines()
        response.update({'no_stock':True})
        return jsonify(response)
    price = prod.sell_price
    if prod.iva:
        price += (prod.sell_price) * 12 / 100
        price = round(price,2)
    sl = SaleLine(
            code = prod.code,
            description = prod.description,
            unit_price = price,
            quantity = data['quantity'],
            amount = price * data['quantity'],
            stock = prod.quantity - data['quantity'],
            product_id = prod.id,
            ticket = data['active_ticket'],
            sale_id = 0
            )
    #El stock se decrementa en el momento, pues aunque queda pendiente
    #se toma como vendido
    prod.quantity = prod.quantity - data['quantity']
    db.session.add(sl)
    db.session.commit()
    #Guardo mi lista con las lineas creadas
    return jsonify(get_lines())


@app.route('/ventas/lineas/<ticket>/<int:line_id>', methods=['DELETE'])
def delete_sale_line(ticket, line_id):
    line = SaleLine.query.filter_by(id=line_id).first()
    prod = Product.query.filter_by(id=line.product_id).first()
    #Actualizo el stock automaticamente
    prod.quantity = prod.quantity + line.quantity
    db.session.delete(line)
    db.session.commit()
    return jsonify(get_lines())

@app.route('/ventas/ticket/<ticket>', methods=['DELETE'])
def delete_ticket(ticket):
    ticket_lines = SaleLine.query.filter_by(ticket=ticket,sale_id=0).all()
    if ticket_lines:
        for tl in ticket_lines:
            prod = Product.query.filter_by(id=tl.product_id).first()
            #Actualizo el stock automaticamente
            prod.quantity = prod.quantity + tl.quantity
            db.session.delete(tl)
    db.session.commit()
    return jsonify(get_lines())
