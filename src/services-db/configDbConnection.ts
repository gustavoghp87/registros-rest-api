import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { InsertOneResult, UpdateResult } from 'mongodb'
import { typeConfig } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollConfig)

export class ConfigDb {
    async Genesys(congregation: number): Promise<boolean> {
        try {
            if (!congregation || !Number.isInteger(congregation)) throw Error("Faltan datos")
            const config: typeConfig = {
                congregation,
                date: +new Date(),
                googleBoardUrl: '',
                name: "",
                numberOfTerritories: 0
            }
            const result: InsertOneResult = await getCollection().insertOne(config)
            console.log("Config Genesys:", result.insertedId)
            return !!result.insertedId
        } catch (error) {
            logger.Add(1, `Falló Config Genesys(): ${error}`, errorLogs)
            return false
        }
    }
    async GetConfig(congregation: number): Promise<typeConfig|null> {
        try {
            if (!congregation) throw Error("Faltan datos")
            const config = await getCollection().findOne({ congregation }) as unknown as typeConfig
            return config
        } catch (error) {
            logger.Add(1, `Falló GetConfig() (${congregation}): ${error}`, errorLogs)
            return null
        }
    }
    async InviteNewUser(userId: number, congregation: number, email: string) {
        try {
            if (!userId || !congregation || !email) throw Error("Faltan datos")
            const invitation = {
                
            }
            // const result: UpdateResult = await getCollection().updateOne(
            //     { congregation },
            //     { $addToSet: { invitations: email} }
            // )
            // return !!result.modifiedCount
            return true
        } catch (error) {
            logger.Add(congregation, `Falló InviteNewUser() (${name}): ${error}`, errorLogs)
            return false
        }
    }
    async SetNameOfCongregation(congregation: number, name: string): Promise<boolean> {
        try {
            if (!congregation || !name || name.length < 6) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { name } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetNameOfCongregation() (${name}): ${error}`, errorLogs)
            return false
        }
    }
    async SetNumberOfTerritories(congregation: number, numberOfTerritories: number): Promise<boolean> {
        try {
            if (!congregation || !numberOfTerritories || !Number.isInteger(numberOfTerritories)) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { numberOfTerritories } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetNumberOfTerritories() (${numberOfTerritories}): ${error}`, errorLogs)
            return false
        }
    }
    async SetGoogleBoardUrl(congregation: number, googleBoardUrl: string) {
        try {
            if (!congregation || !googleBoardUrl) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { googleBoardUrl } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetGoogleBoardUrl() (${googleBoardUrl}): ${error}`, errorLogs)
            return false
        }
    }
}
