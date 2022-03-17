import { MongoClient } from 'mongodb'
import { databaseUrl } from '../env-variables'

export class DbConnection {

    public DbMW: string = "Misericordia-Web"
    public DbMWLogs: string = "Misericordia-Web-Logs"
    
    public CollUsers: string = "usuarios"
    public CollUnit: string = "viviendas"
    public CollEmails: string = "emailAlert"
    public CollTerr: string = "territorios"
    public CollCasa: string = "casaEnCasa"
    public CollCampaign: string = "campaign2022"

    public CollLoginLogs: string = "LoginLogs"
    public CollCampaignAssignmentLogs: string = "CampaignAssignmentLogs"
    public CollCampaignFinishingLogs: string = "CampaignFinishingLogs"
    public CollTerritoryChangeLogs: string = "TerritoryChangeLogs"
    public CollStateOfTerritoryChangeLogs: string = "StateOfTerritoryChangeLogs"
    public CollErrorLogs: string = "ErrorLogs"
    public CollSocketErrorLogs: string = "SocketErrorLogs"
    public CollUserChangesLogs: string = "UserChangesLogs"
    public CollAppLogs: string = "AppLogs"

    public Client: MongoClient = new MongoClient(databaseUrl)
    
    constructor (testingDb: boolean) {
        if (testingDb) this.DbMW = "Misericordia-Web-Testing"
        this.Client.connect().then(() => console.log("DB connected -", this.DbMW, "\n\n"))
    }
}
