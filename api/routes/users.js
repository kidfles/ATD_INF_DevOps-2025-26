var express = require('express');
var router = express.Router();
const { db } = require('../services/database');

/* GET users listing. */
router.get('/', async function (req, res) {
  let users = await db.collection('users').find().toArray();
  res.json(users);
});

router.post('/', async function (req, res) {
  const result = await db.collection('users').insertOne(req.body);
  res.json(result);
});

module.exports = router;