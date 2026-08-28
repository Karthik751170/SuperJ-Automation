import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("MONGODB_DB_NAME", "aura_db")

# Local in-memory mock database fallback if MongoDB server is offline
import uuid

class InMemoryCollection:
    def __init__(self):
        self._data = []

    def create_index(self, *args, **kwargs):
        pass

    def find(self, query=None):
        if not query:
            return self._data
        res = []
        for doc in self._data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                res.append(doc)
        return res

    def find_one(self, query):
        res = self.find(query)
        return res[0] if res else None

    def insert_one(self, doc):
        if "_id" not in doc:
            doc["_id"] = f"mem_id_{uuid.uuid4().hex[:10]}"
        self._data.append(doc)
        return doc

    def update_one(self, filter_query, update_query):
        doc = self.find_one(filter_query)
        if not doc:
            return None
            
        inc_op = update_query.get("$inc", {})
        push_op = update_query.get("$push", {})
        set_op = update_query.get("$set", {})
        
        # Emulate $inc
        for key, val in inc_op.items():
            doc[key] = doc.get(key, 0) + val
            
        # Emulate $push
        for key, val in push_op.items():
            if key not in doc:
                doc[key] = []
            doc[key].append(val)

        # Emulate $set
        for key, val in set_op.items():
            doc[key] = val
            
        return doc

class InMemoryDatabase:
    def __init__(self):
        self.users = InMemoryCollection()
        self.payment_requests = InMemoryCollection()

    def __getattr__(self, name):
        # Auto-create collection object if not pre-declared
        collection = InMemoryCollection()
        setattr(self, name, collection)
        return collection

in_memory_db = InMemoryDatabase()

# Try connecting to the MongoDB daemon
try:
    # Fail fast after 1.5 seconds if MongoDB is offline
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1500)
    # Ping admin command to trigger connection handshake check
    client.admin.command('ping')
    db = client[DATABASE_NAME]
    db.users.create_index("email", unique=True)
    print("SUCCESS: Connected to MongoDB instance. Persisting user documents.")
except (ServerSelectionTimeoutError, Exception) as e:
    print(f"WARNING: MongoDB offline ({e}). Initializing secure on-demand in-memory database.")
    db = in_memory_db

def get_db():
    """Returns connection-ready Database instance (MongoDB or InMemory fallback)."""
    yield db
