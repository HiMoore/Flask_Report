from flask import Flask, request, render_template, jsonify, Blueprint
import json
import pandas as pd
import numpy as np


from flask_server.auth import login_required
from flask_server.blog import get_db


bp = Blueprint("qr", __name__, url_prefix='/qr')

# ========================= Read Data File =========================
# ------------------- QR Total Trans_num Daily --------------------
dtype = {'acq_ins_id_cd':'object', 'app_ins_id_cd':'object', 'order_type':'object', 'trans_tp':'object', 'resp_cd':'object', 'card_attr':'object'}
header = pd.read_csv("instance/qr_data/bk_ysfdb.tbl_bkysf_CSQR_DailyTotal_y_dtl_01424443.tar.gz", nrows=1).columns
names = [ ele.split(".")[1] for ele in header ]
qr_total = pd.read_csv("instance/qr_data/bk_ysfdb.tbl_bkysf_CSQR_DailyTotal_y_dtl_01424443.tar.gz", skiprows=1, header=None, names=names, dtype=dtype, parse_dates=['hp_settle_dt'])
qr_total['date'] = qr_total['hp_settle_dt'].dt.strftime("%Y-%m-%d")
qr_total = qr_total.rename(columns={'tbl_bkysf_CSQR_DailyTotal_y_dtl_01424443': 'buss_type'})
qr_total[ names[2:] ] = qr_total[ names[2:] ].fillna(0)
qr_total[ names[4:] ] /= 10000
qr_total = qr_total.query("app_flag=='other'")

# ------------------ QR Active Card Num Monthly -------------------
qrCard = pd.read_csv("instance/qr_data/qrCard_Monthly.csv")
qrCard['total'] = qrCard[['借记卡', '贷记卡']].sum(axis=1)
qrCard = qrCard.query("月份>='2019-01'")

# ------------------------ QR APP Data -------------------------
qr_app = pd.read_csv("instance/qr_data/qrAPP_2019.csv", dtype=dtype, parse_dates=['hp_settle_dt'])
qr_app['date'] = qr_app['hp_settle_dt'].dt.strftime("%Y-%m-%d")
qr_app.loc[ ~qr_app['card_attr'].isin(['02', '03']), 'card_attr' ] = '借记卡'
qr_app.loc[ qr_app['card_attr'].isin(['02', '03']), 'card_attr' ] = '贷记卡'
qr_app = qr_app.query("app_ins_id_cd!='49990451'").fillna(0)
app_num = [ 'zs_num', 'bs_num', 'p2p_num', 'yc_num' ]
qr_app['trans_num'] = qr_app[app_num].sum(axis=1)
qr_app['kama_num'] = qr_app.loc[ qr_app['app_ins_id_cd'].str.startswith('499998'), 'trans_num' ]
qr_app = qr_app.fillna(0)
cd2app = pd.read_csv("instance/qr_data/cd2app.csv", dtype='object')
qr_app = pd.merge(qr_app, cd2app, left_on='app_ins_id_cd', right_on='app_id', how='left')
qr_app = qr_app.fillna("N/A")

# ------------------- Constant Variable -------------------------
accurancy, date_n = 2, -8
date_array = np.sort( qr_total['date'].unique() )
agg_list = [ 'trans_num', 'coupon_num', 'coupon_at' ]



@bp.route("/daily", methods=('POST', 'GET'))
def qrf_index():
    return render_template("qr/qr_daily.html")


@bp.route("/kpi", methods=('POST', 'GET'))
def qrf_total_kpi():
    if request.method == 'GET':
        date = date_array[-1]
    else:
        date = request.values.get('date')
    date_data = qr_total.query("date <= @date")
    total_num = ( date_data['trans_num'].sum() / 10000 ).round(accurancy)
    month = date[:7]
    date_card = qrCard.query("月份 <= @month")
    total_card = round( date_card['total'].mean(), 1 )
    return jsonify({ 'trans_num':total_num, 'card_num': total_card })


@bp.route("/total", methods=('POST', 'GET'))
def qrf_total():
    daily_type = qr_total.pivot_table(index='date', columns='trans_type', values=['trans_num', 'coupon_num', 'coupon_at'], aggfunc=np.sum)
    daily_data = pd.DataFrame(columns=['trans_num', 'coupon_num', 'coupon_at', 'reverse_num'])
    daily_data['trans_num'] = daily_type['trans_num']['正向交易'] - daily_type['trans_num']['反向交易']
    daily_data['coupon_num'] = daily_type['coupon_num']['正向交易'] - daily_type['coupon_num']['反向交易']
    daily_data['coupon_at'] = daily_type['coupon_at']['正向交易'] - daily_type['coupon_at']['反向交易']
    daily_data['reverse_num'] = daily_type['trans_num']['反向交易']
    daily_data = daily_data.round(accurancy).reset_index()
    return jsonify( daily_data.to_dict(orient='list') )


