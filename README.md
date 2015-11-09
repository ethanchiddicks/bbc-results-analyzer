# bbc-results-analyzer
This is a quick-and-dirty proof-of-concept Strength of Competition analyzer for an ESPN fantasy baseball league.

## To run ##
1. Clone this repo.
2. Run `npm install` to install dependencies.
3. Ensure MongoDB is running locally, change DB connection string in scripts if differently configured.
4. Run `node resultLoader.js` to load the data from the CSVs into Mongo.
5. Run `node rankResults.js` to run the ranking algorithm over the results in Mongo.
6. Run `node calculateOverallRanks.js` to run a Mongo map-reduce process to calculate aggregate season-long results.
