import express, { Request, Response, Router } from 'express'
import * as hTHServices from '../services/house-to-house-services'
import { typeBlock, typeDoNotCall, typeFace, typeHTHBuilding, typeHTHMap, typeHTHTerritory, typeObservation, typePolygon, typeTerritoryNumber } from '../models'

export const houseToHouseController: Router = express.Router()

    // create hth territories
    .post('/genesys', async (req: Request, res: Response) => {
        const success: boolean = await hTHServices.createHTHTerritoriesService(req.user)
        res.json({ success })
    })

    // get hth territory
    .get('/:territoryNumber', async (req: Request, res: Response) => {
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const hthTerritory: typeHTHTerritory|null = await hTHServices.getHTHTerritoryService(req.user, territoryNumber)
        res.json({ success: !!hthTerritory, hthTerritory })
    })

    // get territory streets
    .get('/street/:territoryNumber', async (req: Request, res: Response) => {
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const streets: string[]|null = await hTHServices.getHTHStreetsByTerritoryService(req.user, territoryNumber)
        res.json({ success: !!streets, streets })
    })

    // add do not call
    .post('/do-not-call/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const doNotCall: typeDoNotCall = req.body.doNotCall as typeDoNotCall
        const face: typeFace = req.params.face as typeFace
        const polygonId: number = req.body.polygonId as number
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHDoNotCallService(req.user, territoryNumber, block, face, polygonId, doNotCall)
        res.json({ success })
    })

    // add observation
    .post('/observation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const observation: typeObservation = req.body.observation as typeObservation
        const polygonId: number = req.body.polygonId as number
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHObservationService(req.user, territoryNumber, block, face, polygonId, observation)
        res.json({ success })
    })

    // delete do not call
    .delete('/do-not-call/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const doNotCallId: number = req.body.doNotCallId as number
        const face: typeFace = req.params.face as typeFace
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHDoNotCallService(req.user, territoryNumber, block, face, doNotCallId)
        res.json({ success })
    })

    // delete observation
    .delete('/observation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const observationId: number = req.body.observationId as number
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHObservationService(req.user, territoryNumber, block, face, observationId)
        res.json({ success })
    })

    // edit observation
    .patch('/observation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const observation: typeObservation = req.body.observation as typeObservation
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.editHTHObservationService(req.user, territoryNumber, block, face, observation)
        res.json({ success })
    })

    // edit face finished state
    .patch('/state/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const polygonId: number = req.body.polygonId
        const isFinish: boolean = req.body.isFinish as boolean
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.setHTHIsFinishedService(req.user, territoryNumber, block, face, polygonId, isFinish)
        res.json({ success })
    })

    // get territories for map
    .get('/map/territory', async (req: Request, res: Response) => {
        const hthTerritories: typeHTHTerritory[]|null = await hTHServices.getHTHTerritoriesForMapService(req.user)
        return res.json({ success: !!hthTerritories, hthTerritories})
    })

    // edit territory map
    .patch('/map/:territoryNumber', async (req: Request, res: Response) => {
        const editedHTHMap: typeHTHMap = req.body.editedHTHMap as typeHTHMap
        const editedHTHPolygons: typePolygon[] = req.body.editedHTHPolygons as typePolygon[]
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.editHTHMapService(req.user, territoryNumber, editedHTHMap, editedHTHPolygons)
        res.json({ success })
    })

    // add polygon face
    .post('/map/:territoryNumber', async (req: Request, res: Response) => {
        const polygon: typePolygon = req.body.polygon as typePolygon
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHPolygonFaceService(req.user, territoryNumber, polygon)
        res.json({ success })
    })

    // delete polygon face
    .delete('/map/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const faceId: number = req.body.faceId
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHPolygonFaceService(req.user, territoryNumber, block, face, faceId)
        res.json({ success })
    })

    // add new building to face
    .post('/building/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const newBuilding: typeHTHBuilding = req.body.newBuilding
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const result: boolean|'dataError'|'alreadyExists' = await hTHServices.addHTHBuildingService(req.user, territoryNumber, block, face, newBuilding)
        res.json({ success: result === true, dataError: result === 'dataError', alreadyExists: result === 'alreadyExists' })
    })

    // modify household called state
    .patch('/building/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const householdId: number = req.body.householdId
        const isChecked: boolean = req.body.isChecked
        const streetNumber: number = req.body.streetNumber
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean =
            await hTHServices.changeStateToHTHHouseholdService(req.user, territoryNumber, block, face, streetNumber, householdId, isChecked)
        res.json({ success })
    })

    // set building is shared
    .put('/building/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const polygonId: number = req.body.polygonId as number
        const streetNumbers: number[] = req.body.streetNumbers
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean =
            await hTHServices.setHTHIsSharedBuildingsService(req.user, territoryNumber, block, face, polygonId, streetNumbers)
        res.json({ success })
    })

    // delete hth building
    .delete('/building/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const streetNumber: number = req.body.streetNumber
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHBuildingService(req.user, territoryNumber, block, face, streetNumber)
        res.json({ success })
    })
;
