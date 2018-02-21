Array.prototype.remove = function(index) {
    var x = this[index];
    this.splice(index,1);
    return x;
};
Array.prototype.get = function(index) {
    return this[index];
}
function isMult(x) {
    return x.length == 1 && x.match(/[\*\/\%]/g);
}
functions = {};
UNKNOWN = "UNKOWN";
WORD = "WORD";
NUMBER = "NUMBER";
MULTDIV = "MULTDIV";
TERM = "TERM";
EXPRESSION = "EXPRESSION";
EXPRESSIONS = "EXPRESSIONS";
VECTOR = "VECTOR";
VARIABLE = "VAR";
FN = "FN";
FN_CALL = "FN_CALL";
PARAMS = "PARAMS";
PARAM = "PARAM";
OPERATOR = "OPERATOR";
FN_OPERATOR = "FN_OPERATOR";
FN_NAME = "FN_NAME";
OPERANDS = "OPERANDS";
OPERAND = "OPERAND";
ASSIGNMENT = "ASSIGNMENT";
var variables = null;
var factors = [];
class Node {
    constructor(token, type, children) {
        this.data = token.data;
        this.type = type;
        this.line = token.line;
        this.index = token.index;
        this.children = children;
        this.ttype = token.type;
    }
}
function throwEx(type, msg, token) {
    console.log("In state " + type + ", Expected " + msg + " but encountered: " + JSON.stringify(token));
}
function Expressions(tokens) {
    var token = tokens.get(0);
    var type =  EXPRESSIONS;
    var children = [];
    children.push(Expression(tokens));
    if (tokens.length > 0) {
        peek = tokens.get(0);
        if (peek.type == OPERATOR) {
            children.push(Operator(tokens));
            children.push(Expressions(tokens));
            if (tokens.length != 0) {
                throwEx(type, "NO MORE TOKENS", tokens.get(0));
                return;
            }
        }
    }
    return new Node(token,type,children);
}
function Expression(tokens) {
    var token = tokens.get(0);
    var type =  EXPRESSION;
    console.log(type);
    var children = [];
    children.push(MultDiv(tokens));
    if (tokens.length > 0) {
        var peek = tokens.get(0);
        if (peek.type == OPERATOR) {
            switch (peek.data) {
                case "+":
                case " ":
                case "-":
                    children.push(Operator(tokens));
                    children.push(Expression(tokens));
                    break;
                default:
            }
        } else {
        }
        if (tokens.length > 0 && tokens.get(0).type != OPERATOR) {
            throwEx(type, "OPERATOR", tokens.get(0));
            return;
        }
    }
    return new Node(token,type,children);
}
function Term(tokens) {
    var token = tokens.remove(0);
    var type =  TERM;
    console.log(type);
    var children = [];
    switch(token.type) {
        case WORD:
            if (variables != null && !variables.includes(token.data)) {
                throwEx(type,"DECLARED VARIABLE",token);
                return;
            }
            if (token.data in functions) {
                type = FN_CALL;
                peek = tokens.get(0);
                children.push(Params(token.data,tokens));
            }
            else if (tokens.length > 0 && tokens.get(0).data == "=") {
                type = ASSIGNMENT;
                tokens.remove(0); // eat = sign
                children.push(Expression(tokens));
            }
        case NUMBER:
            children.push(Number(token));
            break;
        case OPERATOR:
            if (token.data == "(") {
                children.push(Expression(tokens));
                close = tokens.remove(0);
                if (close.data != ")") {
                    throwEx(type,"ENCLOSED EXPRESSION with CLOSING PARENTHESIS",close);
                    return;
                }
            }
            else {
                throwEx(type,"'('",token);
                return;
            }
            break;
        default:
            throwEx(type,"TERM (expected NUMBER or WORD",token);
            return;
    }
    return new Node(token,type,children);
}
function Number(token) {
    var token = token;
    var children = [];
    var type = NUMBER;
    console.log(type);
    if (token.type != NUMBER) {
        throwEx(type,"NUMBER",token);
    }
    return new Node(token,type,children);
}
function Params(fn_name, tokens) {
    var token = tokens.get(0);
    var type =  PARAMS;
    console.log(type);
    next = tokens.get(0);
    if (fn_name in functions) {
        //ok
    } else {
        throwEx(type,"DECLARED_FUNCTION",fn_name);
        return;
    }
    fn = functions[fn_name];
    p = fn.children[1].children.length;
    for (i = 0; i < p; i++) {
        children.push(Param(tokens));
    }
    return new Node(token,type,children);
}
function Param(tokens) {
    var type =  PARAM;
    console.log(type);
    var token = tokens.get(0);
    var children = [];
    children.push(Term(tokens));
    return new Node(token,type,children);
}
function MultDiv(tokens) {
    console.log("Mult-Div");
    reverseTerms(isMult,tokens);
    return MDiv(tokens);
}
function rebuild(node) {
    return {type: node.ttype, data: node.data, line: node.line, index: node.index };
}
function reverseTerms(op_func,tokens) {
    console.log("before:");
    console.log(tokens);
    var t = [];
    var count = 0;
    t.unshift(tokens.remove(0));
    while (tokens.length > 0 && op_func(tokens.get(0).data)) {
        count++;
        t.push(tokens.remove(0));
        t.push(tokens.remove(0));
    }
    while (t.length > 0) {
        tokens.unshift(t.remove(0));
    }
    console.log("after: " + count);
    console.log(tokens);
}
function MDiv(tokens) {
    console.log("MDIV");
    var type = MULTDIV;
    var term = Term(tokens);
    if (tokens.length > 2) {
        var next = tokens.remove(0);
        var next2 = tokens.remove(0);
        var peek = tokens.get(0);
        tokens.unshift(next2);
        tokens.unshift(next);
        if (peek.type == OPERATOR && isMult(peek.data)) {
            var op = Operator(tokens);
            var md = MDiv(tokens);
            var children = [term, op, md];
            return new Node(rebuild(children[0]), type, children);
        } else {
            var op = Operator(tokens);
            var md = Term(tokens);
            var children = [term,op,md];
            return new Node(rebuild(children[0]),type,children);
        }
    } else if (tokens.length > 1) {
        var op = Operator(tokens);
        var md = Term(tokens);
        var children = [term,op,md];
        return new Node(rebuild(children[0]),type,children);
    } else {
            return term;
    }
}
function Operator(tokens) {
    var token = tokens.remove(0);
    var type =  OPERATOR;
    console.log(type);
    var children = [];
    switch (token.type) {
        case OPERATOR:
            break;
        default:
            throwEx(type,"OPERATOR",token);
            return;
    }
    return new Node(token,type,children);
}
function Function(tokens) {
    var token = tokens.get(0);
    var type =  FN;
    console.log(type);
    var children = [];
    var token = tokens.remove(0);
    switch (token.type) {
        case WORD:
            switch (token.data) {
                case "fn":
                    break;
                default:
                    throwEx(type,"'fn'",token);
                    return;
            }
            break;
        default:
            throwEx(type,"'fn'",token);
            return;
    }
    children.push(FuncName(tokens));
    var peek = tokens.get(0);
    switch (peek.type) {
        case WORD:
        case NUMBER:
            children.push(Operands(tokens));
            break;
        case FN_OPERATOR:
            break;
        default:
            throwEx(type,FN_OPERATOR,peek);
            return;
    }
    children.push(FuncOperator(tokens));
    children.push(Expression(tokens));
    return new Node(token,type,children);
}
function FuncName(tokens) {
    var type =  FN_NAME;
    console.log(type);
    var children = [];
    var token = tokens.remove(0);
    switch(token.type) {
        case WORD:
            break;
        default:
            throwEx(type,"WORD",token);
            return;
    }
    return new Node(token,type,children);
}
function FuncOperator(tokens) {
    var type =  FN_OPERATOR;
    console.log(type);
    var children = [];
    var token = tokens.remove();
    switch(token.type) {
        case FN_OPERATOR:
            break;
        default:
            throwEx(type,"'=>'",token);
            return;
    }
    return new Node(token,type,children);
}
function Operands(tokens) {
    var type =  OPERANDS;
    console.log(type);
    var children = [];
    next = tokens.get(0);
    if (next.type == WORD) {
        variables = [];
    }
    while (next != null && next.type == WORD) {
        if (tokens.length > 0) {
            op = Operand(tokens);
            children.push(op);
            variables.push(op.data);
            if (tokens.length > 0) {
                next = tokens.get(0);
            }
        } else {
            if (tokens.length > 0) {
                next = tokens.get(0);
            } else {
                next = null;
            }
        }
    }
    return new Node(token,type,children);
}
function Operand(tokens) {
    var type =  OPERAND;
    console.log(type);
    var children = [];
    var token = tokens.remove(0);
    switch (token.type) {
        case WORD:
            break;
        default:
            throwEx(type,"WORD",token);
            return;
    }
    return new Node(token,type,children);
}
function parse(tokens) {
    console.log("parsing: " + tokens);
    tokens = JSON.parse(tokens);
    var peek = tokens.get(0);
    if (peek.data == "fn") {
        return Function(tokens);
    }
    return Expressions(tokens);
}
function execute(node) {
    console.log(JSON.stringify(node));
    var children = node.children;
    var type = node.type;
    var data = node.data;
    switch(type) {
        case EXPRESSIONS:
            if (children.length > 1) {
                execute(children[0]);
                return execute(children[1]);
            } else {
                return execute(children[0]);
            }
        case EXPRESSION:
            if (children.length == 1) {
                return execute(children[0]);
            }
            if (children.length == 3) {
                var left = execute(children[0]);
                var right = execute(children[2]);
                console.log(right + " * " + left);
                switch(children[1].data) {
                    case "*":
                        return left * right;
                    case "/":
                        return left / right;
                    case "%":
                        return left % right;
                    case "+":
                    case " ":
                        return left + right;
                    case "-":
                        return left - right;
                    default:
                        throwEx(type,"* / % + -",children[1].data);
                        return;
                }
            } else {
                throwEx(type,"1 or 3 children",children.length + " children");
                return;
            }
        case MULTDIV:
            if (children.length == 1) {
                return execute(children[0]);
            } else if (children.length == 3) {
                var left = execute(children[0]);
                var right = execute(children[2]);
                switch (children[1].data) {
                    case "*":
                        return right * left;
                    case "/":
                        return right / left;
                    case "%":
                        return right % left;
                    case "+":
                        return right + left;
                    case "-":
                        return right - left;
                    default:
                        throwEx(type,"* / %",children[1].data);
                        return;
                }
            } else {
                throwEx(type,"1 or 3 children",children.length + " children");
                return;
            }
        case TERM:
            if (children.length == 1) {
                return execute(children[0]);
            } else {
                throwEx(type,"1 child",children.length + " children");
                return;
            }
        case FN_CALL:
            if (children.length == 1) {
                return fn_call(children[0]);
            } else {
                throwEx(type,"1 child",children.length + " children");
                return;
            }
        case ASSIGNMENT:
            if (variables != null) {
                var ret = execute(children[0]);
                variables[data] = ret;
                return ret;
            } else {
                variables = {};
                var ret = execute(children[0]);
                variables[data] = ret;
                return ret;
            }
            return;
        case NUMBER:
            return +data;
        default:
            throwEx(type,"KNOWN TYPE",type);
            return;
    }
}
function reduce(node) {

}
module.exports = {parse: parse,execute: execute,reduce: reduce};