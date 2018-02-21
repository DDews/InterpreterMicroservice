var express = require('express');
var router = express.Router();
var parser = require('../parser.js');
var parse = parser.parse;
var execute = parser.execute;
var lex = require('../lexer.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
    if (req.query.exec != null) {
        res.send(JSON.stringify(execute(JSON.parse(req.query.exec))));
    } else if (req.query.eval != null) {
        var input = req.query.eval;
        var tokens = lex(input);
        var node = parse(tokens);
        console.log(JSON.stringify(node));
        var json = JSON.stringify(execute(node));
        res.send(json);
    }
});

module.exports = router;