import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { typeBlock, typeCoords, typeDoNotCall, typeFace, typeHTHBuilding, typeHTHTerritory, typeObservation, typePolygon, typeTerritoryNumber } from '../models'
import { UpdateResult } from 'mongodb'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollHTHTerritories)

export class HouseToHouseDb {
    async AddHTHBuilding(congregation: number, territoryNumber: typeTerritoryNumber, block: typeBlock, face: typeFace, building: typeHTHBuilding): Promise<boolean> {
        try {
            if (!congregation || !territoryNumber || !block || !face || !building) throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $push: { 'map.polygons.$[x].buildings': building } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló AddHTHBuilding() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async AddHTHDoNotCall(congregation: number, territoryNumber: typeTerritoryNumber,
     doNotCall: typeDoNotCall, block: typeBlock, face: typeFace, polygonId: number): Promise<boolean> {
        try {
            if (!congregation || !doNotCall || !territoryNumber || !block || !face)
                throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $push: { 'map.polygons.$[x].doNotCalls': doNotCall } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló AddHTHDoNotCall() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async AddHTHObservation(congregation: number, territoryNumber: typeTerritoryNumber,
     observation: typeObservation, block: typeBlock, face: typeFace, polygonId: number): Promise<boolean> {
        try {
            if (!congregation || !observation || !territoryNumber || !block || !face) throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $push: { 'map.polygons.$[x].observations': observation } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló AddHTHObservation() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async AddHTHPolygonFace(congregation: number, territoryNumber: typeTerritoryNumber, polygon: typePolygon): Promise<boolean> {
        try {
            if (!congregation || !polygon || !territoryNumber) throw new Error("No llegó polígono o territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $push: { 'map.polygons': polygon } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló AddHTHObservation() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async CreateHTHTerritories(congregation: number, userId: number, numberOfTerritories: number, lat: number, lng: number): Promise<boolean> {
        // miseri lat: -34.6324233875622, lng: -58.455761358048456
        try {
            if (!congregation || !userId || !numberOfTerritories || !Number.isInteger(numberOfTerritories))
                throw Error("Faltan datos")
            for (let i = 1; i <= numberOfTerritories; i++) {
                console.log("Creating hth territory", i)
                const hthTerritory: typeHTHTerritory = {
                    map: {
                        centerCoords: {
                            lat,
                            lng
                        },
                        lastEditor: userId,
                        markers: [],
                        polygons: [],
                        zoom: 17
                    },
                    territoryNumber: i.toString() as typeTerritoryNumber,
                    congregation
                }
                await getCollection().insertOne(hthTerritory)
            }
            return true
        } catch (error) {
            logger.Add(congregation, `Falló CreateHTHTerritories(): ${error}`, errorLogs)
            return false
        }
    }
    async DeleteHTHBuilding(congregation: number, territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, streetNumber: number): Promise<boolean> {
        try {
            if (!congregation || !territoryNumber || !block || !face || !streetNumber) return false
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $pull: { 'map.polygons.$[x].buildings': { streetNumber } } },
                { arrayFilters: [{ 'x.block': block, 'x.face': face }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló DeleteHTHBuilding() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async DeleteHTHDoNotCall(congregation: number, territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, doNotCallId: number): Promise<boolean> {
        try {
            if (!congregation || !doNotCallId || !territoryNumber || !block || !face)
                throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $set: { 'map.polygons.$[i].doNotCalls.$[j].deleted': true } },
                { arrayFilters: [{ 'i.block': block, 'i.face': face }, { 'j.id': doNotCallId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló DeleteHTHDoNotCall() territorio ${territoryNumber} id ${doNotCallId}: ${error}`, errorLogs)
            return false
        }
    }
    async DeleteHTHObservation(congregation: number, territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, observationId: number): Promise<boolean> {
        try {
            if (!congregation || !observationId || !territoryNumber || !block || !face)
                throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $set: { 'map.polygons.$[i].observations.$[j].deleted': true } },
                { arrayFilters: [{ 'i.block': block, 'i.face': face }, { 'j.id': observationId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló DeleteHTHObservation() territorio ${territoryNumber} id ${observationId}: ${error}`, errorLogs)
            return false
        }
    }
    async DeleteHTHPolygonFace(congregation: number, territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, faceId: number): Promise<boolean> {
        try {
            if (!congregation || !territoryNumber || !block || !face || !faceId)
                throw new Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $pull: { 'map.polygons': { block, face, id: faceId } } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló DeleteHTHPolygonFace() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async EditHTHObservation(congregation: number, territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, observation: typeObservation): Promise<boolean> {
        try {
            if (!congregation || !observation || !territoryNumber || !block || !face)
                throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $set: { 'map.polygons.$[i].observations.$[j].text': observation.text } },
                { arrayFilters: [{ 'i.block': block, 'i.face': face }, { 'j.id': observation.id }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló EditHTHObservation() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async EditHTHPolygon(congregation: number, territoryNumber: typeTerritoryNumber,
     polygon: typePolygon): Promise<boolean> {
        try {
            if (!congregation || !polygon || !territoryNumber)
                throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber},
                { $set: {
                    'map.polygons.$[x].coordsPoint1': polygon.coordsPoint1,
                    'map.polygons.$[x].coordsPoint2': polygon.coordsPoint2,
                    'map.polygons.$[x].coordsPoint3': polygon.coordsPoint3
                }},
                { arrayFilters: [{ 'x.block': polygon.block, 'x.face': polygon.face, 'x.id': polygon.id }] }
            )
            return true  // do not use .modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló EditHTHPolygon() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async EditStateHTHHousehold(congregation: number, territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, streetNumber: number, householdId: number, isChecked: boolean): Promise<boolean> {
        try {
            if (!congregation || !territoryNumber || !block || !face || !streetNumber || !householdId)
                throw new Error("No llegaron datos")
            let result: UpdateResult
            if (isChecked) {
                result = await getCollection().updateOne(
                    { congregation, territoryNumber },
                    {
                        $set: { 'map.polygons.$[x].buildings.$[y].households.$[z].isChecked': true },
                        $addToSet: { 'map.polygons.$[x].buildings.$[y].households.$[z].onDates': +new Date() }
                    },
                    { arrayFilters: [{ 'x.block': block, 'x.face': face }, { 'y.streetNumber': streetNumber }, { 'z.id': householdId }] }
                )
            } else {
                result = await getCollection().updateOne(
                    { congregation, territoryNumber },
                    {
                        $set: { 'map.polygons.$[x].buildings.$[y].households.$[z].isChecked': false },
                        $addToSet: { 'map.polygons.$[x].buildings.$[y].households.$[z].offDates': +new Date() }
                    },
                    { arrayFilters: [{ 'x.block': block, 'x.face': face }, { 'y.streetNumber': streetNumber }, { 'z.id': householdId }] }
                )
            }
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló EditStateHTHHousehold() territorio ${territoryNumber}: ${error}`, errorLogs)
            return false
        }
    }
    async EditStateHTHManagerHousehold(congregation: number, territoryNumber: typeTerritoryNumber,
        block: typeBlock, face: typeFace, streetNumber: number, isChecked: boolean): Promise<boolean> {
            try {
                if (!congregation || !territoryNumber || !block || !face || !streetNumber)
                    throw new Error("No llegaron datos")
                let result: UpdateResult
                if (isChecked) {
                    result = await getCollection().updateOne(
                        { congregation, territoryNumber },
                        {
                            $set: { 'map.polygons.$[x].buildings.$[y].manager.isChecked': true },
                            $addToSet: { 'map.polygons.$[x].buildings.$[y].manager.onDates': +new Date() }
                        },
                        { arrayFilters: [{ 'x.block': block, 'x.face': face }, { 'y.streetNumber': streetNumber }] }
                    )
                } else {
                    result = await getCollection().updateOne(
                        { congregation, territoryNumber },
                        {
                            $set: { 'map.polygons.$[x].buildings.$[y].manager.isChecked': false },
                            $addToSet: { 'map.polygons.$[x].buildings.$[y].manager.offDates': +new Date() }
                        },
                        { arrayFilters: [{ 'x.block': block, 'x.face': face }, { 'y.streetNumber': streetNumber }] }
                    )
                }
               return !!result.modifiedCount
           } catch (error) {
               logger.Add(congregation, `Falló EditStateHTHHousehold() territorio ${territoryNumber}: ${error}`, errorLogs)
               return false
           }
       }
    async EditViewHTHMap(congregation: number, territoryNumber: typeTerritoryNumber,
     centerCoords: typeCoords, zoom: number, lastEditor: number): Promise<boolean> {
        try {
            if (!congregation || !centerCoords || !zoom || !territoryNumber)
                throw new Error("No llegaron datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $set: { 'map.centerCoords': centerCoords, 'map.zoom': zoom, 'map.lastEditor': lastEditor } }
            )
            console.log(result)
            return true  // do not use .modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló EditViewHTHMap() territorio ${territoryNumber} ${centerCoords} ${zoom}: ${error}`, errorLogs)
            return false
        }
    }
    async GetHTHTerritories(congregation: number): Promise<typeHTHTerritory[]|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const hthTerritories: typeHTHTerritory[] = await getCollection().find({ congregation })?.toArray() as unknown as typeHTHTerritory[]
            return hthTerritories ?? null
        } catch (error) {
            logger.Add(congregation, `Falló GetHTHTerritories()`, errorLogs)
            return null
        }
    }
    async GetHTHTerritory(congregation: number, territoryNumber: typeTerritoryNumber): Promise<typeHTHTerritory|null> {
        try {
            if (!territoryNumber) throw new Error("No llegó territorio")
            const hthTerritory = await getCollection().findOne({ congregation, territoryNumber }) as unknown as typeHTHTerritory
            return hthTerritory ?? null
        } catch (error) {
            logger.Add(congregation, `Falló GetHTHTerritory() territorio ${territoryNumber}`, errorLogs)
            return null
        }
    }
    async SetHTHIsFinished(congregation: number, territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, polygonId: number, isFinished: boolean): Promise<boolean> {
        try {
            if (!congregation || !territoryNumber || !block || !face || isFinished === undefined || !polygonId)
                throw new Error("No llegaron datos")
            if (isFinished) {
                const result: UpdateResult = await getCollection().updateOne(
                    { congregation, territoryNumber },
                    {
                        $set: { 'map.polygons.$[x].completionData.isFinished': isFinished },
                        $addToSet: { 'map.polygons.$[x].completionData.completionDates': +new Date() }
                    },
                    { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] }
                )
                return !!result.modifiedCount
            } else {
                const result: UpdateResult = await getCollection().updateOne(
                    { congregation, territoryNumber },
                    {
                        $set: { 'map.polygons.$[x].completionData.isFinished': isFinished },
                        $addToSet: { 'map.polygons.$[x].completionData.reopeningDates': +new Date() }
                    },
                    { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] }
                )
                return !!result.modifiedCount
            }
        } catch (error) {
            logger.Add(congregation, `Falló SetHTHIsFinished() territorio ${territoryNumber} ${block} ${face} ${polygonId}: ${error}`, errorLogs)
            return false
        }
    }
    async SetHTHIsSharedAllBuildings(congregation: number, territoryNumber: typeTerritoryNumber, block: typeBlock): Promise<boolean> {
        try {
            if (!congregation || !territoryNumber || !block)
                throw new Error("No llegaron datos")
            console.log("SetHTHIsSharedAllBuildings", territoryNumber, block);
            
            const result: UpdateResult = await getCollection().updateMany(
                { congregation, territoryNumber, 'map.polygons.block': block, 'map.polygons.buildings': { $exists: true } },
                { $set: { 'map.polygons.$[x].buildings.$[].dateOfLastSharing': Date.now() } },
                { arrayFilters: [{ 'x.block': block, 'x.buildings': { $exists: true } }] }
            )
            console.log(result);
            
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetHTHIsSharedAllBuildings() territorio ${territoryNumber} manzana ${block}: ${error}`, errorLogs)
            return false
        }
    }
    async SetHTHIsSharedBuildings(congregation: number, territoryNumber: typeTerritoryNumber,
     block: typeBlock, face: typeFace, polygonId: number, streetNumbers: number[]): Promise<boolean> {
        try {
            if (!congregation || !territoryNumber || !block || !face || !polygonId || !streetNumbers || !streetNumbers.length)
                throw new Error("No llegaron datos")
            streetNumbers.forEach(async streetNumber => {
                const result: UpdateResult = await getCollection().updateOne(
                    { congregation, territoryNumber },
                    { $set: { 'map.polygons.$[x].buildings.$[y].dateOfLastSharing': +new Date() } },
                    { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }, { 'y.streetNumber': streetNumber }]}
                )
                if (!result.modifiedCount) return false
            })
            return true
        } catch (error) {
            logger.Add(congregation, `Falló SetHTHIsSharedBuildings() territorio ${territoryNumber} manzana ${block} cara ${face}: ${error}`, errorLogs)
            return false
        }
    }
}
