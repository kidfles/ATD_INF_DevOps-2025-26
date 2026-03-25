var express = require('express');
var router = express.Router();

/* GET audit logs */
router.get('/', async function (_req, res) {
  res.json([]);
});

/* POST audit log */
router.post('/', async function (_req, res) {
  res.status(201).json({});
});

module.exports = router;
