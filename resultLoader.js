var fs = require('fs');
var parse = require('csv-parse');
var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var MongoURL = 'mongodb://localhost:27017/scheduleAnalyzer';
var matchupSummaryConstructor = function(filename, row1, row2) {
    var nameRegex = /^[#\d ]*([\w ']+)/m;
    return {
        "Week" : filename.replace("Matchup", "").replace(".csv", ""),
        "Team1" : {
            "Name" : nameRegex.exec(row1.shift())[1].trim(),
            "H" : parseInt(row1.shift(), 10),
            "R" : parseInt(row1.shift(), 10),
            "HR" : parseInt(row1.shift(), 10),
            "TB" : parseInt(row1.shift(), 10),
            "RBI" : parseInt(row1.shift(), 10),
            "BB" : parseInt(row1.shift(), 10),
            "SB" : parseInt(row1.shift(), 10),
            "AVG" : parseFloat(row1.shift()),
            "IP" : parseFloat(row1.shift()),
            "K" : parseInt(row1.shift(), 10),
            "QS" : parseInt(row1.shift(), 10),
            "W" : parseInt(row1.shift(), 10),
            "SV" : parseInt(row1.shift(), 10),
            "HD" : parseInt(row1.shift(), 10),
            "ERA" : parseFloat(row1.shift()),
            "WHIP" : parseFloat(row1.shift())
        },
        "Team2" : {
            "Name" : nameRegex.exec(row2.shift())[1].trim(),
            "H" : parseInt(row2.shift(), 10),
            "R" : parseInt(row2.shift(), 10),
            "HR" : parseInt(row2.shift(), 10),
            "TB" : parseInt(row2.shift(), 10),
            "RBI" : parseInt(row2.shift(), 10),
            "BB" : parseInt(row2.shift(), 10),
            "SB" : parseInt(row2.shift(), 10),
            "AVG" : parseFloat(row2.shift()),
            "IP" : parseFloat(row2.shift()),
            "K" : parseInt(row2.shift(), 10),
            "QS" : parseInt(row2.shift(), 10),
            "W" : parseInt(row2.shift(), 10),
            "SV" : parseInt(row2.shift(), 10),
            "HD" : parseInt(row2.shift(), 10),
            "ERA" : parseFloat(row2.shift()),
            "WHIP" : parseFloat(row2.shift())
        }
    }
}

fs.readdir(__dirname+'/BBCResults', function(err, files){
    files.forEach(function (element, index, array){
        var matchupResult = fs.readFileSync(__dirname + '/BBCResults/' + element, 'utf8');
        parse(matchupResult, {}, function(err, output) {
            if (err) throw err;
            MongoClient.connect(MongoURL, function(err, db) {
                assert.equal(null, err);
                console.log("Connected correctly to server.");
                var matchupsArray = [];
                while (output.length > 0) {
                    matchupsArray.push(matchupSummaryConstructor(element, output.shift(), output.shift()));
                }
                db.collection("matchups").insertMany(
                    matchupsArray,
                    function(err, result) {
                        assert.equal(err, null);
                        console.log("Inserted a matchup from " + element + " into collection");
                        db.close();
                    }
                );
            });
        });
    });
});







