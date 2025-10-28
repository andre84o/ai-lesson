from flask import Flask, render_template, request, jsonify
from pathlib import Path
from typing import Dict, List

from src.search_engine import load_cities, search_city

APP = Flask(__name__, template_folder=str(Path(__file__).parent / 'templates'))


def build_country_map(cities_file: str) -> Dict[str, List[str]]:
    rows = load_cities(cities_file)
    country_map = {}
    for r in rows:
        country_map.setdefault(r['country'], []).append(r['city'])
    return country_map


@APP.route('/')
def index():
    country_map = build_country_map('data/cities.csv')
    # Sort countries and cities for nicer UI
    country_map = {k: sorted(v) for k, v in sorted(country_map.items())}
    return render_template('index.html', country_map=country_map)


@APP.route('/api/search', methods=['GET', 'POST'])
def api_search():
    if request.method == 'POST':
        body = request.get_json() or {}
        country = body.get('country')
        city = body.get('city')
        radius = int(body.get('radius') or 10000)
        limit = int(body.get('limit') or 50)
    else:
        country = request.args.get('country')
        city = request.args.get('city')
        radius = int(request.args.get('radius') or 10000)
        limit = int(request.args.get('limit') or 50)

    if not country or not city:
        return jsonify({'error': 'country and city required'}), 400

    try:
        res = search_city(country, city, radius=radius, limit=limit)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify(res)


if __name__ == '__main__':
    APP.run(host='127.0.0.1', port=5000, debug=True)
