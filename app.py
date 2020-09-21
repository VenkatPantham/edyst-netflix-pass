from flask import Flask, jsonify, json, g, request
from flask_cors import CORS

# Initializing App
app = Flask(__name__)
CORS(app)

app.config["JSON_SORT_KEYS"] = False


def get_series(title=None):
    series = getattr(g, "series", None)
    if series is None:
        with open("netflix.json") as data:
            series = json.load(data)
        g.series = series
    if title:
        title = title.lower()
        series = [
            movie for movie in series if title in movie["title"]
        ]
    return series


@app.route("/", methods=["GET"])
def index():
    title =  request.args.get('title')
    if title:
        series = get_series(title)
    else:
        series = get_series()
    if len(series):
        return jsonify(series), 200
    return jsonify("No series found with this title"), 404


if __name__ == "__main__":
    app.run(debug=True)