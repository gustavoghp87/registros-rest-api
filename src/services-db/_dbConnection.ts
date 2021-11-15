import { MongoClient } from 'mongodb'
import { databaseUrl } from '../env-variables'

export class DbConnection {
    public dbMW: string = "Misericordia-Web"
    public collUsers: string = "usuarios"
    public collUnit: string = "viviendas"
    public collEmails: string = "emailAlert"
    public collTerr: string = "territorios"
    public Client: MongoClient = new MongoClient(databaseUrl,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    constructor (testingDb: boolean) {
        if (testingDb) this.dbMW = "Misericordia-Web-Testing"
        ;(async () => {
            await this.Client.connect()
            console.log("DB connected -", this.dbMW, "\n\n")
        })()
    }
}
