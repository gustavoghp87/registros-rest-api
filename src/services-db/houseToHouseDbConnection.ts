import { dbClient, logger } from '../server'
import { generalError } from '../services/log-services'
import { typeDoNotCall, typeFace, typeHTHMap, typeHTHTerritory, typeObservation } from '../models/houseToHouse'
import { typeBlock, typeTerritoryNumber } from '../models/household'

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
            // console.log("RESULT:", result)
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
            // console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AddBuilding() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async EditHTHDoNotCall(doNotCalls: typeDoNotCall[], territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!doNotCalls || !territory) throw new Error("No llegaron no tocar o territorio")
            const result = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                { territory },
                { $set: { doNotCalls } }
            )
            // console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditHTHDoNotCall() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async EditHTHObservation(observations: typeObservation[], territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!observations || !territory) throw new Error("No llegaron observaciones o territorio")
            const result = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                { territory },
                { $set: { observations } }
            )
            // console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditHTHObservation() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async SetHTHIsFinished(isFinish: boolean, block: typeBlock, face: typeFace, territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!block || !face || !territory || isFinish === undefined) throw new Error("No llegaron datos")
            let result
            if (isFinish) {
                result = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                    { territory },
                    { $addToSet: { finished: { block, face } } }
                )
            } else {
                result = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                    { territory },
                    { $pull: { finished: { block, face } } }
                )
            }
            // console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló SetHTHIsFinished() territorio ${territory + ' ' + block + ' ' + face}: ${error}`, generalError)
            return false
        }
    }
    // async GetHTHMap(territory: typeTerritoryNumber): Promise<typeHTHMap|null> {
    //     try {
    //         if (!territory) throw new Error("No llegaron datos")
    //         const hthMap: typeHTHMap|null = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).findOne({ territory }) as typeHTHMap
    //         return hthMap
    //     } catch (error) {
    //         console.log(error)
    //         logger.Add(`Falló GetHTHMap() territorio ${territory}: ${error}`, generalError)
    //         return null
    //     }
    // }
    async EditHTHMap(territory: typeTerritoryNumber, hthMap: typeHTHMap): Promise<boolean> {
        try {
            if (!territory) throw new Error("No llegaron datos")
            console.log(hthMap);
            
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                { territory },
                { $set: { hthMap } }
            )
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetHTHMap() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async CreateMaps(email: string): Promise<boolean> {
        try {
            for (let i = 1; i <= 56; i++) {
                console.log("Creating", i);
                
                const hthMap: typeHTHMap = {
                    centerCoords: {
                        lat: -34.6324233875622,
                        lng: -58.455761358048456
                    },
                    lastEditor: email,
                    markers: [],
                    polygons: [],
                    zoom: 17
                }
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollCasa).updateOne(
                    { territory: i.toString() },
                    { $set: { hthMap } }
                )
            }
            return true
        } catch (error) {
            
            return false
        }
    }
}
