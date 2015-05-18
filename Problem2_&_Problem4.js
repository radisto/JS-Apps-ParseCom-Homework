$.ajax({
    method: 'get',
    headers: {
        'X-Parse-Application-Id': 'Mv248r8bnylYI52LQEv3oyBXUNJCQJGlGsmvtEGA',
        'X-Parse-REST-API-Key': 'qrltHp4aereH1QyuEjNaWJYHwbfqkg1OHkwBDlS7'
    },
    url:'https://api.parse.com/1/classes/Town?include=country'
}).success(function(data){
    var countries = {};
    data.results.forEach(function(i){
        var country = i.country.name;
        var town = i.name;
        if (!countries[country]){
            countries[country] = [];
        }
        countries[country].push(town);
    });
    $('<div>').attr('id', 'wrapper').appendTo($('body'));
    for (country in countries){
        $('<div>').attr('id', country).addClass('country')
            .on('click', function(){show(this)}).appendTo($('#wrapper'));
        $('<h4>').text(country).appendTo($('#' + country));
    }

    function show($this){
        var parentCountry = $('#' + $($this).text());
        countries[$($this).text()].sort().forEach(function(town){
            $('<p>').text(town).appendTo(parentCountry);
        })
    }
}).error(function(err){
    console.log(err.responseText);
});