import { UpdateResult } from 'mongodb'
import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { typeBlock, typeCoords, typeDoNotCall, typeFace, typeHTHBuilding, typeHTHTerritory, typeObservation, typePolygon, typeTerritoryNumber } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTHTerritories)

export class HouseToHouseDb {
    async AddHTHBuilding(territoryNumber: typeTerritoryNumber, block: typeBlock, face: typeFace, building: typeHTHBuilding): Promise<boolean> {
        try {
            if (!territoryNumber || !block || !face || !building) throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $push: { 'map.polygons.$[x].buildings': building } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló AddHTHBuilding() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async AddHTHDoNotCall(territoryNumber: typeTerritoryNumber,
     doNotCall: typeDoNotCall, block: typeBlock, face: typeFace, polygonId: number): Promise<boolean> {
        try {
            if (!doNotCall || !territoryNumber || !block || !face) throw new Error("No llegó no tocar o territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $push: { 'map.polygons.$[x].doNotCalls': doNotCall } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló AddHTHDoNotCall() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async AddHTHObservation(territoryNumber: typeTerritoryNumber,
     observation: typeObservation, block: typeBlock, face: typeFace, polygonId: number): Promise<boolean> {
        try {
            if (!observation || !territoryNumber || !block || !face) throw new Error("No llegó observación o territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $push: { 'map.polygons.$[x].observations': observation } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló AddHTHObservation() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async AddHTHPolygonFace(territoryNumber: typeTerritoryNumber, polygon: typePolygon): Promise<boolean> {
        try {
            if (!polygon || !territoryNumber) throw new Error("No llegó polígono o territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $push: { 'map.polygons': polygon } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló AddHTHObservation() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async CreateHTHTerritories(email: string): Promise<boolean> {
        try {
            for (let i = 1; i <= 56; i++) {
                console.log("Creating hth territory", i)
                const hthTerritory: typeHTHTerritory = {
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
                    territoryNumber: i.toString() as typeTerritoryNumber
                }
                await getCollection().insertOne(hthTerritory)
            }
            return true
        } catch (error) {
            return false
        }
    }
    async DeleteHTHBuilding(territoryNumber: typeTerritoryNumber, block: typeBlock, face: typeFace, streetNumber: number): Promise<boolean> {
        try {
            if (!territoryNumber || !block || !face || !streetNumber) return false
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $pull: { 'map.polygons.$[x].buildings': { streetNumber } } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló DeleteHTHBuilding() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async DeleteHTHDoNotCall(territoryNumber: typeTerritoryNumber, block: typeBlock, face: typeFace, doNotCallId: number): Promise<boolean> {
        try {
            if (!doNotCallId || !territoryNumber || !block || !face) throw new Error("No llegó no tocar id o territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $set: { 'map.polygons.$[i].doNotCalls.$[j].deleted': true } },
                { arrayFilters: [{ 'i.block': block, 'i.face': face }, { 'j.id': doNotCallId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló DeleteHTHDoNotCall() territorio ${territoryNumber} id ${doNotCallId}: ${error}`, errorLogs)
            return false
        }
    }
    async DeleteHTHObservation(territoryNumber: typeTerritoryNumber, block: typeBlock, face: typeFace, observationId: number): Promise<boolean> {
        try {
            if (!observationId || !territoryNumber || !block || !face) throw new Error("No llegó observación id o territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $set: { 'map.polygons.$[i].observations.$[j].deleted': true } },
                { arrayFilters: [{ 'i.block': block, 'i.face': face }, { 'j.id': observationId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló DeleteHTHObservation() territorio ${territoryNumber} id ${observationId}: ${error}`, errorLogs)
            return false
        }
    }
    async DeleteHTHPolygonFace(territoryNumber: typeTerritoryNumber, block: typeBlock, face: typeFace, faceId: number): Promise<boolean> {
        try {
            if (!territoryNumber || !block || !face || !faceId) throw new Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $pull: { 'map.polygons': { block, face, id: faceId } } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló DeleteHTHPolygonFace() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async EditHTHObservation(territoryNumber: typeTerritoryNumber, block: typeBlock, face: typeFace, observation: typeObservation): Promise<boolean> {
        try {
            if (!observation || !territoryNumber || !block || !face) throw new Error("No llegaron observaciones o territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $set: { 'map.polygons.$[i].observations.$[j].text': observation.text } },
                { arrayFilters: [{ 'i.block': block, 'i.face': face }, { 'j.id': observation.id }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló EditHTHObservation() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async EditHTHPolygon(territoryNumber: typeTerritoryNumber, polygon: typePolygon): Promise<boolean> {
        try {
            if (!polygon || !territoryNumber) throw new Error("No llegaron el polígono o el territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber},
                { $set: {
                    'map.polygons.$[x].coordsPoint1': polygon.coordsPoint1,
                    'map.polygons.$[x].coordsPoint2': polygon.coordsPoint2,
                    'map.polygons.$[x].coordsPoint3': polygon.coordsPoint3
                }},
                { arrayFilters: [{ 'x.block': polygon.block, 'x.face': polygon.face, 'x.id': polygon.id }] }
            )
            return true  // do not use .modifiedCount
        } catch (error) {
            logger.Add(`Falló EditHTHPolygon() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async EditStateHTHHousehold(territoryNumber: typeTerritoryNumber, block: typeBlock, face: typeFace, streetNumber: number, householdId: number, isChecked: boolean): Promise<boolean> {
        try {
            if (!territoryNumber || !block || !face || !streetNumber || !householdId) throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $set: { 'map.polygons.$[x].buildings.$[y].households.$[z].isChecked': isChecked } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face }, { 'y.streetNumber': streetNumber }, { 'z.id': householdId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló EditStateHTHHousehold() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async EditStateHTHManagerHousehold(congregation: number, territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, streetNumber: number, isChecked: boolean): Promise<boolean> {
        try {
            if (!congregation || !territoryNumber || !block || !face || !streetNumber)
                throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $set: { 'map.polygons.$[x].buildings.$[y].manager.isChecked': isChecked } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face }, { 'y.streetNumber': streetNumber }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló EditStateHTHHousehold() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async EditViewHTHMap(territoryNumber: typeTerritoryNumber, centerCoords: typeCoords, zoom: number, lastEditor: string): Promise<boolean> {
        try {
            if (!centerCoords || !zoom || !territoryNumber) throw new Error("No llegaron coordenadas, zoom o territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $set: { 'map.centerCoords': centerCoords, 'map.zoom': zoom, 'map.lastEditor': lastEditor } }
            )
            return true  // do not use .modifiedCount
        } catch (error) {
            logger.Add(`Falló EditViewHTHMap() territorio ${territoryNumber} ${centerCoords} ${zoom}: ${error}`, errorLogs)
            return false
        }
    }
    async GetHTHTerritories(): Promise<typeHTHTerritory[]|null> {
        try {
            const hthTerritories: typeHTHTerritory[] = await getCollection().find()?.toArray() as unknown as typeHTHTerritory[]
            return hthTerritories ?? null
        } catch (error) {
            logger.Add(`Falló GetHTHTerritories()`, errorLogs)
            return null
        }
    }
    async GetHTHTerritory(territoryNumber: typeTerritoryNumber): Promise<typeHTHTerritory|null> {
        try {
            if (!territoryNumber) throw new Error("No llegó territorio")
            const hthTerritory: typeHTHTerritory = await getCollection().findOne({ territoryNumber }) as unknown as typeHTHTerritory
            return hthTerritory ?? null
        } catch (error) {
            logger.Add(`Falló GetHTHTerritory() territorio ${territoryNumber}`, errorLogs)
            return null
        }
    }
    async SetHTHIsFinished(territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, polygonId: number, isFinished: boolean): Promise<boolean> {
        try {
            if (!territoryNumber || !block || !face || isFinished === undefined || !polygonId)
                throw new Error("No llegaron datos")
            if (isFinished) {
                const result: UpdateResult = await getCollection().updateOne(
                    { territoryNumber },
                    {
                        $set: { 'map.polygons.$[x].completionData.isFinished': isFinished },
                        $addToSet: { 'map.polygons.$[x].completionData.completionDates': +new Date() }
                    },
                    { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] }
                )
                return !!result.modifiedCount
            } else {
                const result: UpdateResult = await getCollection().updateOne(
                    { territoryNumber },
                    {
                        $set: { 'map.polygons.$[x].completionData.isFinished': isFinished },
                        $addToSet: { 'map.polygons.$[x].completionData.reopeningDates': +new Date() }
                    },
                    { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] }
                )
                return !!result.modifiedCount
            }
        } catch (error) {
            logger.Add(`Falló SetHTHIsFinished() territorio ${territoryNumber} ${block} ${face} ${polygonId}: ${error}`, errorLogs)
            return false
        }
    }
    async SetHTHIsSharedBuildings(territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, polygonId: number, streetNumbers: number[]): Promise<boolean> {
        try {
            if (!territoryNumber || !block || !face || !polygonId || !streetNumbers || !streetNumbers.length) throw new Error("No llegaron datos")
            console.log("db");
            streetNumbers.forEach(async (streetNumber: number) => {
                const result: UpdateResult = await getCollection().updateOne(
                    { territoryNumber },
                    { $set: { 'map.polygons.$[x].buildings.$[y].dateOfLastSharing': +new Date() } },
                    { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }, { 'y.streetNumber': streetNumber }]}
                )
                if (!!result.modifiedCount) return false
            })
            return true
        } catch (error) {
            logger.Add(`Falló SetHTHIsSharedBuildings() territorio ${territoryNumber} ${block} ${face}: ${error}`, errorLogs)
            return false
        }
    }
}
