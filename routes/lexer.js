var express = require('express');
var router = express.Router();
var lex = require('../lexer.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send(lex(req.query.lex));
});

module.exports = router;
