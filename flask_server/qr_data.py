from flask import Flask, request, render_template, jsonify, Blueprint
import json
import pandas as pd


from flask_server.auth import login_required
from flask_server.blog import get_db


bp = Blueprint("qr", __name__)

# ==================== Read Data File ====================
qr_daily= pd.read_csv("instance/qr_data/qr_total.csv", parse_dates=['hp_settle_dt'])



@bp.route("/total", methods=('POST', 'GET'))
def qr_total():
    global qr_daily
    data = {"trans_num": int(qr_daily[' trans_num'].values[0])}
    return jsonify(data)
