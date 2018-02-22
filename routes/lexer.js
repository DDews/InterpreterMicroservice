var express = require('express');
var router = express.Router();
var lex = require('../lexer.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
    var errors = [];
    var ret = lex(errors,req.query.lex);
    if (errors.length > 0) {
        errors.unshift("Input: " + input);
        res.send(JSON.stringify(errors));
    }
    else res.send(ret);
});

module.exports = router;
