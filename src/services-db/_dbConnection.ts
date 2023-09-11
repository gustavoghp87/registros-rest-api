import { databaseUrl, databaseUrlTesting } from '../env-variables'
import { MongoClient } from 'mongodb'

type typeCollection =
    'Campaigns' |
    'Config' |
    'Emails' |
    'HouseToHouseTerritories' |
    'Logs' |
    'TelephonicTerritories' |
    'Users' |
    'Weather'
;

export class DbConnection {
    public DbMW: string = 'Misericordia-Web'
    private DbMWTesting: string = 'Misericordia-Web-Testing'

    public Client: MongoClient
    public CollCampaigns: typeCollection = 'Campaigns'
    public CollConfig: typeCollection = 'Config'
    public CollEmails: typeCollection = 'Emails'
    public CollHTHTerritories: typeCollection = 'HouseToHouseTerritories'
    public CollLogs: typeCollection = 'Logs'
    public CollTelephonicTerritories: typeCollection = 'TelephonicTerritories'
    public CollUsers: typeCollection = 'Users'
    public CollWeather: typeCollection = 'Weather'

    constructor (testingDb: boolean) {
        if (testingDb) {
            this.DbMW = this.DbMWTesting
            this.Client = new MongoClient(databaseUrlTesting)
        } else {
            this.Client = new MongoClient(databaseUrl)
        }
        this.Client.connect().then(() => {
            console.log("\nDB connected -", this.DbMW, "\n\n")
        })
    }
}
