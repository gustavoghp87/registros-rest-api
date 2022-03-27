// import { logger } from '../server'
import { MongoClient } from 'mongodb'
import { databaseUrl } from '../env-variables'

export type typeCollection = "usuarios" | "viviendas" | "emailAlert" | "territorios" | "casaEnCasa" | "campaign2022" | "LoginLogs" | "CampaignAssignmentLogs" | "CampaignFinishingLogs" | "TerritoryChangeLogs" | "StateOfTerritoryChangeLogs" | "ErrorLogs" | "SocketErrorLogs" | "UserChangesLogs" | "AppLogs"

export class DbConnection {

    public DbMW: string = "Misericordia-Web"
    private DbMWTesting: string = "Misericordia-Web-Testing"
    public DbMWLogs: string = "Misericordia-Web-Logs"
    
    public CollUsers: typeCollection = "usuarios"
    public CollUnit: typeCollection = "viviendas"
    public CollEmails: typeCollection = "emailAlert"
    public CollTerr: typeCollection = "territorios"
    public CollCasa: typeCollection = "casaEnCasa"
    public CollCampaign: typeCollection = "campaign2022"

    public CollLoginLogs: typeCollection = "LoginLogs"
    public CollCampaignAssignmentLogs: typeCollection = "CampaignAssignmentLogs"
    public CollCampaignFinishingLogs: typeCollection = "CampaignFinishingLogs"
    public CollTerritoryChangeLogs: typeCollection = "TerritoryChangeLogs"
    public CollStateOfTerritoryChangeLogs: typeCollection = "StateOfTerritoryChangeLogs"
    public CollErrorLogs: typeCollection = "ErrorLogs"
    public CollSocketErrorLogs: typeCollection = "SocketErrorLogs"
    public CollUserChangesLogs: typeCollection = "UserChangesLogs"
    public CollAppLogs: typeCollection = "AppLogs"

    public Client: MongoClient = new MongoClient(databaseUrl)
    
    constructor (testingDb: boolean) {
        if (testingDb) this.DbMW = this.DbMWTesting
        this.Client.connect().then(() => {
            console.log("DB connected -", this.DbMW, "\n\n")
            // logger.Add(`Inicia objeto DB`, "app")
        })
    }
}
