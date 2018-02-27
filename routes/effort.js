var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('effort', { title: 'CS 3250 Effort Value Calculator' });
});

module.exports = router;