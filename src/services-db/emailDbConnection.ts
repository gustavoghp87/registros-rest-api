import { InsertOneResult, UpdateResult } from 'mongodb'
import { Credentials } from 'google-auth-library'
import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { typeEmailObj } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollEmails)

export class EmailDb {
    async GetEmailLastTime(): Promise<number|null> {
        try {
            const lastEmailObj: typeEmailObj = await getCollection().findOne() as unknown as typeEmailObj
            if (!lastEmailObj) throw new Error("No se pudo leer documento")
            if (!lastEmailObj.lastEmailDate) throw new Error("No está la fecha")
            return lastEmailObj.lastEmailDate
        } catch (error) {
            logger.Add(`Falló GetEmailLastTime(): ${error}`, errorLogs)
            return null
        }
    }
    async GetEmailObject(): Promise<typeEmailObj|null> {
        try {
            const lastEmailObj: typeEmailObj = await getCollection().findOne() as unknown as typeEmailObj
            if (!lastEmailObj) throw new Error("No se pudo leer documento")
            return lastEmailObj
        } catch (error) {
            logger.Add(`Falló GetEmailObject(): ${error}`, errorLogs)
            return null
        }
    }
    async GetGmailTokens(): Promise<Credentials|null> {
        try {
            const lastEmailObj: typeEmailObj = await getCollection().findOne() as unknown as typeEmailObj
            if (!lastEmailObj) throw new Error("No se pudo leer documento")
            return {
                access_token: lastEmailObj.accessToken,
                expiry_date: 0,
                id_token: '',
                refresh_token: lastEmailObj.refreshToken,
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
            const result: UpdateResult = await getCollection().updateOne(
                {  },
                { $set: { lastEmail: newDate } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló UpdateLastEmail(): ${error}`, errorLogs)
            return false
        }
    }
    async SaveNewGmailAPITokensToDB(accessToken: string, refreshToken: string): Promise<boolean> {  // TODO separate genesys
        const CreateDocument = async (): Promise<boolean> => {
            try {
                const result: InsertOneResult = await getCollection().insertOne({
                    accessToken, refreshToken
                })
                return !!result && !!result.insertedId
            } catch (error) {
                logger.Add(`Falló SaveNewGmailAPITokensToDB(): ${error}`, errorLogs)
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
            logger.Add(`Falló SaveNewGmailAPITokensToDB(): ${error}`, errorLogs)
            return false
        }
    }
}
