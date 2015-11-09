var mapFunction = function() {
    var teamArray = [
        "Explosive Renteria",
        "Ham Fighters",
        "Harare Antelopes",
        "Dickeys Spicy BonERA",
        "The Bobos",
        "Seaguel Gonzales",
        "Man Bear Puig",
        "Mighty Camels",
        "Toronto Donkeys",
        "EEE's Parrots"
    ];

    while (teamArray.length > 0) {
        var teamName = teamArray.shift();
        if (this[teamName]) {
            var value = {
                rank: this[teamName]["ranks"]["rankAverage"],
                opponentRank: this[teamName]["opponentRanks"]["rankAverage"],
                count: 1
            }
            emit (teamName, value);
        }
    }
};

var reduceFunction = function(teamName, rankSummaryValues) {
    totalRanks = { rank: 0, opponentRank: 0, count: 1 };

    for (var idx = 0; idx < rankSummaryValues.length; idx++) {
        totalRanks.rank += rankSummaryValues[idx].rank;
        totalRanks.opponentRank += rankSummaryValues[idx].opponentRank;
        totalRanks.count += rankSummaryValues[idx].count;
    }

    return totalRanks;
};

var finalizeFunction = function (key, totalRanks) {

    totalRanks.avgRank = totalRanks.rank/totalRanks.count;
    totalRanks.avgOpponentRank = totalRanks.opponentRank/totalRanks.count;

    return totalRanks;

};

// Calculation is done by Mongo's map-reduce functionality. Results found in 'overallRanks' collection.
db.matchupRanks.mapReduce( mapFunction,
    reduceFunction,
    {
        out: { merge: "overallRanks" },
        query: {},
        finalize: finalizeFunction
    }
)