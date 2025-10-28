from src.search_engine import load_cities


def test_load_cities():
    cities = load_cities('data/cities.csv')
    assert isinstance(cities, list)
    assert any(c['city'] == 'Milan' for c in cities)
