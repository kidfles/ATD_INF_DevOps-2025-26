require("dotenv").config();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "mydb";

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
});

client.connect()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err));

const db = client.db(dbName);

module.exports = { db, client };