digits = ["1","2","3","4","5","6","7","8","9","0"]
String.prototype.isLetter = function() {
    return this.length == 1 && this.match(/[a-zA-Z]/i);
}
String.prototype.isDigit = function() {
    return this.length == 1 && this.match(/[0-9]/i);
}
String.prototype.isWs = function() {
    return this.length == 1 && this.match(/[\s\n]/i);
}
String.prototype.isOperator = function() {
    return this.length == 1 && this.match(/[\"\'\,\+|-|\*|\/|=|>|<|>=|<=|&|\||%|!|\^|\(|\)]/i);
}
String.prototype.type = function () {
    if (this.isDigit()) return "DIGIT";
    else if (this.isLetter()) return "LETTER";
    else if (this.isWs()) return "WHITESPACE";
    else if (this.isOperator()) return "OPERATOR";
    else return "UNKNOWN";
}
OPERATOR = "OPERATOR";
STRING = "STRING";
WORD = "WORD";
NUMBER = "NUMBER";
COMMENT = "COMMENT";
class Token {
    constructor(line, index) {
        this.type = "unknown";
        this.data = "";
        this.line = line;
        this.index = index;
    }
    toString() {
        return "(" + this.line + "," + this.index +") " + this.type + ": " + this.data;
    }
}
class State {
    constructor() {
        this.START = 1;
        this.WORD = 2;
        this.NUMBER = 3;
        this.COMMENT = 4;
        this.STRING = 5;
        this.LITERAL = 6;
        this.DECIMAL = 7;
        this.FN_OPERATOR = 8;
    }
}
WS = "WHITESPACE";
LETTER = "LETTER";
DIGIT = "DIGIT";
OPERATOR = "OPERATOR";
NUMBER = "NUMBER";
FN_OPERATOR = "FN_OPERATOR";
function lex(errors,input) {
    console.log("lexing: " + input);
    input += "\n";
    function toString(int) {
        switch (int) {
            case 1: return "START";
            case 2: return "WORD";
            case 3: return "NUMBER";
            case 4: return "COMMENT";
            case 5: return "STRING";
            case 6: return "LITERAL";
            case 7: return "DECIMAL";
            case 8: return "FN_OPERATOR";
        }
    }
    function throwEx(state,expected,encountered) {
        var found = encountered;
        if (encountered instanceof Token || encountered instanceof Object) found = "[ index " + encountered.index + "]: '" + encountered.data + "'";
        var error = "At (index " + encountered.index + "), In state " + toString(state) + ", expected " + expected + " but encountered " + found;
        console.log(error);
        if (!errors.includes(error)) errors.push(error);
    }
    var STATE = new State();
    var state = STATE.START;
    var tokens = [];
    var line = 1;
    var token = new Token(line,0);
    var SAME_QUOTE = "\"";
    for (i = 0; i < input.length; i++) {
        x = input.charAt(i);
        switch (state) {
            case STATE.START:
                switch(x.type()) {
                    case WS:
                        if (x == "\n") line++;
                        // ignore whitespace
                        break;
                    case LETTER:
                        state = STATE.WORD;
                        token.type = WORD;
                        token.data += x;
                        break;
                    case DIGIT:
                        token.type = NUMBER;
                        state = STATE.NUMBER;
                        token.data += x;
                        break;
                    case OPERATOR:
                        if (x == "\"" || x == "\'") {
                            token.type = STRING;
                            state = STATE.STRING;
                            SAME_QUOTE = x;
                        }
                        else if (x == ";") {
                            state = STATE.COMMENT;
                        } else if (x == "=") {
                            state = STATE.FN_OPERATOR;
                            token.data += x;
                        } else {
                                token.type = OPERATOR;
                                token.data = x;
                                tokens.push(token);
                                token = new Token(line,i);
                                state = STATE.START;
                        }
                        break;
                    default:
                        throwEx(state,"WHITESPACE, LETTER, DIGIT, or OPERATOR",x);
                }
            break;
            case STATE.WORD:
                switch(x.type()) {
                    case WS:
                        tokens.push(token);
                        token = new Token(line,i);
                        state = STATE.START;
                        break;
                    case LETTER:
                        token.data += x;
                        break;
                    case DIGIT:
                        token.data += x;
                        break;
                    case OPERATOR:
                        tokens.push(token);
                        token = new Token(line,i);
                        state = STATE.START;
                        i--; // put back char
                        break;
                    default:
                        throwEx(state,"LETTER or DIGIT",x);
                }
                break;
            case STATE.NUMBER:
                switch(x.type()) {
                    case WS:
                        tokens.push(token);
                        token = new Token(line,i);
                        state = STATE.START;
                        break;
                    case LETTER:
                        throwEx(state, "WHITESPACE or DIGIT", x);
                        break;
                    case DIGIT:
                        token.data += x;
                        break;
                    case OPERATOR:
                        if (x == ".") {
                            token.data += x;
                            state = STATE.DECIMAL;
                        } else {
                            tokens.push(token);
                            token = new Token(line,i);
                            state = STATE.START;
                            i--; // put back char
                        }
                        break;
                    default:
                        throwEx(state, "WHITESPACE or DIGIT or OPERATOR", x);
                }
                break;
            case STATE.DECIMAL:
                switch(x.type()) {
                    case WS:
                        tokens.push(token);
                        token = new Token(line,i);
                        state = STATE.START;
                        break;
                    case OPERATOR:
                        tokens.push(token);
                        token = new Token(line,i);
                        state = STATE.START;
                        i--; // put char back
                        break;
                    case DIGIT:
                        token.data += x;
                        break;
                    case LETTER:
                    default:
                        throwEx(state,"WHITESPACE or DIGIT or OPERATOR",x);
                }
                break;
            case STATE.COMMENT:
                switch(x.type()) {
                    case DIGIT:
                    case LETTER:
                    case OPERATOR:
                    default:
                        // ignore
                        break;
                    case WS:
                        if (x == "\n") {
                            state = STATE.START;
                            token = new Token(line,i);
                        }
                        break;
                }
                break;
            case STATE.FN_OPERATOR:
                switch(x.type()) {
                    case OPERATOR:
                        if (x == ">") {
                            token.type = FN_OPERATOR;
                            token.data += x;
                            tokens.push(token);
                            token = new Token(line,i);
                            state = STATE.START;
                            break;
                        }
                    default:
                        state = STATE.START;
                        token.type = OPERATOR;
                        tokens.push(token);
                        token = new Token(line,i);
                        i--; // put back char
                }
                break;
            case STATE.STRING:
                switch (x.type()) {
                    case WS:
                        if (x == "\\") {
                            state = STATE.LITERAL;
                        } else {
                            token.data += x;
                        }
                        break;
                    case OPERATOR:
                        if (x == SAME_QUOTE) {
                            state = STATE.START;
                            tokens.push(token);
                            token = new Token(line,i);
                        } else {
                            token.data += x;
                        }
                        break;
                    case DIGIT:
                    case LETTER:
                    default:
                        token.data += x;
                }
                break;
            case STATE.LITERAL:
                switch (x) {
                    case "n":
                        token.data += "\n";
                        break;
                    case "t":
                        token.data += "\t";
                        break;
                    case "\"":
                        token.data += "\"";
                        break;
                    case "\'":
                        token.data += "\'";
                        break;
                    default:
                        token.data += "\\" + x;
                }
                state = STATE.STRING;
            default:
                throwEx(state,"unknown state",state);
        }
    }
    return JSON.stringify(tokens);
}
module.exports = lex;