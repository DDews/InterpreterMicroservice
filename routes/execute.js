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
        var vars = {};
        if (req.query.vars != null) vars = req.query.vars;
        var input = req.query.eval;
        var errors = [];
        var tokens = lex(errors,input);
        if (errors.length > 0) {
            errors.unshift("Input: " + input);
            res.send(JSON.stringify(errors));
        } else {
            var node = parse(errors, tokens);
            var json = JSON.stringify("{}");
            if (errors.length > 0) { errors.unshift("Input: " + input); res.send(JSON.stringify(errors)); }
            else {
                console.log(JSON.stringify([vars, node]));
                var ret = execute(errors,node,vars);
                json = JSON.stringify([vars,ret]);
                if (errors.length > 0 || ret == null) {
                    errors.unshift("Input: " + input);
                    json = JSON.stringify(errors);
                }
                res.send(json);
            }
        }
    }
});

module.exports = router;