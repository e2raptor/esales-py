# encoding=utf8  
from lib.flask import render_template, jsonify, json, request, redirect
from app import app
from app import db

#=======CLASS MODEL=========================
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(64), index=True, unique=True)
    description = db.Column(db.Unicode)
    sell_price = db.Column(db.Float)
    purchase_price = db.Column(db.Float)
    has_stock = db.Column(db.Boolean)
    iva = db.Column(db.Boolean)
    maj_price = db.Column(db.Float)
    quantity = db.Column(db.Float)
    min_stock = db.Column(db.Float)

    def get_dict(self):
        obj = self.__dict__
        if obj.has_key('_sa_instance_state'):
            obj.pop('_sa_instance_state')
        return obj

    def __repr__(self):
        return '<Product %r>' % (self.code)

#========REQUEST AND ROUTING HANDLERS======================
@app.route('/productos')
def productos():
    data = {'product':'active'}
    return render_template("products.html", data=data)

@app.route('/productos/get')
def get_products():
    product_list = [p.get_dict() for p in Product.query.all()]
    return jsonify({'products':product_list})

@app.route('/productos/get/description')
def get_products_description():
    product_list = [p.code+" - "+p.description for p in Product.query.all()]
    return jsonify({'products':product_list})

@app.route('/productos/get/code')
def get_products_codes():
    product_list = [p.code for p in Product.query.all()]
    return jsonify({'products':product_list})

#Crear un nuevo producto
@app.route('/productos/add_product', methods=['POST'])
def add_product():
    data = json.loads(request.data.decode('utf-8'))
    prod = Product.query.filter_by(code=data['code']).first()
    if prod:
        return jsonify({'code_exists':True})
    p = Product(
            code = data['code'],
            description = data['description'],
            sell_price = data.get('sell_price',False) and data['purchase_price'] or 0,
            purchase_price = data.get('purchase_price', False) and data['purchase_price'] or 0,
            maj_price = data.get('maj_price',False) and data['maj_price'] or 0,
            has_stock = data.get('has_stock',False),
            iva = data.get('iva',False),
            quantity = data.get('quantity',False) and data['quantity'] or 0,
            min_stock = data.get('min_stock', False) and data['min_stock'] or 0
            )
    db.session.add(p)
    db.session.commit()
    product_list = [p.get_dict() for p in Product.query.all()]
    return jsonify({'products':product_list})

#Obtener un unico producto dado su id
@app.route('/productos/<int:prod_id>')
def get_product(prod_id):
    prod = Product.query.filter_by(id=prod_id).first()
    prod = prod.get_dict() if prod else False
    return jsonify({'product':prod})

#Eliminar un product dado su id
@app.route('/productos/<int:prod_id>', methods=['DELETE'])
def delete_product(prod_id):
    # prod = [prod for prod in product_list if prod['id'] == prod_id]
    # if prod:
        # product_list.remove(prod[0])
    prod = Product.query.filter_by(id=prod_id).first()
    db.session.delete(prod)
    db.session.commit()
    return jsonify({'result': True})

