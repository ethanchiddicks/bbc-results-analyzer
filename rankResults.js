var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var MongoURL = 'mongodb://localhost:27017/scheduleAnalyzer';
var categoryList = {
    "H" : true,
    "R" : true,
    "HR" : true,
    "TB" : true,
    "RBI" : true,
    "BB" : true,
    "SB" : true,
    "AVG" : true,
    "IP" : true,
    "K" : true,
    "QS" : true,
    "W" : true,
    "SV" : true,
    "HD" : true,
    "ERA" : false,
    "WHIP" : false,
};
var weeksArray = [];

MongoClient.connect(MongoURL, function(err, db) {
    assert.equal(null, err);
    weeksArray = db.collection("matchups").distinct("Week",
        function(err, docs) {
            assert.equal(null, err);
            weeksArray = docs.sort();
            weeksArray.forEach(function(element, index, array) {
                var opponents = {};
                var results = {};
                var cursor = db.collection("matchups").find({"Week" : element}).toArray(function(err, docs) {
                    console.log(element);
                    for (var i = 0; i < docs.length; i++) {
                        opponents[docs[i].Team1.Name] = docs[i].Team2.Name;
                        results[docs[i].Team1.Name] = docs[i].Team1;
                        results[docs[i].Team2.Name] = docs[i].Team2;
                    }
                    ranksTable = produceRankTable(results);
                    opponentsTable = productOpponentRankTable(ranksTable, opponents);
                    weeklyRankSummary = {};
                    weeklyRankSummary['Week'] = element;
                    for (var teamName in ranksTable) {
                        if(ranksTable.hasOwnProperty(teamName)) {
                            weeklyRankSummary[teamName] = {};
                            weeklyRankSummary[teamName]['ranks'] = ranksTable[teamName];
                            weeklyRankSummary[teamName]['opponentRanks'] = opponentsTable[teamName];
                        }
                    }
                    db.collection("matchupRanks").insertOne(
                        weeklyRankSummary,
                        function(err, result) {
                            assert.equal(err, null);
                            console.log("Inserted matchup summary for week " + element);
                        }
                    );
                });
            });
        });
});

// Produce table of ranks for each team and category for a matchup.
var produceRankTable = function(resultsTable) {
    var ranksTable = {};

    // Create entries for each team proactively to prevent errors below.
    for (var teamName in resultsTable) {
        if (resultsTable.hasOwnProperty(teamName)) {
            ranksTable[teamName] = {};
        }
    }

    // Loop through each category, as defined above, and assign a rank to each team.
    for (var categoryKey in categoryList) {
        if (categoryList.hasOwnProperty(categoryKey)) {
            var categoryHigherIsBetter = categoryList[categoryKey];
            var teamArray = [];
            var valueArray = [];
            for (var teamName in resultsTable) {
                if (resultsTable.hasOwnProperty(teamName)) {
                    var teamResult = resultsTable[teamName];
                    teamArray.push(teamName);
                    valueArray.push(teamResult[categoryKey]);
                }
            }
            var sorted = [];
            if (categoryHigherIsBetter) {
                sorted = valueArray.slice().sort(function(a,b) {
                    return b-a;
                });
            } else {
                sorted = valueArray.slice().sort(function(a,b) {
                    return a-b;
                });
            }
            var ranksArray = valueArray.slice().map(function(v) {
                return sorted.indexOf(v)+1;
            });
            while (teamArray.length > 0) {
                ranksTable[teamArray.pop()][categoryKey] = ranksArray.pop();
            }
        }
    }

    // Calculate the average rank for each team before returning ranks table.
    for (var teamName in ranksTable) {
        if (ranksTable.hasOwnProperty(teamName)) {
            var teamRanks = ranksTable[teamName];
            var rankTotal = 0;
            for (var categoryKey in teamRanks) {
                rankTotal += teamRanks[categoryKey];
            }
            ranksTable[teamName]['rankAverage'] = (rankTotal / 16);
        }
    }

    return ranksTable;
}

// Function for constructing table of opponents' ranks for the matchup.
var productOpponentRankTable = function(ranksTable, opponents) {
    var opponentsRanksTable = {}
    for (var homeTeam in opponents) {
        if (opponents.hasOwnProperty(homeTeam)) {
            var awayTeam = opponents[homeTeam];
            opponentsRanksTable[homeTeam] = ranksTable[awayTeam];
            opponentsRanksTable[awayTeam] = ranksTable[homeTeam];
        }
    }
    return opponentsRanksTable;
}