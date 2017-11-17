function flightSearchHandler(res) {
    $("#medProtection").toggle();
    var fields = getFields(res);
    createIndentedColumns(fields);
    createFlightSearchData(res.body['result'], fields);
}

function seatSearchHandler(res) {
    var fields = getFields(res);
    createIndentedColumns(fields);
    createSeatSearchData(res.body['result'], fields);
}

function addBaggageHandler(res) {
    var fields = getFields(res);
    createBaggageColumns(fields);
    createBaggageData(res.body['result'], fields);
}

function getFields(res) {
    var fields = [];
    res.body["fields"].forEach(function (field) {
        fields.push(field["name"]);
    });
    return fields
}

function createIndentedColumns(fields) {
    var fieldRow = $('<tr>');
    fieldRow.append($('<th>').text(""));

    fields.forEach(function(field) {
        fieldRow
            .append($('<th>')
                .text(field))
    });

    $('#flightSearchTable').append($('<thead>').append(fieldRow));
}

function createBaggageColumns(fields) {
    var fieldRow = $('<tr>');

    fields.forEach(function(field) {
        fieldRow
            .append($('<th>')
                .text(field))
    });

    fieldRow.append($('<th>').text("Number of baggage"));
    $('#flightSearchTable').append($('<thead>').append(fieldRow));
}

function createFlightSearchData(results, fields) {
    results.forEach(function(result) {
        var fieldRow = $('<tr>');
        fieldRow.append($('<td> <input type="checkbox" onclick="setFlightAndGetSeats(this)"> </td>'));
        fields.forEach(function(field) {
            var text = 'N/A';
            if (typeof result[field] !== 'undefined') {
                text = result[field];
            }
            fieldRow
                .append($('<td>')
                    .text(text))
        });
        $('#flightSearchTable').append($('<tbody>').append(fieldRow));
    });
}

function createSeatSearchData(results, fields) {
    results.forEach(function(result) {
        var fieldRow = $('<tr>');
        fieldRow.append($('<td> <input type="checkbox" onclick="setSeatAndGetBaggageOptions(this)"> </td>'));
        fields.forEach(function(field) {
            var text = 'N/A';
            if (typeof result[field] !== 'undefined') {
                text = result[field];
            }
            fieldRow
                .append($('<td>')
                    .text(text))
        });
        $('#flightSearchTable').append($('<tbody>').append(fieldRow));
    });
}

function createBaggageData(results, fields) {
    var count = 0;
    results.forEach(function (result) {
        var fieldRow = $('<tr>');

        fields.forEach(function (field) {
            var text = 'N/A';
            if (typeof result[field] !== 'undefined') {
                text = result[field];
            }

            if (field === "fee" && result[field] !== 0) {
                reservation.checkedFee = result[field];
            }

            fieldRow
                .append($('<td>')
                    .text(text));
        });

        addBaggageInput(count++, fieldRow);
        $('#flightSearchTable').append($('<tbody>').append(fieldRow));
    });
}

function addBaggageInput(count, fieldRow) {
    if (count) {
        fieldRow.append($('<td> <input type="number" min="0" max="2" value="0" id="checkedNum"> </td>'));
    } else {
        fieldRow.append($('<td> <input type="number" min="0" max="1" value="0" id="carryonNum"> </td>'));
    }
}

function addMedProtection() {
    reservation.medProtectionUsed = !reservation.medProtectionUsed;
}

function setFlightAndGetSeats(obj) {
    var selectedFlight = getDataInRow(obj);
    setFlightInfo(selectedFlight);

    $("#medProtection").hide();
    clearFlightSearchTable();

    var sql = getAvailableSeatsSQL(reservation.flightNum);
    postQuerySync({query: sql}, seatSearchHandler);
}

function setFlightInfo(selectedFlight) {
    reservation.flightNum = selectedFlight[1];
    reservation.dptCity = selectedFlight[4];
    reservation.arrCity = selectedFlight[8];
    reservation.dptDate = selectedFlight[6];
    reservation.dptTime = selectedFlight[7];
}

function setSeatAndGetBaggageOptions(obj) {
    var selectedFlight = getDataInRow(obj);
    reservation.seatNum = selectedFlight[1];
    reservation.seatPrice = selectedFlight[3];

    clearFlightSearchTable();
    $("#baggageOption").toggle();

    var sql = getBaggageFeeSQL();
    postQuerySync({query: sql}, addBaggageHandler);
}

