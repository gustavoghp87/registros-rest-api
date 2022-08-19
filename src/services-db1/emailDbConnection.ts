import { InsertOneResult, UpdateResult } from 'mongodb'
import { Credentials } from 'google-auth-library'
import { dbClient, logger } from '../server1'
import { errorLogs } from '../services1/log-services'
import { typeEmailObj } from '../models1'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails)

export class EmailDb {
    async GetEmailLastTime(): Promise<number|null> {
        try {
            const lastEmailObj: any|null = await getCollection().findOne()
            if (!lastEmailObj) throw new Error("No se pudo leer documento")
            const lastEmailTime: number|null = lastEmailObj.lastEmail
            return lastEmailTime
        } catch (error) {
            console.log("Get Email Last Time failed", error)
            logger.Add(`Falló GetEmailLastTime(): ${error}`, errorLogs)
            return null
        }
    }
    async GetEmailObject(): Promise<typeEmailObj|null> {
        try {
            const lastEmailObj: any|null = await getCollection().findOne()
            if (!lastEmailObj) throw new Error("No se pudo leer documento")
            return lastEmailObj
        } catch (error) {
            console.log("Get Email Last Time failed", error)
            logger.Add(`Falló GetEmailLastTime(): ${error}`, errorLogs)
            return null
        }
    }
    async GetGmailTokens(): Promise<Credentials|null> {
        try {
            const tokens = await getCollection().findOne()
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
            logger.Add(`Falló GetGmailTokens(): ${error}`, errorLogs)
            return null
        }
    }
    async UpdateLastEmail(): Promise<boolean> {
        try {
            const newDate = + new Date()
            await getCollection().updateOne(
                {  },
                { $set: { lastEmail: newDate } }
            )
            const lastEmailObj: any|null =
                await getCollection().findOne()
            if (!lastEmailObj || (lastEmailObj.lastEmail !== newDate)) return false
            return true
        } catch (error) {
            console.log("Update Last Email failed", error)
            logger.Add(`Falló UpdateLastEmail(): ${error}`, errorLogs)
            return false
        }
    }
    async SaveNewGmailAPITokensToDB(accessToken: string, refreshToken: string): Promise<boolean> {
        const CreateDocument = async (): Promise<boolean> => {
            try {
                const result: InsertOneResult = await getCollection().insertOne({
                    accessToken, refreshToken
                })
                return !!result && !!result.insertedId
            } catch (error) {
                console.log(error)
                return false
            }
        }
        try {
            if (!accessToken || !refreshToken) throw new Error("No llegaron los tokens")
            const tokens = await getCollection().findOne()
            if (!tokens) {
                const success: boolean = await CreateDocument()
                if (!success) throw new Error("No se pudo crear documento")
            }
            const result: UpdateResult = await getCollection().updateOne(
                {  },
                { $set: { accessToken, refreshToken } }
            )
            if (!result || !result.modifiedCount) {
                throw new Error("No encontró valor a modificar")
            }
            return !!result.modifiedCount
        } catch (error) {
            console.log("Falló SaveNewGmailAPITokensToDB", error)
            logger.Add(`Falló SaveNewGmailAPITokensToDB(): ${error}`, errorLogs)
            return false
        }
    }
}
