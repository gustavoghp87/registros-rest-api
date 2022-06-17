import { dbClient, logger } from '../server'
import { generalError } from '../services/log-services'
import { typeDoNotCall, typeHTHTerritory, typeObservation } from '../models/houseToHouse'
import { typeTerritoryNumber } from '../models/household'

export class HouseToHouseDb {
    async GetHTHTerritory(territory: typeTerritoryNumber): Promise<typeHTHTerritory|null> {
        try {
            const hthTerritory: typeHTHTerritory =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).findOne({ territory }) as typeHTHTerritory
            return hthTerritory
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetHTHTerritory() territorio ${territory}`, generalError)
            return null
        }
    }
    async AddHTHDoNotCall(doNotCall: typeDoNotCall, territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!doNotCall || !territory) throw new Error("No llegó no tocar o territorio")
            const result = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                { territory },
                { $push: { doNotCalls: doNotCall } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AddBuilding() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async AddHTHObservation(observation: typeObservation, territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!observation || !territory) throw new Error("No llegó observación o territorio")
            const result = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                { territory },
                { $push: { observations: observation } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AddBuilding() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async EditHTHDoNotCall(doNotCalls: typeDoNotCall[], territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!doNotCalls || !doNotCalls.length || !territory) throw new Error("No llegaron no tocar o territorio")
            const result = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                { territory },
                { $set: { doNotCalls } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditHTHDoNotCall() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async EditHTHObservation(observations: typeObservation[], territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!observations || !observations.length || !territory) throw new Error("No llegaron observaciones o territorio")
            const result = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                { territory },
                { $set: { observations } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditHTHObservation() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
}
