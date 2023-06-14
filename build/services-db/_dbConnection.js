"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbConnection = void 0;
const mongodb_1 = require("mongodb");
const env_variables_1 = require("../env-variables");
class DbConnection {
    constructor(testingDb) {
        this.DbMW = 'Misericordia-Web';
        this.DbMWTesting = 'Misericordia-Web-Testing';
        this.CollCampaigns = 'Campaigns';
        this.CollEmails = 'Emails';
        this.CollHTHTerritories = 'HouseToHouseTerritories';
        this.CollLogs = 'Logs';
        this.CollTelephonicTerritories = 'TelephonicTerritories';
        this.CollUsers = 'Users';
        this.CollWeather = 'Weather';
        this.Client = new mongodb_1.MongoClient(env_variables_1.databaseUrl);
        if (testingDb)
            this.DbMW = this.DbMWTesting;
        this.Client.connect().then(() => {
            console.log("\nDB connected -", this.DbMW, "\n\n");
        });
    }
}
exports.DbConnection = DbConnection;
