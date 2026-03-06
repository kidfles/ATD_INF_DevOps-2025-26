var express = require('express');
var router = express.Router();

const { MongoClient } = require("mongodb");
// Connection URI
const uri = "mongodb://mydatabase:27017";

const client = new MongoClient(uri);
db = client.db("mydb");

/* GET users listing. */
router.get('/', async function (req, res, next) {
  let users = await db.collection('users').find().toArray();
  res.json(users);
});

router.post('/', function (req, res, next) {
  res.json(db.collection('users').insertOne(req.body));
})

module.exports = router;