var express = require('express');
var router = express.Router();
const { db } = require('../services/database');

/* GET audit logs */
router.get('/', async function (req, res) {
  const filter = {};
  if (req.query.action) {
    filter.action = req.query.action;
  }
  const logs = await db.collection('audit-logs').find(filter).toArray();
  res.json(logs);
});

/* POST audit log */
router.post('/', async function (req, res) {
  if (!req.body.action) {
    return res.status(400).json({ error: 'action is verplicht' });
  }

  const entry = {
    action: req.body.action,
    data: req.body.data || {},
    timestamp: new Date().toISOString()
  };

  const result = await db.collection('audit-logs').insertOne(entry);
  res.status(201).json({ _id: result.insertedId, ...entry });
});

module.exports = router;
