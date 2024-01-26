from flask import render_template, jsonify, send_file
from flask import current_app as app
from application.jobs import tasks
from application.jobs.tasks import exportProducts
from application.jobs.workers import celery


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route('/download-products', methods=["GET"])
def download_products():
    task = exportProducts.delay()
    return jsonify({"task-id": task.id})


@app.route('/get-products/<task_id>', methods=["GET"])
def get_products(task_id):
    res = celery.AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 425
