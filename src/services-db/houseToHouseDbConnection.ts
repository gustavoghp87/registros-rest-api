import { dbClient, logger } from '../server'
import { generalError } from '../services/log-services'
import { typeCoords, typeDoNotCall, typeFace, typeHTHMap, typeHTHTerritory, typeObservation, typePolygon } from '../models/houseToHouse'
import { typeBlock, typeTerritoryNumber } from '../models/household'
import { UpdateResult } from 'mongodb'

export class HouseToHouseDb {
    async AddBlockFaceStreetToHTHTerritory(territory: typeTerritoryNumber, block: typeBlock, face: typeFace, street: string): Promise<boolean> {
        try {
            if (!territory || !block || !face || !street) throw new Error("No llegó manzana, cara, calle o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory },
                { $addToSet: { blocks: block, faces: face, streets: street } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AddBlockFaceStreetToHTHTerritory() territorio ${territory} ${block} ${face} ${street}: ${error}`, generalError)
            return false
        }
    }
    async AddHTHDoNotCall(doNotCall: typeDoNotCall, territory: typeTerritoryNumber, block: typeBlock, face: typeFace): Promise<boolean> {
        try {
            if (!doNotCall || !territory || !block || !face) throw new Error("No llegó no tocar o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.block": block, "map.polygons.face": face },
                { $addToSet: { "map.polygons.$.doNotCalls": doNotCall } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AddHTHDoNotCall() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async AddHTHObservation(observation: typeObservation, territory: typeTerritoryNumber, block: typeBlock, face: typeFace): Promise<boolean> {
        try {
            if (!observation || !territory || !block || !face) throw new Error("No llegó observación o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.block": block, "map.polygons.face": face },
                { $addToSet: { "map.polygons.$.observations": observation } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AddHTHObservation() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async AddHTHPolygonFace(polygon: typePolygon, territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!polygon || !territory) throw new Error("No llegó polígono o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.block": polygon.block, "map.polygons.face": polygon.face },
                { $addToSet: { "map.polygons": polygon } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló AddHTHObservation() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async CreateHTHTerritories(email: string): Promise<boolean> {
        try {
            for (let i = 1; i <= 56; i++) {
                console.log("Creating hth territory", i)
                const hthTerritory: typeHTHTerritory = {
                    blocks: [],
                    faces: [],
                    map: {
                        centerCoords: {
                            lat: -34.6324233875622,
                            lng: -58.455761358048456
                        },
                        lastEditor: email,
                        markers: [],
                        polygons: [],
                        zoom: 17
                    },
                    streets: [],
                    territory: i.toString() as typeTerritoryNumber
                }
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).insertOne(hthTerritory)
            }
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async DeleteHTHDoNotCall(doNotCallId: number, territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!doNotCallId || !territory) throw new Error("No llegó no tocar id o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.doNotCalls.id": doNotCallId },
                { $set: { "map.polygons.$.doNotCalls.$.deleted": true } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló DeleteHTHDoNotCall() territorio ${territory} id ${doNotCallId}: ${error}`, generalError)
            return false
        }
    }
    async DeleteHTHObservation(observationId: number, territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!observationId || !territory) throw new Error("No llegó observación id o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.observations.id": observationId },
                { $set: { "map.polygons.$.observations.$.deleted": true } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló DeleteHTHObservation() territorio ${territory} id ${observationId}: ${error}`, generalError)
            return false
        }
    }
    async EditHTHDoNotCall(doNotCall: typeDoNotCall, territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!doNotCall || !territory) throw new Error("No llegaron no tocar o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.doNotCalls.id": doNotCall.id },
                { $set: { "map.polygon.$.doNotCalls": doNotCall } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditHTHDoNotCall() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async EditHTHObservation(observation: typeObservation, territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!observation || !territory) throw new Error("No llegaron observaciones o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.observations.id": observation.id },
                { $set: { "map.polygons.$.observations": observation } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditHTHObservation() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async EditViewHTHMap(territory: typeTerritoryNumber, centerCoords: typeCoords, zoom: number, lastEditor: string): Promise<boolean> {
        try {
            if (!centerCoords || !zoom || !territory) throw new Error("No llegaron coordenadas, zoom o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory },
                { $set: { "map.centerCoords": centerCoords, "map.zoom": zoom, "map.lastEditor": lastEditor } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditViewHTHMap() territorio ${territory} ${centerCoords} ${zoom}: ${error}`, generalError)
            return false
        }
    }
    async GetHTHTerritory(territory: typeTerritoryNumber): Promise<typeHTHTerritory|null> {
        try {
            if (!territory) throw new Error("No llegó territorio")
            const hthTerritory: typeHTHTerritory =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).findOne({ territory }) as typeHTHTerritory
            return hthTerritory
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetHTHTerritory() territorio ${territory}`, generalError)
            return null
        }
    }
    async SetHTHIsFinished(isFinished: boolean, territory: typeTerritoryNumber, block: typeBlock, face: typeFace): Promise<boolean> {
        try {
            if (!block || !face || !territory || isFinished === undefined) throw new Error("No llegaron datos")
            let result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.block": block, "map.polygons.face": face },
                { $set: { "map.polygons.$.isFinished": isFinished } }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló SetHTHIsFinished() territorio ${territory + ' ' + block + ' ' + face}: ${error}`, generalError)
            return false
        }
    }
}
