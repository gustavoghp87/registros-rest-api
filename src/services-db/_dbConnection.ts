import { MongoClient } from 'mongodb'
import { databaseUrl } from '../env-variables'

export class DbConnection {
    public dbMW: string = "Misericordia-Web"
    public collUsers: string = "usuarios"
    public collUnit: string = "viviendas"
    public collEmails: string = "emailAlert"
    public collTerr: string = "territorios"
    public collCasa: string = "casaEnCasa"
    public Client: MongoClient = new MongoClient(databaseUrl)
    
    constructor (testingDb: boolean) {
        if (testingDb) this.dbMW = "Misericordia-Web-Testing"
        this.Client.connect().then(() => console.log("DB connected -", this.dbMW, "\n\n"))
    }
}
