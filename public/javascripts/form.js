_history = [];
_line = 0;
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
function enterKey(event) {
    var keyCode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    switch (keyCode) {
       case 38: //up
           _line--;
           if (_line < 0) {
               _line = _history.length;
                $(".form-text").val("");
           } else {
               $(".form-text").val(_history[_line]);
           }
           break;
       case 40: //down
           _line++;
           if (_line >= _history.length) {
               $(".form-text").val("");
               _line = -1;
           } else {
               $(".form-text").val(_history[_line]);
           }
           break;
       case 13: //enter
           event.preventDefault();
           var line = $(".form-text").val() + "\n";
           _history.push(line);
           $(".code").append(line);
           _line = _history.length;
           $(".form-text").val("");
           call(line);
           return false;
           break;
       default:
   }
}
function call(line) {
    var lexing = $("#lex:checked").val();
    var parsing = $("#parse:checked").val();
    var lexparsing = $("#lexparse:checked").val();
    var executing = $("#execute:checked").val();
    var request = "/unknown";
    if (executing) request = "/interpreter?eval=";
    else if (lexing) request = "/lexer?lex=";
    else if (parsing) request = "/parser?parse="
    else if (lexparsing) request = "/lexer?lex=";
    request += encodeURI(line).replaceAll("\\+","%2B");
    $.get(request, function (data) {
       var info = "Error: Service down.";
       var vars = [];
        try {
           info = JSON.parse(data);
           console.log(typeof(info[0]));
           if (parsing) info = JSON.stringify(info);
           else if (lexparsing) {
               request = "/parser?parse=" + encodeURI(JSON.stringify(info)).replaceAll("\\+","%2B");
                $.get(request, function (n) {
                   info = JSON.parse(n);
                   console.log(info);
                   var div = createDiv(info);
                   $(".code").append(div);
                   $(".scroll").scrollTop($(".code").height());
                });
           } else if (!lexing) {
               vars = info[0];
               info = info[1];
           }
           if (lexing) {
               var out = "";
               for (var i = 0; i < info.length; i++) {
                   var token = info[i];
                   out += token.type + "</b>(" + token.line +"," + token.index +"): <b>'" + token.data + "'</b>";
                   if (i < info.length - 1) out += ", <b>";
               }
               info = out;
           }
           else if (info instanceof Object) {
               info = JSON.stringify(info);
           }
       } catch (ex) {
           info = JSON.stringify(data);
       }
       if (!lexparsing) {
            $(".code").append("<b>" + info + "</b>\n");
            if (executing) {
                $(".code").append("vars: " + JSON.stringify(vars) + "\n");
            }
           $(".scroll").scrollTop($(".code").height());
        }
        return false;
    });
}
function loadScript() {
    $(".form").submit(function (event) { event.preventDefault(); enterKey(); return false; });
}
var types = ["TERM","NUMBER","ID","STRING","OPERATOR","ASSIGNMENT","FN_NAME","OPERAND"];
function createDiv(node) {
    var data = "";
    if (types.includes(node.type)) data = node.data;
    var out = "<ul><li><span class=\"Collapsable\">" + node.type + "(" + node.line + "," + node.index + "): " + data + "</span></li>";
    if ("children" in node && node["children"] != undefined) {
        var children = node["children"];
        for (var i = 0; i < children.length; i++) {
            out += createDiv(children[i]);
        }
    }
    out += "</ul>";
    return out;
}