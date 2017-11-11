
function postQuery(query, handler) {
    $.ajax({
        type: 'POST',
        url: "./query",
        data: JSON.stringify(query),
        contentType: "application/json; charset=utf-8",
        success: handler
    })
}

function contentsHandler(res) {
    var fields = [];

    res.data["fields"].forEach(function (field) {
        fields.push(field["name"]);
    });
    createColumns(fields);
    createData(res.data['result'], fields);
}

function createColumns(fields) {
    var fieldRow = $('<tr>');
    fields.forEach(function(field) {
        fieldRow
            .append($('<th>')
                .text(field))
    });
    $('#resTable').append($('<thead>').append(fieldRow));
}

function createData(results, fields) {
    results.forEach(function(result) {
        var fieldRow = $('<tr>');
        fields.forEach(function(field) {
            var text = 'N/A';
            if (typeof result[field] !== 'undefined') {
                text = result[field];
            }
            fieldRow
                .append($('<td>')
                    .text(text))
        });
        $('#resTable').append($('<tbody>').append(fieldRow));
    });
}



function clearResult() {
    $('#resTable').text('');
}

function getFlightSearchSQL() {
    var $input = $('#flightSearch'),
        arrDate = $input.find("input[id='arrDate']").val(),
        dptDate = $input.find("input[id='dptDate']").val(),
        arrCity = $input.find("input[id='arrCity']").val(),
        dptCity = $input.find("input[id='dptCity']").val();

    // For testing purpose
    var arrDate = "2017-12-21";
    var dptDate = "2017-12-21";
    var arrCity = "Vancouver";
    var dptCity = "Tokyo";

    return "select distinct f.flightNum, f.duration, f.miles," +
        " ap1.city as dptCity, d.dptAirportCode as dptAirport, d.dptDate, d.dptTime," +
        " ap2.city as arrCity, a.arrAirportCode as arrAirport, a.arrDate, a.arrTime" +
        " from flight f, departure d, arrival a, airport ap1, airport ap2" +
        " where ap1.acode = d.dptAirportCode and ap1.city = '" + dptCity + "' and d.dptDate = '" + dptDate +
        "' and d.dptDate = f.dptDate and d.dptFSid = f.dptFSid and" +
        " ap2.acode = a.arrAirportCode and ap2.city = '" + arrCity + "' and a.arrDate = '" + arrDate +
        "' and a.arrDate = f.arrDate and a.arrFSid = f.arrFSid";
}


$(document).ready(function () {
    clearResult();
    var session = window.sessionStorage,
        isLoggedIn = JSON.parse(session.getItem('isLoggedIn'));
    if (isLoggedIn) {
        var logout = $('<a>')
            .attr('id', 'logout')
            .text("Logout");

        $('#right').append($('<li>')
            .append(logout))
    }
    else {
        var signup =  $('<a>')
            .attr('href', '/signup')
            .text("Sign Up");
        var login = $('<a>')
            .attr('href', '/login')
            .text('Login');
        $('#right')
            .append($('<li>')
                .append(signup))
            .append($('<li>')
                .append(login))
    }

    $("#clearTable").click(function () {
        clearResult();
    });

    $("#submitQuery").click(function() {
        clearResult();
        if (session === "undefined" || !JSON.parse(session.getItem('isLoggedIn'))){
            window.location.href = './login';
            return;
        }

        var sql = getFlightSearchSQL();
        postQuery({query: sql}, contentsHandler);
    });

    $(document).on("click", "#logout", function () {
        session.clear();
        window.location.href = './'
    })
});