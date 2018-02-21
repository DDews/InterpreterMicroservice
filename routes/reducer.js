var express = require('express');
var router = express.Router();
var parser = require('../parser.js');
var reduce = parser.reduce;
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send(reduce(JSON.parse(req.query.reduce)));
});

module.exports = router;