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
qr_data[qr_data.columns[-4:]] /= 10000
qr_data['date'] = qr_data['hp_settle_dt'].dt.strftime("%y-%m-%d")
accurancy = 2
app_id = ['00250001', '49995042', '49993001', '49990012', '49990000','49995001', '49993061', '49993047', '49993102', '49995077','49993099', '49993100', '49993062', '49995106', '49993003', '49990010', '49995052', '49993053', '49995238', '49993101', '49993030', '49995110', '49995154', '49993078', '49995112', '49995124', '49993075', '49995123', '49993083', '49995133', '49993079', '49995153', '49995229', '49990028', '49995002', '03010000', '49999801', '49995241', '49993058', '49993032', '49993027', '49993064', '49995259', '49990242', '49995012', '49990015', '63010000', '49995049', '49993054', '49990013']
date_array = np.sort( qr_data['hp_settle_dt'].unique() )



@bp.route("/daily", methods=('POST', 'GET'))
def qr_index():
    return render_template("qr/qr_daily.html")



@bp.route("/total", methods=('POST', 'GET'))
def qr_total():
    daily_data = qr_data.groupby('date', as_index=False).sum()
    daily_data = daily_data.round(accurancy)
    return jsonify( daily_data.to_dict(orient='list') )


@bp.route("/product", methods=('POST', 'GET'))
def qr_product():
    product = qr_data.pivot_table(index='date', columns='order_type', values='trans_num', aggfunc=np.sum).round(accurancy).reset_index()
    return jsonify( product.to_dict(orient='list') )


@bp.route("/branch", methods=('POST', 'GET'))
def qr_branch():
    branch = qr_data.groupby(['date', 'app_ins_id_cd', 'card_attr'], as_index=False).sum()


@bp.route("/app", methods=('POST', 'GET'))
def qr_app():
    sp_app = qr_data.loc[ (qr_data['app_ins_id_cd'].isin(app_id[:5])) & (qr_data['hp_settle_dt'].isin(date_array[-2:])) ]
    # product = sp_app.groupby(['date', 'app_ins_id_cd', 'card_attr'], as_index=False).sum().round(accurancy)
    product = sp_app.pivot_table(index='date', columns=['app_ins_id_cd', 'card_attr'], values='trans_num', aggfunc=np.sum).round(accurancy)
    app_sort = sp_app.pivot_table(index='date', columns='app_ins_id_cd', values='trans_num', aggfunc=np.sum).round(accurancy)
    app_sort = app_sort.sort_values(by=app_sort.index[-1], axis=1, ascending=False)
    product = product[ app_sort.columns ]
    return jsonify( product.to_dict(orient='split') )