@bp.route("/product", methods=('POST', 'GET'))
def qrf_product():
    product_list = ['zs_num', 'bs_num', 'p2p_num', 'yc_num', 'xw_num', 'ks_num', 'kama_num', 'hym_num']
    product = qr_app.groupby(['date', 'trans_type'])[product_list].sum().unstack() / 10000
    product_result = pd.DataFrame(columns=product_list)
    for col in product_list:
        product_result[ col ] = product[col]['正向交易'] - product[col]['反向交易']
    product = product_result.round(2).reset_index()
    return jsonify( product.to_dict(orient='list') )


@bp.route("/app", methods=('POST', 'GET'))
def qrf_app():
    app_sort = qr_app.pivot_table(index='date', columns='app_nm', values='trans_num', aggfunc=np.sum).round(accurancy)
    app_sort = app_sort.sort_values(by=app_sort.index[-1], axis=1, ascending=False)
    app_attr = qr_app.pivot_table(index=['date', 'card_attr', 'trans_type'], columns=['app_nm'], values='trans_num', aggfunc=np.sum).unstack().fillna(0)
    app_attrs = pd.DataFrame(index=app_attr.index, columns=app_sort.columns)    
    for app in app_sort.columns:
        app_attrs[ app ] = app_attr[ app ]['正向交易'] - app_attr[ app ]['反向交易']
    app_result = ( app_attrs[ app_sort.columns[1:31] ].unstack() ) / 10000
    return jsonify( app_result.to_dict(orient='split') )


@bp.route("/oneApp", methods=('POST', 'GET'))
def qr_oneApp():
    if request.method == 'GET':
        app_nm = '云闪付APP'
    else:
        app_nm = request.values.get('app_nm')
    try:
        one_app = qr_app.query("app_nm==@app_nm")
    except Exception:
        print("不能获取该APP的交易数据\n")
    # one_app = one_app.loc[ one_app['date'].isin(date_array[-3:]) ]
    daily_attr = one_app.pivot_table(index=['date', 'card_attr'], columns='trans_type', values='trans_num', aggfunc=np.sum).fillna(0.0001)
    daily_total = one_app.pivot_table(index='date', columns='trans_type', values=agg_list, aggfunc=np.sum)
    if '反向交易' not in daily_attr.columns:
        daily_attr['反向交易'] = 0
        for col in agg_list:
            daily_total[(col, '反向交易')] = 0
    daily_attr['trans_num'] = daily_attr['正向交易'] - daily_attr['反向交易']
    daily_attr = daily_attr.unstack()['trans_num'].fillna(0)
    daily_totals = pd.DataFrame(index=daily_total.index, columns=agg_list)
    for col in agg_list:
        daily_totals[ col ] = daily_total[(col, '正向交易')] - daily_total[(col, '反向交易')]
    daily_attr = ( pd.concat([daily_attr, daily_totals], axis=1) / 10000 ).fillna(0).round(accurancy).reset_index()
    return jsonify( daily_attr.to_dict( orient='list' ) )


#@bp.route("/branch", methods=('POST', 'GET'))
#def qr_branch():
#    sp_branch = qr_data.loc[ (qr_data['app_ins_id_cd'].isin(app_id[1:36])) & (qr_data['date'].isin(date_array[date_n:])) ]
#    branch = sp_branch.pivot_table(index=['date', 'card_attr'], columns='app_nm', values='trans_num', aggfunc=np.sum).round(accurancy)
#    branch = branch.unstack().fillna(0)
#    branch_sort = sp_branch.pivot_table(index='date', columns='app_nm', values='trans_num', aggfunc=np.sum).round(accurancy)
#    branch_sort = branch_sort.sort_values(by=branch_sort.index[-1], axis=1, ascending=False)
#    branch = branch[ branch_sort.columns ]
#    return jsonify( branch.to_dict(orient='split') )
#
#
#@bp.route("/oneBranch", methods=('POST', 'GET'))
#def qr_oneBranch():
#    if request.method == 'GET':
#        branch_nm = '云闪付APP'
#    else:
#        branch_nm = request.values.get('branch_nm')
#    one_branch = qr_data.query("app_nm==@branch_nm")
#    daily_attr = one_branch.pivot_table(index='date', columns='card_attr', values='trans_num', aggfunc=np.sum).reset_index().fillna(0.0001)
#    daily_total = one_branch.groupby('date', as_index=False).sum()
#    daily_attr = pd.concat([daily_attr, daily_total], axis=1).round(accurancy)
#    return jsonify( daily_attr.to_dict( orient='list' ) )
