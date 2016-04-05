# encoding=utf8  
from lib.flask import render_template, jsonify, json, request, redirect
from app import app
from app import db
from app.sale_lines import SaleLine

@app.route('/cobrar', methods=['GET'])
def charge():
    ticket = request.args.get('ticket')
    lines = SaleLine.query.filter_by(ticket=ticket,sale_id=0).all()
    amount = 0
    for line in lines:
        amount += line.amount
    data = {'sale':'active', 'amount':amount}
    return render_template("charge.html", data=data)
