var express = require('express');
var router = express.Router();
const { db } = require('../services/database');
const { publish } = require('../services/rabbitmq');

/* GET users listing. */
router.get('/', async function (req, res) {
  let users = await db.collection('users').find().toArray();
  res.json(users);
});

router.post('/', async function (req, res) {
  const result = await db.collection('users').insertOne(req.body);

  publish('audit-logs', {
    action: 'user.created',
    data: req.body,
    timestamp: new Date().toISOString()
  }).catch(() => {});

  res.json(result);
});

module.exports = router;