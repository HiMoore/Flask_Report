from flask import Flask, request, render_template, jsonify, Blueprint
import json
import pandas as pd
import numpy as np


from flask_server.auth import login_required
from flask_server.blog import get_db


bp = Blueprint("qr", __name__, url_prefix='/qr')

# ==================== Read Data File ====================
dtype = {'acq_ins_id_cd':'object', 'app_ins_id_cd':'object', 'order_type':'object', 'trans_tp':'object', 'resp_cd':'object', 'card_attr':'object'}
qr_data = pd.read_csv("instance/qr_data/qr_daily.csv", dtype=dtype, parse_dates=['hp_settle_dt'])
cd2app = pd.read_csv("instance/qr_data/cd2app.csv", dtype='object')
del qr_data['app_nm']
qr_data[qr_data.columns[-4:]] /= 10000
qr_data['date'] = qr_data['hp_settle_dt'].dt.strftime("%y-%m-%d")
qr_data = pd.merge(qr_data, cd2app, on='app_ins_id_cd', how='left')
accurancy, date_n = 2, -8
app_id = ['00250001', '49995042', '49993001', '49990012', '49990000','49995001', '49993061', '49993047', '49993102', '49995077','49993099', '49993100', '49993062', '49995106', '49993003', '49990010', '49995052', '49993053', '49995238', '49993101', '49993030', '49995110', '49995154', '49993078', '49995112', '49995124', '49993075', '49995123', '49993083', '49995133', '49993079', '49995153', '49995229', '49990028', '49995002', '03010000', '49999801', '49995241', '49993058', '49993032', '49993027', '49993064', '49995259', '49990242', '49995012', '49990015', '63010000', '49995049', '49993054', '49990013']
date_array = np.sort( qr_data['date'].unique() )



@bp.route("/daily", methods=('POST', 'GET'))
def qr_index():
    return render_template("qr/qr_daily.html")


@bp.route("/kpi", methods=('POST', 'GET'))
def qr_total_kpi():
    if request.method == 'GET':
        date = date_array[-1]
    else:
        date = request.values.get('date')
    date_data = qr_data.query("date < @date")
    total_num = ( date_data['trans_num'].sum() / 10000 ).round(accurancy)
    total_card = ( np.mean(4770.28) ).round(1)
    return jsonify({ 'trans_num':total_num, 'card_num': total_card })


@bp.route("/total", methods=('POST', 'GET'))
def qr_total():
    daily_data = qr_data.groupby('date', as_index=False).sum()
    daily_data = daily_data.round(accurancy)
    return jsonify( daily_data.to_dict(orient='list') )


@bp.route("/product", methods=('POST', 'GET'))
def qr_product():
    product = qr_data.pivot_table(index='date', columns='order_type', values='trans_num', aggfunc=np.sum).round(accurancy).reset_index()
    return jsonify( product.to_dict(orient='list') )


@bp.route("/app", methods=('POST', 'GET'))
def qr_app():
    sp_app = qr_data.loc[ (qr_data['app_ins_id_cd'].isin(app_id[1:31])) & (qr_data['date'].isin(date_array[date_n:])) ]
    product = sp_app.pivot_table(index=['date', 'card_attr'], columns='app_nm', values='trans_num', aggfunc=np.sum).round(accurancy)
    product = product.unstack().fillna(0)
    app_sort = sp_app.pivot_table(index='date', columns='app_nm', values='trans_num', aggfunc=np.sum).round(accurancy)
    app_sort = app_sort.sort_values(by=app_sort.index[-1], axis=1, ascending=False)
    product = product[ app_sort.columns ]
    return jsonify( product.to_dict(orient='split') )


@bp.route("/oneApp", methods=('POST', 'GET'))
def qr_oneApp():
    if request.method == 'GET':
        app_nm = '云闪付APP'
    else:
        app_nm = request.values.get('app_nm')
    one_app = qr_data.query("app_nm==@app_nm")
    daily_attr = one_app.pivot_table(index='date', columns='card_attr', values='trans_num', aggfunc=np.sum).reset_index().fillna(0.0001)
    daily_total = one_app.groupby('date', as_index=False).sum()
    daily_attr = pd.concat([daily_attr, daily_total], axis=1).round(accurancy)
    return jsonify( daily_attr.to_dict( orient='list' ) )


@bp.route("/branch", methods=('POST', 'GET'))
def qr_branch():
    sp_branch = qr_data.loc[ (qr_data['app_ins_id_cd'].isin(app_id[1:36])) & (qr_data['date'].isin(date_array[date_n:])) ]
    branch = sp_branch.pivot_table(index=['date', 'card_attr'], columns='app_nm', values='trans_num', aggfunc=np.sum).round(accurancy)
    branch = branch.unstack().fillna(0)
    branch_sort = sp_branch.pivot_table(index='date', columns='app_nm', values='trans_num', aggfunc=np.sum).round(accurancy)
    branch_sort = branch_sort.sort_values(by=branch_sort.index[-1], axis=1, ascending=False)
    branch = branch[ branch_sort.columns ]
    return jsonify( branch.to_dict(orient='split') )


@bp.route("/oneBranch", methods=('POST', 'GET'))
def qr_oneBranch():
    if request.method == 'GET':
        branch_nm = '云闪付APP'
    else:
        branch_nm = request.values.get('branch_nm')
    one_branch = qr_data.query("app_nm==@branch_nm")
    daily_attr = one_branch.pivot_table(index='date', columns='card_attr', values='trans_num', aggfunc=np.sum).reset_index().fillna(0.0001)
    daily_total = one_branch.groupby('date', as_index=False).sum()
    daily_attr = pd.concat([daily_attr, daily_total], axis=1).round(accurancy)
    return jsonify( daily_attr.to_dict( orient='list' ) )
