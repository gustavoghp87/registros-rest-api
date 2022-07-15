import { Credentials } from 'google-auth-library'
import { InsertOneResult, UpdateResult } from 'mongodb'
import { dbClient, logger } from '../server'
import { emailError } from '../services/log-services'

export class EmailDb {
    //private _id: ObjectId = new ObjectId('5fcbdce29382c6966fa4d583')
    async GetEmailLastTime(): Promise<number|null> {
        try {
            const lastEmailObj: any|null = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).findOne()
            if (!lastEmailObj) throw new Error("No se pudo leer documento")
            const lastEmailTime: number|null = lastEmailObj.lastEmail
            return lastEmailTime
        } catch (error) {
            console.log("Get Email Last Time failed", error)
            logger.Add(`Falló GetEmailLastTime(): ${error}`, emailError)
            return null
        }
    }
    async GetGmailTokens(): Promise<Credentials|null> {
        try {
            const tokens = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).findOne()
            if (!tokens) throw new Error("No se pudo leer documento")
            return {
                access_token: tokens.accessToken,
                expiry_date: 0,
                id_token: '',
                refresh_token: tokens.refreshToken,
                scope: '',
                token_type: ''
            }
        } catch (error) {
            logger.Add(`Falló GetGmailTokens(): ${error}`, emailError)
            return null
        }
    }
    async UpdateLastEmail(): Promise<boolean> {
        try {
            const newDate = + new Date()
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).updateOne(
                {  },
                { $set: { lastEmail: newDate } }
            )
            const lastEmailObj: any|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).findOne()
            if (!lastEmailObj || (lastEmailObj.lastEmail !== newDate)) return false
            return true
        } catch (error) {
            console.log("Update Last Email failed", error)
            logger.Add(`Falló UpdateLastEmail(): ${error}`, emailError)
            return false
        }
    }
    async SaveNewGmailAPITokensToDB(accessToken: string, refreshToken: string): Promise<boolean> {
        const CreateDocument = async (): Promise<boolean> => {
            try {
                const result: InsertOneResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).insertOne({
                    accessToken, refreshToken
                })
                return result && result.insertedId ? true : false
            } catch (error) {
                console.log(error)
                return false
            }
        }
        try {
            if (!accessToken || !refreshToken) throw new Error("No llegaron los tokens")
            const tokens = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).findOne()
            if (!tokens) {
                const success: boolean = await CreateDocument()
                if (!success) throw new Error("No se pudo crear documento")
            }
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails).updateOne(
                {  },
                { $set: { accessToken, refreshToken } }
            )
            if (!result || !result.modifiedCount) {
                throw new Error("No encontró valor a modificar")
            }
            return true
        } catch (error) {
            console.log("Falló SaveNewGmailAPITokensToDB", error)
            logger.Add(`Falló SaveNewGmailAPITokensToDB(): ${error}`, emailError)
            return false
        }
    }
}
