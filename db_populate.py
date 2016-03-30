#!/usr/bin/python
from lib.flask_sqlalchemy import SQLAlchemy
from app import db,clients,products

#Create the database
db.create_all()

#Populate some products
db.session.add(products.Product(code = '00001', description = 'Coca Cola', sell_price = 1.50,
                                  purchase_price = 1, maj_price = 1.20, has_stock = True,
                                  iva = True, quantity = 30, min_stock = 10))
db.session.add(products.Product(code = '00002', description = 'Coca Cola Light', sell_price = 1.80,
                                  purchase_price = 1, maj_price = 1.20, has_stock = True,
                                  iva = True, quantity = 30, min_stock = 10))
db.session.add(products.Product(code = '00003', description = 'Jugo Tamy', sell_price = 1.50,
                                  purchase_price = 1, maj_price = 1.20, has_stock = True,
                                  iva = True, quantity = 30, min_stock = 10))
db.session.add(products.Product(code = '00004', description = 'Galletas Oreo', sell_price = 0.50,
                                  purchase_price = 1, maj_price = 1.20, has_stock = True,
                                  iva = True, quantity = 30, min_stock = 10))
db.session.add(products.Product(code = '00005', description = 'Manzanas', sell_price = 1.00,
                                  purchase_price = 1, maj_price = 1.20, has_stock = True,
                                  iva = True, quantity = 30, min_stock = 10))
db.session.add(products.Product(code = '00006', description = 'Peras', sell_price = 1.00,
                                  purchase_price = 1, maj_price = 1.20, has_stock = True,
                                  iva = True, quantity = 30, min_stock = 10))
db.session.add(products.Product(code = '00007', description = 'Regargas Claro', sell_price = 0.50,
                                  purchase_price = 1, maj_price = 1.20, has_stock = False,
                                  iva = False, quantity = 0, min_stock = 0))
db.session.add(products.Product(code = '00008', description = 'Tomates', sell_price = 0.50,
                                  purchase_price = 1, maj_price = 1.20, has_stock = True,
                                  iva = True, quantity = 30, min_stock = 10))

#Some clientes
db.session.add(clients.Client(name = 'Eduardo Pina Fonseca', vat = 'I46969', vat_type = 'pas', credit_limit = 1000))
db.session.add(clients.Client(name = 'Yaima Garcia Garcia', vat = 'I46958', vat_type = 'pas', credit_limit = 1000))
db.session.add(clients.Client(name = 'Leonardo Uria Sanchez', vat = '9032212', vat_type = 'ced', credit_limit = 1000))
db.session.add(clients.Client(name = 'Roberto Macias Mederos', vat = '992312912312', vat_type = 'ruc', credit_limit = 1000))


#Commit everything
db.session.commit()


