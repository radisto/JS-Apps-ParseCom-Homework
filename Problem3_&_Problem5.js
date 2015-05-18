var ajaxRequester = (function () {
    var makeRequest = function makeRequest(method, url, data, success, error) {
        return $.ajax({
            headers: {
                'X-Parse-Application-Id': 'Mv248r8bnylYI52LQEv3oyBXUNJCQJGlGsmvtEGA',
                'X-Parse-REST-API-Key': 'qrltHp4aereH1QyuEjNaWJYHwbfqkg1OHkwBDlS7'
            },
            contentType: 'application/json',
            method: method,
            url: url,
            data: JSON.stringify(data),
            success: success,
            error: error
        })
    };

    function getRequest(url, success, error) {
        return makeRequest('GET', url, null, success, error);
    }

    function postRequest(url, data, success, error) {
        return makeRequest('POST', url, data, success, error);
    }

    function putRequest(url, data, success, error) {
        return makeRequest('PUT', url, data, success, error);
    }

    function deleteRequest(url, success, error) {
        return makeRequest('DELETE', url, {}, success, error);
    }

    return {
        get: getRequest,
        post: postRequest,
        put: putRequest,
        delete: deleteRequest
    }
}());

function addToDom(innerText, dataIdName){
    var countryTown = $('<div>').addClass('CountryAndTown').appendTo('#countryContainer');
    var div = $('<div>').addClass('CountryDiv').attr('data-id', dataIdName).appendTo(countryTown);
    var span = $('<span>').addClass('CountrySpan').text(innerText).appendTo(div);
    for (var i = 0; i < 3; i++){
        span.fadeOut(200).fadeIn(200);
    }
    $('<br>').appendTo(div);
    $('<input>').attr('type', 'text').attr('size', '10px').attr('id', dataIdName).appendTo(div);
    $('<br>').appendTo(div);
    $('<button>').text('Edit').addClass('editButton').click(editCountry).appendTo(div);
    $('<br>').appendTo(div);
    $('<button>').text('Delete').click(deleteCountry).appendTo(div);
    $('<br>').appendTo(div);
    $('<button>').text('Show Towns').addClass('showButton').click(showTown).appendTo(div);
}

var url = 'https://api.parse.com/1/classes/';

function success(data){
    if ('name' in data) {
        addToDom(data.name, data.objectId);
    } else if ('objectId' in data) {
        ajaxRequester.get(url + 'Country/' + data.objectId, success, error);
    } else if ('results' in data) {
        data.results.forEach(function(country){
            addToDom(country.name, country.objectId);
        })
    } else {
        console.log(data);
    }
}

function error(err){
    console.log(err.responseText);
}

ajaxRequester.get(url  + 'Country?order=name', success, error);

$('<input>').attr('type', 'text').attr('id', 'countryName').appendTo('#buttonContainer');
$('<button>').text('ADD COUNTRY').click(addCountry).appendTo('#buttonContainer');

function addCountry(){
    var countryName = $('#countryName');
    if (countryName.val()){
        ajaxRequester.post(url + 'Country', {name : countryName.val()}, success, error);
        countryName.val('');
    }
}

function editCountry(){
    var isChecked = false;
    var editId = $(this).parent().attr('data-id');
    var radioButtons = $('input[name=' + editId + ']');
    var newName = $('#' + editId);
    var myButton;
    if (newName.val()){
        radioButtons.each(function(i){
            if ($(radioButtons.get(i)).prop('checked')){
                isChecked = true;
                myButton = $(radioButtons.get(i));
            }
        });
        if (isChecked) {
            var townId = myButton.parent().parent().attr('data-id');
            ajaxRequester.put(url + 'Town/' + townId, {name : newName.val()}, success, error);
            myButton.next().text(newName.val());
            newName.val('');
        } else {
            ajaxRequester.put(url + 'Country/' + editId, {name : newName.val()}, success, error);
            $(this).parent().find('span').text(newName.val());
            newName.val('');
        }
    }
}

function deleteCountry(){
    var isChecked = false;
    var deleteId = $(this).parent().attr('data-id');
    var radioButtons = $('input[name=' + deleteId + ']');
    radioButtons.each(function(i){
        if ($(radioButtons.get(i)).prop('checked')){
            isChecked = true;
            myButton = $(radioButtons.get(i));
        }
    });
    if (isChecked){
        var deleteTownId = myButton.parent().parent().attr('data-id');
        ajaxRequester.delete(url + 'Town/' + deleteTownId, success, error);
        myButton.parent().parent().remove();
    } else {
        var countryName = $(this).parent().find('span').text();
        var toDelete = confirm('Are you sure to delete "' + countryName + '"?');
        if (toDelete){
            ajaxRequester.delete(url + 'Country/' + deleteId, success, error);
            $(this).parent().parent().remove();
        }
    }
}

function townSuccess(data, id){
    if ('name' in data){
        addTownToDom(data.country.objectId, data.name, data.objectId);
    } else if ('objectId' in data){
        ajaxRequester.get(url + '/Town/' + data.objectId, townSuccess, error);
    } else if ('results' in data){
        data.results.forEach(function(i){
            if (i.country.objectId == id){
                addTownToDom(id, i.name, i.objectId);
            }
        });
    } else {
        console.log(data);
    }
}

function addTownToDom(countryId, townName, townId){
    var button = $('[data-id=' + countryId + ']').next().find('button');
    var radio = $('<input>').attr('type', 'radio').attr('name', countryId).val(townName);
    var span = $('<span>').text(townName);
    var label = $('<label>').append(radio).append(span);
    $('<p>').attr('data-id', townId).append(label).insertBefore(button);
}

function showTown(){
    if ($(this).text() == 'Show Towns'){
        var parent = $(this).parent().parent();
        var countryName = $(this).parent().find('span').text();
        var div = $('<div>').addClass('TownDiv').appendTo(parent);
        $('<span>').text('Towns in ' + countryName).appendTo(div);
        $('<button>').text('Add Town').addClass('addTownButton').click(addTownToCountry).appendTo(div);
        var countryId = $(this).parent().attr('data-id');
        ajaxRequester.get(url + 'Town?order=name', function(ajax){townSuccess(ajax, countryId)}, error);
        $(this).text('Hide Towns');
        $(this).parent().css('margin-right', '14px');
    } else {
        $(this).parent().parent().find('div.TownDiv').remove();
        $(this).text('Show Towns');
        $(this).parent().css('margin-right', 0);
    }
}

function addTownToCountry(){
    var townCountryId = $(this).parent().prev().attr('data-id');
    var townName = $('#' + townCountryId);
    if (townName.val()){
        ajaxRequester.post(url + 'Town', {name : townName.val(), country: {__type: "Pointer", className: "Country", objectId: townCountryId}}, townSuccess, error);
        townName.val('');
    }
}