function getDataInRow(obj) {
    var row = obj.parentNode.parentNode;
    var cols = row.getElementsByTagName("td");
    var data = [];

    for (var i = 0; i < cols.length; i++) {
        var val = cols[i].childNodes[0].nodeValue;
        if (val != null) {
            data.push(val);
        }
    }

    return data;
}

function setAndShowReservation() {
    addBaggageToReservation();
    setConfNum();
    setEmail();
    setTotalCost();
    validateMileageMember();

    $("#flightSearchTable").hide();
    $("#baggageOption").hide();
    showReservationSummary();
}

function addBaggageToReservation() {
    reservation.carryonNum = $('#flightSearchTable').find("input[id='carryonNum']").val();
    reservation.checkedNum = $('#flightSearchTable').find("input[id='checkedNum']").val();
}

function setTotalCost() {
    reservation.cost = Number(reservation.seatPrice);
    reservation.cost += Number(reservation.checkedFee * reservation.checkedNum);

    if (reservation.medProtectionUsed) {
        reservation.cost += Number(medProtFee);
    }

    reservation.finalCost = reservation.cost;
}

function setConfNum() {
    reservation.confNum = Math.floor(Math.random() * 1000000);
}

function setEmail() {
    reservation.email = window.sessionStorage.getItem("email");
}

function showReservationSummary() {
    setReservationTableValue();
    $("#reservationSummary").toggle();
}

function setReservationTableValue() {
    document.getElementById("rs-flightNum").innerHTML = reservation.flightNum;
    document.getElementById("rs-confNum").innerHTML = reservation.confNum;
    document.getElementById("rs-dptCity").innerHTML = reservation.dptCity;
    document.getElementById("rs-arrCity").innerHTML = reservation.arrCity;
    document.getElementById("rs-dptDate").innerHTML = reservation.dptDate;
    document.getElementById("rs-dptTime").innerHTML = reservation.dptTime;
    document.getElementById("rs-seatNum").innerHTML = reservation.seatNum;
    document.getElementById("rs-carryon").innerHTML = reservation.carryonNum;
    document.getElementById("rs-checked").innerHTML = reservation.checkedNum;
    document.getElementById("rs-cost").innerHTML = "$" + reservation.finalCost;
    showMedProtection();
}

function showMedProtection() {
    if (reservation.medProtectionUsed) {
        document.getElementById("rs-medProt").innerHTML = "selected";
    } else {
        document.getElementById("rs-medProt").innerHTML = "not selected";
    }
}

function validateMileageMember() {
    var sql = getMileageMemberSQL();
    postQuery({query: sql}, mileageMemberHandler);
}

function mileageMemberHandler(res) {
    var result = res.body['result'][0];
    var point = result["mpoint"];

    if (typeof point === 'undefined') {
        reservation.point = -1;
        return;
    }

    showPointOption(point);
}

function showPointOption(point) {
    reservation.point = point;
    var finalSaving = getSavingFromPoint(point);
    var updatedPoint = getUpdatedPoint(finalSaving);

    $("#usePoint"+"+span").html(" You have " + point + " points. You can save $" + finalSaving +
        " on this trip and your remaining point will be " + updatedPoint + ".");
    $("#usePoint").toggle();
}

function getSavingFromPoint(point) {
    var conversedPoint = Number(point) / Number(pointRate);
    return Math.min(conversedPoint, reservation.cost);
}

function getUpdatedPoint(finalSaving) {
    return Number(reservation.point) - (Number(finalSaving) * Number(pointRate));
}

function updateTotalCost() {
    reservation.pointUsed = !reservation.pointUsed;

    if (reservation.pointUsed) {
        var finalSaving = getSavingFromPoint(reservation.point);
        reservation.finalCost -= Number(finalSaving);
        setReservationTableValue();
    } else {
        reservation.finalCost = reservation.cost;
        setReservationTableValue();
    }
}

function makeReservation() {
    if (reservation.pointUsed) {
        var finalSaving = getSavingFromPoint(reservation.point);
        reservation.point = getUpdatedPoint(finalSaving);
        updateMileagePoint(reservation.point);
    }

    revertReservation();
}

function revertReservation() {
    updateMileagePoint(300);
}

