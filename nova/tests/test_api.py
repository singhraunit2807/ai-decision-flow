from fastapi.testclient import TestClient

from nova.app import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "NOVA"


def test_intent_endpoint():
    response = client.post("/intent", json={"text": "I want to cancel my dentist appointment"})
    assert response.status_code == 200
    assert response.json()["action"] == "cancel"
    assert response.json()["service"] == "dentist"
