import { MongoClient } from 'mongodb'
import { databaseUrl } from '../env-variables'

type typeCollection =
    'Campaigns' |
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

    public CollCampaigns: typeCollection = 'Campaigns'
    public CollEmails: typeCollection = 'Emails'
    public CollHTHTerritories: typeCollection = 'HouseToHouseTerritories'
    public CollLogs: typeCollection = 'Logs'
    public CollTelephonicTerritories: typeCollection = 'TelephonicTerritories'
    public CollUsers: typeCollection = 'Users'
    public CollWeather: typeCollection = 'Weather'

    public Client: MongoClient = new MongoClient(databaseUrl)
    
    constructor (testingDb: boolean) {
        if (testingDb) this.DbMW = this.DbMWTesting
        this.Client.connect().then(() => {
            console.log("\nDB connected -", this.DbMW, "\n\n")
        })
    }
}