var medProtFee = 50;
var pointRate = 100;
var defaultReservation = {
    flightNum: "",
    dptCity: "",
    arrCity: "",
    dptTime: "",
    dptDate: "",
    seatNum: "",
    seatPrice: 0,
    confNum: -1,
    pointUsed: 0,
    medProtectionUsed: 0,
    email: "",
    carryonNum: 0,
    checkedNum: 0,
    checkedFee: 0,
    cost: 0,
    finalCost: 0,
    point: 0
};

var reservation = {
    flightNum: "",
    dptCity: "",
    arrCity: "",
    dptTime: "",
    dptDate: "",
    seatNum: "",
    seatPrice: 0,
    confNum: -1,
    pointUsed: 0,
    medProtectionUsed: 0,
    email: "",
    carryonNum: 0,
    checkedNum: 0,
    checkedFee: 0,
    cost: 0,
    finalCost: 0,
    point: 0
};

function clearFlightSearchTable() {
    $('#flightSearchTable').text('');
}

function getFlightSearchSQL() {
    var $input = $('#flightSearch'),
        dptDate = $input.find("input[id='dptDate']").val(),
        arrCity = $input.find("input[id='arrCity']").val(),
        dptCity = $input.find("input[id='dptCity']").val();

    // For testing purpose
    var dptDate = "2017-12-21";
    var arrCity = "Vancouver";
    var dptCity = "Tokyo";

    return "select distinct f.flightNum, f.duration, f.miles," +
        " ap1.city as dptCity, d.dptAirportCode as dptAirport, d.dptDate, d.dptTime," +
        " ap2.city as arrCity, a.arrAirportCode as arrAirport, a.arrDate, a.arrTime" +
        " from flight f, departure d, arrival a, airport ap1, airport ap2" +
        " where ap1.acode = d.dptAirportCode and ap1.city = '" + dptCity + "' and d.dptDate = '" + dptDate +
        "' and d.dptDate = f.dptDate and d.dptFSid = f.dptFSid and" +
        " ap2.acode = a.arrAirportCode and ap2.city = '" + arrCity +
        "' and a.arrDate = f.arrDate and a.arrFSid = f.arrFSid";
}

function getAvailableSeatsSQL(flightNum){
    return "select s.seatNum, st.stype, st.price" +
        " from Seat s, SeatType st, Airplane a, Flight f" +
        " where s.isAvailable = 1 and s.stype = st.stype and s.pid = a.pid and a.pid = f.pid and f.flightNum = "
        + flightNum + " order by st.price";
}

function getBaggageFeeSQL(){
    return "select * from baggageType";
}

function getMileageMemberSQL(){
    return "select mpoint from mileagemember where email = '" + reservation.email + "'";
}

function updateMileagePoint(updatedPoint){
    var sql = "update mileagemember m" +
        " set m.mpoint = " + updatedPoint + " where m.email = '" + reservation.email + "'";

    postQuery({query: sql});
}

function insertReservation(confnum, flightNum, cost, pointUsed, email){
    var sql = "insert into reservation" +
        " values("+ confnum + "," + cost + "," + pointUsed +"," + email + ")";

    postQuery({query: sql});

    sql = "insert into reserveFlight" +
        " values("+ confnum + "," + flightNum + ")";

    postQuery({query: sql});
}

function selectSeat(seatNum, confNum){
    return "update seat"+
        " set seat.isAvailable = 0 and seat.confNum = " + confNum +
        " where seat.seatNum = '" + seatNum + "'";
}

function checkBaggageCarouselNumber(flightnum){
    return "select a.carousel"+
            " from Flight f, Arrival a"+
            " where f.arrDate = a.arrDate and f.arrFSid = a.arrFSid and"+
            " f.flightNum = "+ flightnum + "";
}

function checkNumSeats(dptDate, dptTime){
     return "select s.type as type, count(*) as count" +
        " from flight f, airplane a, departure d, seat s" +
        " where f.pid = a.pid and d.dptDate = f.dptDate and d.dptFSid = f.dptFSid and" +
        " d.dptDate = "+ dptDate + " and d.dptTime = "+ dptTime + " and s.isAvailable = 1" +
        " group by s.stype";

}

function passengerCheckTotalCost (email){
    return "select sum(cost)" +
            " from Reservation r" +
            " group by " + email + "";
}