var REDUCING = false;
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
function isAddSub(x) {
    return x.length == 1 && x.match(/[\+\-]/g);
}
functions = {};
STATEMENTS = "STATEMENTS";
UNKNOWN = "UNKOWN";
IDENTIFIER = "ID";
WORD = "WORD";
NUMBER = "NUMBER";
MULTDIV = "MULTDIV";
MULTTERM = "MULTTERM";
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
STRING = "STRING";
ASSIGNMENT = "ASSIGNMENT";
var variables = null;
var factors = [];
class Node {
    constructor(token, type, children) {
        if (token != null) this.data = token.data;
        else this.data = "";
        this.type = type;
        if (token != null) this.line = token.line;
        else this.line = 0;
        if (token != null) this.index = token.index;
        else this.index = 0;
        this.children = children;
        if (token != null) this.ttype = token.type;
        else this.ttype = "UNKOWN";
    }
}
function throwEx(errors, type, msg, token) {
    if (REDUCING) return;
    var encountered = token;
    if (token instanceof Node || token instanceof Object) encountered = "[index " + token.index + " " + token.type + "] '" + token.data + "'";
    var error = "In state " + type + ", Expected " + msg + " but encountered: " + encountered;
    console.log(error);
    if (!errors.includes(error)) errors.push(error);
}
function Statements(errors,tokens) {
    console.log("statementS");
    var token = tokens.get(0);
    var type = STATEMENTS;
    var children = [];
    if (token.type == OPERATOR && token.data == "{") {
        children.remove(0);
        children.push(Statements(errors,tokens));
        if (tokens.length == 0) {
            throwEx(errors, type, "CLOSING '}'", "NO TOKENS");
            return;
        }
        var peek = tokens.get(0);
        if (peek.type == OPERATOR) {
            if (peek.data == "}") {
                tokens.remove(0);
            } else {
                throwEx(errors,type,"CLOSING '}'",peek);
                return;
            }
        }
        return new Node(token,type,children);
    }
    children.push(Expressions(errors,tokens));
    if (tokens.length > 0) {
        var peek = tokens.get(0);
        if (peek.type == OPERATOR && peek.data == ";") {
            tokens.remove(0);
            children.push(Statements(errors,tokens));
        }
    }
    return new Node(token,type,children);
}
function Expressions(errors,tokens) {
    console.log("expressionS");
    var token = tokens.get(0);
    var type =  EXPRESSIONS;
    var children = [];
    children.push(Expression(errors,tokens));
    if (tokens.length > 0) {
        peek = tokens.get(0);
        if (peek.type == OPERATOR && ![",",")",";"].includes(peek.data)) {
            children.push(Operator(errors,tokens));
            children.push(Expressions(errors,tokens));
        }
    }
    return new Node(token,type,children);
}
function Expression(errors,tokens) {
    var token = tokens.get(0);
    var type =  EXPRESSION;
    console.log(type);
    var children = [];
    children.push(MultDiv(errors,tokens));
    if (tokens.length > 0) {
        var peek = tokens.get(0);
        if (peek.type == OPERATOR) {
            switch (peek.data) {
                case "+":
                case " ":
                case "-":
                    children.push(Operator(errors,tokens));
                    children.push(MultDiv(errors,tokens));
                    break;
                default:
            }
        } else {
        }
        if (tokens.length > 0 && tokens.get(0).type != OPERATOR) {
            throwEx(errors,type, "OPERATOR", tokens.get(0));
            return;
        }
    }
    return new Node(token,type,children);
}
function Term(errors,tokens) {
    var token = tokens.remove(0);
    var type =  TERM;
    console.log(type);
    var children = [];
    switch(token.type) {
        case WORD:
            if (token.data == "fn") {
                tokens.unshift(token);
                children.push(Function(errors, tokens));
            }
            else if (token.data in functions || (variables != null && !variables.includes(token.data)) || (tokens.length > 0 && tokens.get(0).data == "(")) {
                if (REDUCING || (token.data in functions && tokens.length > 0 && tokens.get(0).data == "(")) {
                    type = FN_CALL;
                    children.push(Params(errors, token.data, tokens));
                    break;
                }
                else if (token.data in functions) {
                    type = IDENTIFIER;
                    children = [];
                    return new Node(token,type,children);
                } else {
                    throwEx(errors, type, "DECLARED VARIABLE", token);
                    if (!REDUCING) {
                        throw "not reducing";
                    }
                }
            }
            else if (tokens.length > 0 && tokens.get(0).data == "=") {
                type = ASSIGNMENT;
                tokens.remove(0); // eat = sign
                children.push(Expressions(errors,tokens));
            } else {
                throwEx(errors, type, "DECLARED VARIABLE or FUNCTION",token);
                if (!REDUCING) throw "not reducing";
            }
            break;
        case NUMBER:
            children.push(Number(errors,token));
            break;
        case STRING:
            children.push(String(errors, token));
            break;
        case OPERATOR:
            if (token.data == "(") {
                children.push(Expressions(errors,tokens));
                close = tokens.remove(0);
                if (close.data != ")") {
                    throwEx(errors,type,"ENCLOSED EXPRESSION with CLOSING PARENTHESIS",close);
                    return;
                }
            }
            else {
                throwEx(errors,type,"'('",token);
                if (!REDUCING) throw "not reducing";
            }
            break;
        default:
            throwEx(errors,type,"TERM (expected NUMBER or WORD",token);
            if (!REDUCING) throw "not reducing";
    }
    return new Node(token,type,children);
}
function Number(errors,token) {
    var token = token;
    var children = [];
    var type = NUMBER;
    console.log(type);
    if (token.type != NUMBER) {
        throwEx(errors,type,"NUMBER",token);
    }
    return new Node(token,type,children);
}
function String(errors, token) {
    var token = token;
    var children = [];
    var type = STRING;
    console.log(type);
    if (token.type != STRING) {
        throwEx(errors,type,"STRING",token);
    }
    return new Node(token,type,children);
}
function Params(errors,fn_name, tokens) {
    var token = tokens.get(0);
    var type =  PARAMS;
    console.log(type);
    var children = [];
    var next = tokens.get(0);
    if (fn_name in functions) {
        //ok
    } else {
        throwEx(errors,type,"DECLARED_FUNCTION",fn_name);
        if (!REDUCING) throw "not reducing";
    }
    fn = functions[fn_name];
    if (tokens.length > 0) {
        next = tokens.remove(0);
        if (next.type == "OPERATOR" && next.data == "(") {
            // ok
        } else {
            throwEx(errors, type, "'('", next);
            if (!REDUCING) throw "not reducing";
        }
        while (tokens.length > 0 && tokens.get(0).data != ")") {
            children.push(Param(errors, tokens));
            if (tokens.get(0).type == OPERATOR && tokens.get(0).data == ",") {
                tokens.remove(0); // eat ,
            }
        }
        if (tokens.length == 0) {
            throwEx(errors, type, ")", {});
            if (!REDUCING) throw "not reducing";
        } else {
            tokens.remove(0);
        }
    }
    return new Node(token,type,children);
}
function Param(errors,tokens) {
    var type =  PARAM;
    console.log(type);
    var token = tokens.get(0);
    var children = [];
    children.push(Expressions(errors,tokens));
    return new Node(token,type,children);
}
function MultDiv(errors,tokens) {
    console.log("Mult-Div");
    var num = reverseTerms(isMult,errors,tokens);
    return MDiv(errors,tokens);
}
function rebuild(node) {
    if (node == null) return {type: "UNKNOWN", data: "", line: 0, index: 0 };
    if ("type" in node && "data" in node && "line" in node && "index" in node) {
        return {type: node.ttype, data: node.data, line: node.line, index: node.index};
    }
    return {type: "UKNOWN", data: "", line: 0, index: 0};
}
function sneak(tokens, index) {
    if (tokens.length < index + 1) return tokens.get(0);
    var stack = [];
    for (var i = 0; i < index; i++) {
        stack.unshift(tokens.remove(0));
    }
    var peek = tokens.get(0);
    while (stack.length > 0) {
        tokens.unshift(stack.remove(0));
    }
    return peek;
}
function reverseTerms(op_func,errors,tokens) {
    console.log("before:");
    console.log(errors,tokens);
    var t = [];
    var count = 0;
    if (sneak(tokens,2).type == OPERATOR) return 1;
    t.unshift(tokens.remove(0));
    while (tokens.length > 0 && op_func(tokens.get(0).data) && sneak(tokens,1).type != OPERATOR) {
        count++;
        t.push(tokens.remove(0));
        t.push(tokens.remove(0));
    }
    while (t.length > 0) {
        tokens.unshift(t.remove(0));
    }
    console.log("after: " + count);
    console.log(errors,tokens);
    return count;
}
function MultTerm(errors, tokens) {
    console.log("MultTerm");
    reverseTerms(isAddSub,errors,tokens);
    return MTerm(errors,tokens);
}
function MTerm(errors,tokens) {
    console.log("MTERM");
    var type = MULTTERM;
    var term = Term(errors,tokens);
    if (tokens.length > 2 && tokens.get(0).type == OPERATOR && isAddSub(tokens.get(0).data)) {
        var next = tokens.remove(0);
        var next2 = tokens.remove(0);
        var peek = tokens.get(0);
        tokens.unshift(next2);
        tokens.unshift(next);
        if (peek.type == OPERATOR && isAddSub(peek.data)) {
            var op = Operator(errors,tokens);
            var md = MTerm(errors,tokens);
            var children = [term, op, md];
            return new Node(rebuild(children[0]), type, children);
        } else {
            var op = Operator(errors,tokens);
            var md = Term(errors,tokens);
            var children = [md,op,term];
            return new Node(rebuild(children[0]),type,children);
        }
    } else if (tokens.length > 1 && isAddSub(tokens.get(0).data)) {
        var op = Operator(errors,tokens);
        var md = Term(errors,tokens);
        var children = [term,op,md];
        return new Node(rebuild(children[0]),type,children);
    } else {
        return term;
    }
}
function MDiv(errors,tokens) {
    console.log("MDIV");
    var type = MULTDIV;
    var term = Term(errors,tokens);
    if (tokens.length > 2 && tokens.get(0).type == OPERATOR && isMult(tokens.get(0).data)) {
        var next = tokens.remove(0);
        var next2 = tokens.remove(0);
        var peek = tokens.get(0);
        tokens.unshift(next2);
        tokens.unshift(next);
        if (peek.type == OPERATOR && isMult(peek.data)) {
            var op = Operator(errors,tokens);
            var md = MDiv(errors,tokens);
            var children = [term, op, md];
            return new Node(rebuild(children[0]), type, children);
        } else if (peek.data != ")") {
            var op = Operator(errors,tokens);
            var md = Term(errors,tokens);
            var children = [term,op,md];
            return new Node(rebuild(children[0]),type,children);
        } else {
            return term;
        }
    } else if (tokens.length > 1 && isMult(tokens.get(0).data)) {
        var op = Operator(errors,tokens);
        var md = Term(errors,tokens);
        var children = [term,op,md];
        return new Node(rebuild(children[0]),type,children);
    } else {
        return term;
    }
}
function Operator(errors,tokens) {
    var token = tokens.remove(0);
    var type =  OPERATOR;
    console.log(type);
    var children = [];
    switch (token.type) {
        case OPERATOR:
            break;
        default:
            throwEx(errors,type,"OPERATOR",token);
            if (!REDUCING) throw "not reducing";
    }
    return new Node(token,type,children);
}
function Function(errors,tokens) {
    var token = tokens.get(0);
    var type = FN;
    console.log(type);
    var children = [];
    var token = tokens.remove(0);
    switch (token.type) {
        case WORD:
            switch (token.data) {
                case "fn":
                    break;
                default:
                    throwEx(errors,type,"'fn'",token);
                    return;
            }
            break;
        default:
            throwEx(errors,type,"'fn'",token);
            return;
    }
    children.push(FuncName(errors,tokens));
    var peek = tokens.get(0);
    switch (peek.type) {
        case WORD:
        case NUMBER:
            children.push(Operands(errors,tokens));
            break;
        case FN_OPERATOR:
            break;
        default:
            throwEx(errors,type,FN_OPERATOR,peek);
            return;
    }
    children.push(FuncOperator(errors,tokens));
    REDUCING = true;
    children.push(Statements(errors,tokens));
    REDUCING = false;
    return new Node(token,type,children);
}
function FuncName(errors,tokens) {
    var type =  FN_NAME;
    console.log(type);
    var children = [];
    var token = tokens.remove(0);
    switch(token.type) {
        case WORD:
            break;
        default:
            throwEx(errors,type,"WORD",token);
            return;
    }
    return new Node(token,type,children);
}
function FuncOperator(errors,tokens) {
    var type =  FN_OPERATOR;
    console.log(type);
    var children = [];
    var token = tokens.remove(0);
    switch(token.type) {
        case FN_OPERATOR:
            break;
        default:
            throwEx(errors,type,"'=>'",token);
            return;
    }
    return new Node(token,type,children);
}
function Operands(errors,tokens) {
    var type =  OPERANDS;
    console.log(type);
    var children = [];
    var next = tokens.get(0);
    var token = next;
    if (next.type == WORD) {
        variables = [];
    }
    while (next != null && next.type == WORD) {
        if (tokens.length > 0) {
            op = Operand(errors,tokens);
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
function Operand(errors,tokens) {
    var type =  OPERAND;
    console.log(type);
    var children = [];
    var token = tokens.remove(0);
    switch (token.type) {
        case WORD:
            break;
        default:
            throwEx(errors,type,"WORD",token);
            return;
    }
    return new Node(token,type,children);
}
function parse(errors,tokens) {
    console.log("parsing: " + tokens);
    try {
        tokens = JSON.parse(tokens);
        var val = "{}";
        val = Statements(errors, tokens);
        if (errors.length > 0) return JSON.stringify(errors);
        return val;
    } catch (err) {
        if (errors.length == 0) return [err];
        return errors;
    }
}
function execute(errors,node,vars) {
    console.log(JSON.stringify(node));
    REDUCING = false;
    var children = node.children;
    var type = node.type;
    var data = node.data;
    try {
        switch (type) {
            case STATEMENTS:
            case EXPRESSIONS:
                if (children.length == 2) {
                    execute(errors, children[0], vars);
                    return execute(errors, children[1], vars);
                } else if (children.length == 3) {
                    // fall through
                } else {
                    return execute(errors, children[0], vars);
                }
            case EXPRESSION:
                if (children.length == 1) {
                    return execute(errors, children[0], vars);
                }
                if (children.length == 3) {
                    var left = children[0];
                    var right = children[2];
                    if (left instanceof Object) left = execute(errors, left, vars);
                    if (right instanceof Object) right = execute(errors, right, vars);
                    console.log(node);
                    console.log(right);
                    console.log(left);
                    console.log(right + " OP " + left);
                    switch (children[1].data) {
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
                            throwEx(errors, type, "* / % + -", children[1].data);
                            return;
                    }
                } else {
                    throwEx(errors, type, "1 or 3 children", children.length + " children");
                    return;
                }
            case MULTDIV:
            case MULTTERM:
                if (children.length == 1) {
                    return execute(errors, children[0], vars);
                } else if (children.length == 3) {
                    var left = execute(errors, children[0], vars);
                    var right = execute(errors, children[2], vars);
                    console.log(right + " " + children[1].data + " " + left);
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
                            throwEx(errors, type, "* / %", children[1].data);
                            return;
                    }
                } else {
                    throwEx(errors, type, "1 or 3 children", children.length + " children");
                    return;
                }
            case IDENTIFIER:
                if (data in vars) {
                    data = vars[data];
                }
                if (children.length > 0 && children[0].type == PARAMS) {
                    return fn_call(errors, data, children[0], vars);
                }
                return data;
            case TERM:
                if (children.length == 1) {
                    return execute(errors, children[0], vars);
                } else {
                    throwEx(errors, type, "1 child", children.length + " children");
                    return;
                }
            case FN_CALL:
                if (children.length == 1) {
                    return fn_call(errors, data, children[0], vars);
                } else {
                    throwEx(errors, type, "1 child", children.length + " children");
                    return;
                }
            case ASSIGNMENT:
                if (vars != null) {
                    var ret = execute(errors, children[0], vars);
                    vars[data] = ret;
                    return ret;
                } else {
                    vars = {};
                    var ret = execute(errors, children[0], vars);
                    vars[data] = ret;
                    return ret;
                }
                return;
            case NUMBER:
                return +data;
            case PARAM:
                if (children.length > 0) {
                    return execute(errors, children[0], vars);
                }
                return data;
            case FN:
                if (functions == null) {
                    functions = {};
                }
                var index = 2;
                var params = 0;
                if (children[1].type == FN_OPERATOR) {
                    params = [];
                } else {
                    params = [];
                    var parameters = children[1].children;
                    for (var i = 0; i < parameters.length; i++) {
                        var child = parameters[i];
                        var ret = reduce(errors,child,vars);
                        params.push(child);
                    }
                    index ++;
                }
                functions[children[0].data] = {
                    params: params,
                    fn: reduce(errors, children[index], vars)
                };
                REDUCING = false;
                return functions[children[0].data];
            case STRING:
                return data;
            default:
                return node;
        }
    } catch (err) {
        console.log(err.message);
        console.log("CRASHED: " + err);
        errors.push(err.message);
        return err.message;
    }
}
function getOperands(operands) {
    var out = "(";
    for (var i = 0; i < operands.length; i++) {
        var operand = operands[i];
        var name = operand.data;
        if (operand.type != IDENTIFIER) name = reduce([],operand,[]);
        out += name;
        if (i < operands.length - 1) out += ",";
    }
    return out + ")";
}
function fn_call(errors, name, params, vars) {
    console.log("CALLING " + name);
    if (!(name in functions)) {
        throwEx(errors,"FN_CALL","DECLARED FN_NAME",name);
    }
    console.log(JSON.stringify(params));
    console.log(JSON.stringify(functions[name]));
    var fn = functions[name];
    var operands = fn.params;
    var parameters = {};
    if (params.children.length != operands.length) {
        throwEx(errors,"FN_CALL","Correct number of operands for '" + name + getOperands(operands) +"'",params.children.length + " operands");
        if (!REDUCING) {
            throw "not reducing";
        }
    }
    for (i = 0; i < operands.length; i++) {
        var opname = operands[i];
        opname = reduce(errors,opname,[]);
        var param = params.children[i];
        var ret = reduce(errors,param,vars);
        parameters[opname] = ret;
    }
    console.log("parameters:");
    console.log(parameters);
    return execute(errors, fn.fn,parameters);
}
function reduce(errors, node, vars) {
    REDUCING = true;
    console.log("REDUCE: " + JSON.stringify(node));
    var children;
    if ("children" in node) {
        children = node.children;
    } else {
        node.type = IDENTIFIER;
        return node;
    }
    var type = node.type;
    var data = node.data;
    switch (type) {
        case STATEMENTS:
        case EXPRESSIONS:
            if (children.length == 2) {
                reduce(errors, children[0], vars);
                return reduce(errors, children[1], vars);
            } else if (children.length == 3) {
                // fall through
            }
            else {
                return reduce(errors, children[0], vars);
            }
        case EXPRESSION:
            if (children.length == 1) {
                return reduce(errors, children[0], vars);
            }
            if (children.length == 3) {
                var left = reduce(errors, children[0], vars);
                var right = reduce(errors, children[2], vars);
                console.log(right);
                console.log(left);
                console.log(right + " OP " + left);
                if (left instanceof Object || right instanceof Object) return new Node(rebuild(node),type,[left,children[1],right]);
                switch (children[1].data) {
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
                        throwEx(errors, type, "* / % + -", children[1].data);
                        return;
                }
            } else {
                throwEx(errors, type, "1 or 3 children", children.length + " children");
                return;
            }
        case MULTDIV:
        case MULTTERM:
            if (children.length == 1) {
                return reduce(errors, children[0], vars);
            } else if (children.length == 3) {
                var left = reduce(errors, children[0], vars);
                var right = reduce(errors, children[2], vars);
                console.log(right + " " + children[1].data + " " + left);
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
                        throwEx(errors, type, "* / % + -", children[1].data);
                        return;
                }
            } else {
                throwEx(errors, type, "1 or 3 children", children.length + " children");
                return;
            }
        case PARAM:
        case TERM:
        case OPERAND:
            if (children.length == 1) {
                return reduce(errors, children[0], vars);
            } else {
                node.type = IDENTIFIER;
                return node;
            }
        case IDENTIFIER:
            if (data in vars) {
                data = vars[data];
            }
            if (children.length > 0 && children[0].type == PARAMS) {
               return fn_call(errors, data, children[0], vars);
            }
            return data;
        case FN_CALL:
            node.type = IDENTIFIER;
            return node;
        case ASSIGNMENT:
            if (vars != null) {
                var ret = reduce(errors, children[0], vars);
                data = variables[data];
                vars[data] = ret;
                return ret;
            } else {
                vars = {};
                var ret = reduce(errors, children[0], vars);
                vars[data] = ret;
                return ret;
            }
            return;
        case NUMBER:
            return +data;
        case FN:
            if (functions == null) {
                functions = {};
            }
            var index = 1;
            var params = [];
            if (children[1].type == FN_OPERATOR) {
                params = [];
            } else {
                params = children[1].children;
            }
            functions[children[0].data] = {
                params: params,
                fn: children[index]
            };
            return functions[children[0].data];
        case STRING:
            return data;
        default:
            throwEx(errors, type, "KNOWN TYPE", rebuild(node));
            return;
    }
}
module.exports = {parse: parse,execute: execute,reduce: reduce};