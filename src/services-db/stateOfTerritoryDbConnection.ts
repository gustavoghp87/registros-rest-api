import { dbClient, logger } from '../server'
import { stateOfTerritory } from '../models/stateOfTerritory'

export class StateOfTerritoryDb {
    
    async GetStateOfTerritory(territory: string): Promise<stateOfTerritory|null> {
        try {
            const obj: stateOfTerritory =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTerr).findOne({ territorio: territory }) as stateOfTerritory
            return obj
        } catch (error) {
            console.log("Territory Db SearchStateOfTerritory", error)
            logger.Add(`Falló GetStateOfTerritory() pasando ${territory}: ${error}`, "error")
            return null
        }
    }
    
    async GetStateOfTerritories(): Promise<stateOfTerritory[]|null> {
        try {
            const obj: stateOfTerritory[]|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTerr).find().toArray() as stateOfTerritory[]
            return obj
        } catch (error) {
            console.log("Territory Db SearchStatesOfTerritories", error)
            logger.Add(`Falló GetStateOfTerritories(): ${error}`, "error")
            return null
        }
    }
    
    async ChangeStateOfTerritory(territory: string, isFinished: boolean): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTerr).updateOne({ territorio: territory }, {
                $set: { isFinished }
            })
            return true
        } catch (error) {
            console.log("Territory Db ChangeStateOfTerritory", error)
            logger.Add(`Falló ChangeStateOfTerritory() pasando ${territory} a ${isFinished}: ${error}`, "error")
            return false
        }
    }
    
    async SetResetDate(territory: string, option: number): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTerr).updateOne({ territorio: territory }, {
                $push: { resetDate: { date: + new Date(), option } }
            })
            return true
        } catch (error) {
            console.log(error);
            logger.Add(`Falló SetResetDate() pasando ${territory} opción ${option}: ${error}`, "error")
            return false
        }
    }
}
