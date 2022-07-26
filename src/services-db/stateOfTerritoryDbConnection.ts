import { UpdateResult } from 'mongodb'
import { dbClient, logger } from '../server'
import { generalError } from '../services/log-services'
import { typeStateOfTerritory } from '../models'

export class StateOfTerritoryDb {
    async GetStateOfTerritory(territory: string): Promise<typeStateOfTerritory|null> {
        try {
            const obj: typeStateOfTerritory =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTerr).findOne({ territorio: territory }) as typeStateOfTerritory
            return obj
        } catch (error) {
            console.log("Territory Db SearchStateOfTerritory", error)
            logger.Add(`Falló GetStateOfTerritory() pasando ${territory}: ${error}`, generalError)
            return null
        }
    }
    async GetStateOfTerritories(): Promise<typeStateOfTerritory[]|null> {
        try {
            const obj: typeStateOfTerritory[]|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTerr).find().toArray() as typeStateOfTerritory[]
            return obj
        } catch (error) {
            console.log("Territory Db SearchStatesOfTerritories", error)
            logger.Add(`Falló GetStateOfTerritories(): ${error}`, generalError)
            return null
        }
    }
    async ChangeStateOfTerritory(territory: string, isFinished: boolean): Promise<boolean> {
        try {
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTerr).updateOne({ territorio: territory }, {
                $set: { isFinished }
            })
            return !!result && !!result.modifiedCount
        } catch (error) {
            console.log("Territory Db ChangeStateOfTerritory", error)
            logger.Add(`Falló ChangeStateOfTerritory() pasando ${territory} a ${isFinished}: ${error}`, generalError)
            return false
        }
    }
    async SetResetDate(territory: string, option: number): Promise<boolean> {
        try {
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTerr).updateOne({ territorio: territory }, {
                $push: { resetDate: { date: + new Date(), option } }
            })
            return !!result && !!result.modifiedCount
        } catch (error) {
            console.log(error);
            logger.Add(`Falló SetResetDate() pasando ${territory} opción ${option}: ${error}`, generalError)
            return false
        }
    }
}
