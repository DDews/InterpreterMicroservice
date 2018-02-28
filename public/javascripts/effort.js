function onLoadScript() {
    $(".form").submit((event) => { event.preventDefault(); enterKey(event); return false; });
}
$(document).ready(function(){
    $('[data-toggle="popover"]').popover();
});
function keyEnter(e) {
    var elem = $(e.target);
}
var added = [];
function card(e) {
    var elem = $(e.target);
    if (+elem.val() >= 0) elem.val(+elem.val())
    if (elem.val() > 0) {
        findPerson(elem,".form-group:nth-child(5)").attr("hidden",false);
    }
    else {
        findPerson(elem,"div.form-group:nth-child(5)").attr("hidden",true);
    }
    findPerson(elem,'.completed').attr({
        'max': findPerson(elem,'#cards').val()
    })
}
var lastVal = 1;
var clone = null;
function groupClick(e) {
    e.preventDefault();
    groupChanged(e,true);
}
function groupChanged(e,bool) {
    var keyCode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (!keyCode && !bool) return;
    e.preventDefault();
    var elem = $(e.target);
    var num = +elem.val();
    if (num > 10) num = 10;
    else if (num < 0) num = 0;
    $("#group2").val(num);
    $("#group").val(num);
    if (clone == null) {
        clone = $("form > div.form-person:nth-child(1)").clone();
        clone.addClass("bg-color1");
    }
    if (num <= 0) return;
    var c = $("form").children;

    console.log("val: ",lastVal,num);
    if (lastVal <= num) {
        for (var i = lastVal; i < num; i++) {
            var bgColor = "";
            var bgRemove = "";
            if (i % 2 == 1) {
                bgColor = "bg-color2";
                bgRemove = "bg-color1";
            }
            clone.clone().removeClass(bgRemove).addClass(bgColor).appendTo("form");
        }
    } else {
        $("form").find(".form-person:gt(" + (num) + ")").remove();
    }
    lastVal = num;
}
function checkNames() {
    var elems = $(".member");
    for (var i = 0; i < elems.length; i++) {
        var nameInput = $(elems[i]);
        if (nameInput.val() == "") {
            $("#submit").attr("disabled",true);
            return;
        }
    }
    $("#submit").attr("disabled",false);
}
function typing(e) {
    var elem = $(e.target);
    if (clone == null) {
        clone = $("form > div.form-person:nth-child(1)").clone();
        clone.find(".member").val("");
    }
    console.log(findPerson(elem,".role").length);
    if (elem.val().length > 0) {
        findPerson(elem,".form-group:nth-child(2)").attr("hidden",false);
    }
    else {
        findPerson(elem,".form-group:gt(1)").attr("hidden",true);
    }
    checkNames();
}
function roleClick(e) {
    e.preventDefault();
    var elem = $(e.target);
    if (elem.val() != "Select one") {
        findPerson(elem,".form-group:nth-child(4)").attr("hidden",false);
        findPerson(elem,".form-group:nth-child(6)").attr("hidden",false);
        if (elem.val() != "Dev") findPerson(elem,".form-group:nth-child(3)").attr("hidden",false);
        else findPerson(elem,".form-group:nth-child(3)").attr("hidden",true);
    }
    else findPerson(elem,".form-group:gt(2)").attr("hidden",true);
}
function _completed(e) {
    var elem = $(e.target);
    console.log("atrr: " + elem.attr("max"));
    if (+elem.val() > +elem.attr("max")) elem.val(elem.attr("max"));
    else if (+elem.val() < 0) elem.val("0");
}
function _helped(e) {
    var elem = $(e.target);
    if (elem.prop("checked")) {
        findPerson(elem,".form-group:nth-child(7)").attr("hidden",false);
    } else {
        findPerson(elem,".form-group:gt(5)").attr("hidden",true);
    }
}
function _helpEnter(e) {
    var elem = $(e.target);
    var keyCode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    if (keyCode == 13) {
        var checked = elem.prop('checked');
        if (checked) elem.prop('checked', false);
        else elem.prop('checked', true);
    }
    _helped(e);
}
function _hoursHelped(e) {
    var elem = $(e.target);
    if (+elem.val() < 0) elem.val("0");
}
function _calculate(e) {
    e.preventDefault();
    var total = 100;
    var people = [];
    var minCards = +$("#min").val();
    $(".form-person").each( function (index, element) {
        var elem = $(element);
        var person = {
            name: elem.find(".member").val(),
            role: elem.find("#role").val(),
            rolestrength: +elem.find("#rolestrength").val(),
            cards: +elem.find("#cards").val(),
            completed: +elem.find("#completed").val(),
            helped: elem.find("#helped").prop("checked"),
            hoursHelped: +elem.find("#pp").val(),
            helpPerc: 0,
            rolePerc: 0,
            cardPerc: 0,
            disPerc: 0,
            effort: 0,
            plusNegative: {
                helpPerc: 0,
                rolePerc: 0,
                cardPerc: 0,
                total: 0
            }
        }
        people.push(person);
    });
    console.log("people:",people);
    var share = total * 0.7;
    share /= people.length;
    var rolePerk = total * 0.15;
    var helpPerk = total * 0.15;
    var distributed = 0;
    var helpers = 0;
    var numRoles = 0;
    var totalHelpedHours = 0;
    for(var i = 0; i < people.length; i++) {
        var person = people[i];
        var cardPerc = share;
        if (person.completed < minCards) {
            cardPerc = (person.completed / minCards) * share;
            var dis = (1 - (person.completed / minCards)) * share;
            distributed += dis;
            person.plusNegative.cardPerc = dis;
            person.plusNegative.total += dis;
        }
        person.cardPerc = cardPerc;
        person.effort = cardPerc;
        if (person.role != "Dev") {
            numRoles++;
        }
        if (person.helped) {
            helpers++;
            totalHelpedHours += person.hoursHelped;
        }
        console.log(person);
    }
    console.log("numRoles: " + numRoles);
    if (numRoles <= 0) distributed += rolePerk;
    else rolePerk /= numRoles;
    if (totalHelpedHours == 0) distributed += helpPerk;
    for (var i = 0; i < people.length; i++) {
        var person = people[i];
        if (person.role != "Dev") {
            var rolePerc = rolePerk * (person.rolestrength / 5);
            person.rolePerc = rolePerc;
            person.effort += rolePerc;
            var dis = (1 - (person.rolestrength / 5)) * rolePerk;
            person.plusNegative.rolePerc = dis;
            person.plusNegative.total += dis;
            distributed += dis;
        }
    }
    var total = 0;
    for(var i = 0; i < people.length; i++) {
        var person = people[i];
        if (person.helped) {
            var distPerc = distributed * (person.hoursHelped / totalHelpedHours);
            person.effort += distPerc;
            person.distPerc = distPerc;
            var helpPerc = helpPerk * (person.hoursHelped / totalHelpedHours);
            person.effort += helpPerc;
            person.helpPerc = helpPerc;
        } else if (totalHelpedHours == 0) {
            person.effort += distributed / people.length;
            person.distPerc = distributed / people.length;
        }
        total += person.effort;
    }
    console.log("Total: " + total);
    $("form > div.form-person").attr("hidden",true);
    var elem = $(".calc");
    elem.attr("hidden",false);
    $(".form-team").remove();
    var clone = elem.find(".form-chart:nth-child(1)").clone();

    elem.find(".form-chart:nth-child(1)").attr("hidden",true);
    var personData = [];
    for (var i = 0; i < people.length; i++) {
        clone = clone.clone();
        clone.appendTo(".calc");
        var person = people[i];
        if(person.effort > 0) personData.push({ label: person.name, y: person.effort.toFixed(2), legendText: person.name + "'s contribution"});
        console.log("found: ",clone.find("#chartContainer"));
        console.log(person);
        var data = [];
        if (person.helpPerc > 0) data.push({ label: "Helping others/Pair programming", y: (person.helpPerc / person.effort * 100).toFixed(2), actual: person.helpPerc.toFixed(2), legendText: "Helping Others" });
        else data.push({ label:" Helping others/Pair programming", y: 0, actual: 0, legendText: "Helping Others" });
        if (person.plusNegative.total > 0) {
            data.push({ label: "Subtractions:<br/>Cards: " + person.plusNegative.cardPerc.toFixed(2) +"%<br/>Role: " + person.plusNegative.rolePerc.toFixed(2) + "%", y: person.plusNegative.total, actual: person.plusNegative.total.toFixed(2), legendText: "Subtracted"});
        } else {
            data.push({ label: "Subtractions from lack of effort", y: 0, legendText: "Subtracted"});
        }
        if (person.rolePerc > 0) data.push({ label: "Role", y: (person.rolePerc / person.effort * 100).toFixed(2), actual: person.rolePerc.toFixed(2), legendText: "Role duties" });
        else data.push({ label: "Role", y: 0, actual: 0, legendText: "Role duties" });
        if (person.cardPerc > 0) data.push({ label: "Cards attempted", y: (person.cardPerc / person.effort * 100).toFixed(2), actual: person.cardPerc.toFixed(2), legendText: "Cards Attempted"});
        else data.push({ label: "Cards attempted", y: 0, actual: 0, legendText: "Cards Attempted"});
        if (person.distPerc > 0) data.push({ label: "Left-over points added from distribution", y: (person.distPerc / person.effort * 100).toFixed(2), actual: person.distPerc.toFixed(2), legendText: "Distributed"});
        else data.push({ label: "Left-over points added from distribution", y: 0, actual: 0, legendText: "Distributed"});
        clone.find("#chartContainer").CanvasJSChart({
            title: {
                text: "Individual Effort: " + person.name,
                fontSize: 24
            },
            axisY: {
                title: "Effort in %"
            },
            legend: {
                verticalAlign: "center",
                horizontalAlign: "right"
            },
            data: [
                {
                    type: "pie",
                    showInLegend: true,
                    toolTipContent: "{label} <br/> {y} % of " + person.effort.toFixed(2) + " %",
                    indexLabel: "{actual} %",

                    dataPoints: data
                }
            ]
        });
    }
   for (var i = 0; i < people.length; i++) {
        var person = people[i];
        var div = $(".calc > .form-chart:nth-child(" + (i + 2) + ")");
        div.find(".percent").html(person.name + "' s Effort: <b>" + person.effort.toFixed(2) + "%</b>");
    }
    clone = clone.clone();
    clone.appendTo(".calc");
    clone.find("#chartContainer").CanvasJSChart({
        title: {
            text: "Total Team Effort: " + total.toFixed(2) + "%",
            fontSize: 24
        },
        axisY: {
            title: "Effort in %"
        },
        legend: {
            verticalAlign: "center",
            horizontalAlign: "right"
        },
        data: [
            {
                type: "pie",
                showInLegend: true,
                toolTipContent: "{label} <br/> {y} %",
                indexLabel: "{y} %",

                dataPoints: personData
            }
        ]
    });
    clone.find(".percent").html("");
    $(".submit").remove();
    $(".form-min").remove();
 }
function popUp(e) {
    var elem = $(e.target);
    console.log(findPerson(elem,"#myPopup").length);
    var popup = findPerson(elem,"#myPopup");
    var link = findPerson(elem,"a");
    popup.offset({left: link.position().left - popup.width() * 0.5, top: link.position().top - popup.height() * 2 });
    popup.toggle();
}
function findPerson(elem, find) {
    var i = 0;
    var select = ".form-group";
    while (i < 10 && elem.find(select).length == 0) {
        elem = elem.parent();
        console.log(elem.html());
        i++;
    }
    console.log(i);
    console.log("length: " + elem.find(find).length);
    return elem.find(find);

}