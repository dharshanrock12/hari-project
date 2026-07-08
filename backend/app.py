import os
from datetime import datetime
from functools import wraps

from bson import ObjectId
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import check_password_hash, generate_password_hash

# Load .env file
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())

app = Flask(__name__)

CORS(app, origins=["http://localhost:3000"])

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "assessment_db")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db["users"]
items_collection = db["items"]
tokens_collection = db["tokens"]


def get_user_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    token_doc = tokens_collection.find_one({"token": token})
    if not token_doc:
        return None
    return users_collection.find_one({"_id": ObjectId(token_doc["user_id"])})


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_user_from_token()
        if not user:
            return jsonify({"error": "Please login first"}), 401
        return f(user, *args, **kwargs)

    return decorated


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or len(name) < 2:
        return jsonify({"error": "Name must be at least 2 characters"}), 400
    if not email or "@" not in email:
        return jsonify({"error": "Please enter a valid email"}), 400
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    user = {
        "name": name,
        "email": email,
        "password": generate_password_hash(password),
        "created_at": datetime.utcnow(),
    }
    result = users_collection.insert_one(user)

    return jsonify({"message": "Registration successful", "user_id": str(result.inserted_id)}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = str(ObjectId())
    tokens_collection.insert_one({
        "token": token,
        "user_id": str(user["_id"]),
        "created_at": datetime.utcnow(),
    })

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]},
    })


@app.route("/api/logout", methods=["POST"])
@login_required
def logout(user):
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        tokens_collection.delete_one({"token": auth[7:]})
    return jsonify({"message": "Logged out successfully"})


@app.route("/api/items", methods=["GET"])
@login_required
def get_items(user):
    items = list(items_collection.find({"user_id": str(user["_id"])}))
    for item in items:
        item["_id"] = str(item["_id"])
    return jsonify(items)


@app.route("/api/items", methods=["POST"])
@login_required
def create_item(user):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()

    if not title:
        return jsonify({"error": "Title is required"}), 400
    if len(title) > 100:
        return jsonify({"error": "Title must be under 100 characters"}), 400

    item = {
        "title": title,
        "description": description,
        "user_id": str(user["_id"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = items_collection.insert_one(item)
    item["_id"] = str(result.inserted_id)
    return jsonify(item), 201


@app.route("/api/items/<item_id>", methods=["PUT"])
@login_required
def update_item(user, item_id):
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        return jsonify({"error": "Invalid item ID"}), 400

    item = items_collection.find_one({"_id": obj_id, "user_id": str(user["_id"])})
    if not item:
        return jsonify({"error": "Item not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    title = data.get("title", "").strip()
    description = data.get("description", "").strip()

    if not title:
        return jsonify({"error": "Title is required"}), 400
    if len(title) > 100:
        return jsonify({"error": "Title must be under 100 characters"}), 400

    items_collection.update_one(
        {"_id": obj_id},
        {"$set": {"title": title, "description": description, "updated_at": datetime.utcnow()}},
    )

    updated = items_collection.find_one({"_id": obj_id})
    updated["_id"] = str(updated["_id"])
    return jsonify(updated)


@app.route("/api/items/<item_id>", methods=["DELETE"])
@login_required
def delete_item(user, item_id):
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        return jsonify({"error": "Invalid item ID"}), 400

    result = items_collection.delete_one({"_id": obj_id, "user_id": str(user["_id"])})
    if result.deleted_count == 0:
        return jsonify({"error": "Item not found"}), 404

    return jsonify({"message": "Item deleted successfully"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
