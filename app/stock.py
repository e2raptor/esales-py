from lib.flask import render_template, jsonify, json, request, redirect
from app import app

@app.route('/inventario')
def inventario():
    data = {'stock':'active'}
    return render_template("stock.html",data=data)
