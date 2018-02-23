var express = require('express');
var router = express.Router();
var parser = require('../parser.js');
var parse = parser.parse;
/* GET users listing. */
router.get('/', function(req, res, next) {
    var errors = [];
    res.send(JSON.stringify(parse(errors,req.query.parse)));
});

module.exports = router;