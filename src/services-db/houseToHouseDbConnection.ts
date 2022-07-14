import { dbClient, logger } from '../server'
import { generalError } from '../services/log-services'
import { typeCoords, typeDoNotCall, typeFace, typeHTHTerritory, typeObservation, typePolygon } from '../models/houseToHouse'
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
            console.log(polygon);
            
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory },
                { $push: { "map.polygons": polygon } }
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
    async DeleteHTHDoNotCall(doNotCallId: number, territory: typeTerritoryNumber, block: typeBlock, face: typeFace): Promise<boolean> {
        try {
            if (!doNotCallId || !territory || !block || !face) throw new Error("No llegó no tocar id o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory },
                { $set: { "map.polygons.$[i].doNotCalls.$[j].deleted": true } },
                { arrayFilters: [
                    { "i.block": block, "i.face": face },
                    { "j.id": doNotCallId }
                ] }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló DeleteHTHDoNotCall() territorio ${territory} id ${doNotCallId}: ${error}`, generalError)
            return false
        }
    }
    async DeleteHTHObservation(observationId: number, territory: typeTerritoryNumber, block: typeBlock, face: typeFace): Promise<boolean> {
        try {
            if (!observationId || !territory || !block || !face) throw new Error("No llegó observación id o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory },
                { $set: { "map.polygons.$[i].observations.$[j].deleted": true } },
                { arrayFilters: [
                    { "i.block": block, "i.face": face },
                    { "j.id": observationId }
                ] }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló DeleteHTHObservation() territorio ${territory} id ${observationId}: ${error}`, generalError)
            return false
        }
    }
    async EditHTHObservation(observation: typeObservation, territory: typeTerritoryNumber, block: typeBlock, face: typeFace): Promise<boolean> {
        try {
            console.log(observation, territory, block, face);
            
            if (!observation || !territory || !block || !face) throw new Error("No llegaron observaciones o territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory },
                { $set: { "map.polygons.$[i].observations.$[j].text": observation.text } },
                { arrayFilters: [
                    { "i.block": block, "i.face": face },
                    { "j.id": observation.id }
                ] }
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditHTHObservation() territorio ${territory}: ${error}`, generalError)
            return false
        }
    }
    async EditHTHPolygon(polygon: typePolygon, territory: typeTerritoryNumber): Promise<boolean> {
        try {
            if (!polygon || !territory) throw new Error("No llegaron el polígono o el territorio")
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.block": polygon.block, "map.polygons.face": polygon.face, "map.polygons.id": polygon.id },
                { $set: {
                    "map.polygons.$.coordsPoint1": polygon.coordsPoint1,
                    "map.polygons.$.coordsPoint2": polygon.coordsPoint2,
                    "map.polygons.$.coordsPoint3": polygon.coordsPoint3
                }}
            )
            console.log("RESULT:", result)
            return true
        } catch (error) {
            console.log(error)
            logger.Add(`Falló EditHTHPolygon() territorio ${territory}: ${error}`, generalError)
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
    async SetHTHIsFinished(isFinished: boolean,
        territory: typeTerritoryNumber, block: typeBlock, face: typeFace, polygonId: number): Promise<boolean> {
        try {
            console.log(isFinished, block, face);
            
            if (!block || !face || !territory || isFinished === undefined || !polygonId) throw new Error("No llegaron datos")
            let result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTH).updateOne(
                { territory, "map.polygons.block": block, "map.polygons.face": face, "map.polygons.id": polygonId },
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
