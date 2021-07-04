import { MongoClient } from 'mongodb'
import { databaseUrl } from '../env-variables'

export const dbMW = "Misericordia-Web"
export const collUsers = "usuarios"
export const collUnit = "viviendas"
export const collEmails = "emailAlert"
export const collCampaign = "campanya"
export const collTerr = "territorios"

export class DbConnection {
    public Client: MongoClient = new MongoClient(databaseUrl,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    constructor () {
        ;(async () => {
            await this.Client.connect()
            console.log("DB connected")
        })()
    }
}
