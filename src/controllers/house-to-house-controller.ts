import * as hTHServices from '../services/house-to-house-services'
import * as types from '../models'
import express, { Request, Response, Router } from 'express'

export const houseToHouseController: Router = express.Router()

    // create hth territories
    .post('/genesys', async (req: Request, res: Response) => {
        const numberOfTerritories = req.body.numberOfTerritories as number
        const lat = req.body.lat as number
        const lng = req.body.lng as number
        const success: boolean = await hTHServices.createHTHTerritoriesService(req.user, numberOfTerritories, lat, lng)
        res.json({ success })
    })

    // get hth territory
    .get('/:territoryNumber', async (req: Request, res: Response) => {
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const hthTerritory: types.typeHTHTerritory|null = await hTHServices.getHTHTerritoryService(req.user, territoryNumber)
        res.json({ success: !!hthTerritory, hthTerritory })
    })

    // get territory streets
    .get('/street/:territoryNumber', async (req: Request, res: Response) => {
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const streets: string[]|null = await hTHServices.getHTHStreetsByTerritoryService(req.user, territoryNumber)
        res.json({ success: !!streets, streets })
    })

    // add do not call
    .post('/do-not-call/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const doNotCall = req.body.doNotCall as types.typeDoNotCall
        const face = req.params.face as types.typeFace
        const polygonId = req.body.polygonId as number
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHDoNotCallService(req.user, territoryNumber, block, face, polygonId, doNotCall)
        res.json({ success })
    })

    // add observation
    .post('/observation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const observation = req.body.observation as types.typeObservation
        const polygonId = req.body.polygonId as number
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHObservationService(req.user, territoryNumber, block, face, polygonId, observation)
        res.json({ success })
    })

    // delete do not call
    .delete('/do-not-call/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const doNotCallId = req.body.doNotCallId as number
        const face = req.params.face as types.typeFace
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHDoNotCallService(req.user, territoryNumber, block, face, doNotCallId)
        res.json({ success })
    })

    // delete observation
    .delete('/observation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const observationId = req.body.observationId as number
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHObservationService(req.user, territoryNumber, block, face, observationId)
        res.json({ success })
    })

    // edit observation
    .patch('/observation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const observation = req.body.observation as types.typeObservation
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.editHTHObservationService(req.user, territoryNumber, block, face, observation)
        res.json({ success })
    })

    // edit face finished state
    .patch('/state/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const polygonId = req.body.polygonId as number
        const isAll = req.body.isAll as boolean
        const isFinish = req.body.isFinish as boolean
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.setHTHIsFinishedService(req.user, territoryNumber, block, face, polygonId, isFinish, isAll)
        res.json({ success })
    })

    // get territories for statistics
    .get('/map/territory-statistics', async (req: Request, res: Response) => {
        const hthTerritories: types.typeHTHTerritory[]|null = await hTHServices.getHTHTerritoriesForStatisticsService(req.user)
        return res.json({ success: !!hthTerritories, hthTerritories})
    })

    // get territories for map
    .get('/map/territory-map', async (req: Request, res: Response) => {
        const hthTerritories: types.typeHTHTerritory[]|null = await hTHServices.getHTHTerritoriesForMapService(req.user)
        return res.json({ success: !!hthTerritories, hthTerritories})
    })

    // edit territory map
    .patch('/map/:territoryNumber', async (req: Request, res: Response) => {
        const editedHTHMap = req.body.editedHTHMap as types.typeHTHMap
        const editedHTHPolygons = req.body.editedHTHPolygons as types.typePolygon[]
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.editHTHMapService(req.user, territoryNumber, editedHTHMap, editedHTHPolygons)
        res.json({ success })
    })

    // add polygon face
    .post('/map/:territoryNumber', async (req: Request, res: Response) => {
        const polygon = req.body.polygon as types.typePolygon
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHPolygonFaceService(req.user, territoryNumber, polygon)
        res.json({ success })
    })

    // delete polygon face
    .delete('/map/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const faceId: number = req.body.faceId
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHPolygonFaceService(req.user, territoryNumber, block, face, faceId)
        res.json({ success })
    })

    // get hth building
    .get('/building/:congregation/:territoryNumber/:block/:face/:streetNumber', async (req: Request, res: Response) => {
        const congregation = parseInt(req.params.congregation)
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const streetNumber = parseInt(req.params.streetNumber || '')
        if (isNaN(congregation) || !territoryNumber || !block || !face || isNaN(streetNumber)) return res.json({ success: false })
        const hthTerritory: types.typeHTHTerritory|null = await hTHServices.getHTHBuildingService(congregation, territoryNumber, block, face, streetNumber)
        res.json({ success: !!hthTerritory, hthTerritory })
    })

    // add new building to face
    .post('/building/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const newBuilding = req.body.newBuilding as types.typeHTHBuilding
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const result: boolean|'dataError'|'alreadyExists' = await hTHServices.addHTHBuildingService(req.user, territoryNumber, block, face, newBuilding)
        res.json({ success: result === true, dataError: result === 'dataError', alreadyExists: result === 'alreadyExists' })
    })

    // modify household called state
    .patch('/building/:congregation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const congregation = parseInt(req.params.congregation)
        if (isNaN(congregation))
            return res.json({ success: false })
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const householdId: number = req.body.householdId
        const isChecked: boolean = req.body.isChecked
        const isManager: boolean = req.body.isManager
        const street: string = req.body.street
        const streetNumber: number = req.body.streetNumber
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean =
            await hTHServices.changeStateToHTHHouseholdService(req.user, congregation, territoryNumber, block, face, streetNumber, householdId, isChecked, isManager, street)
        res.json({ success })
    })

    // set building is shared
    .put('/building/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const polygonId = req.body.polygonId as number
        const streetNumbers: number[] = req.body.streetNumbers
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean =
            await hTHServices.setHTHIsSharedBuildingsService(req.user, territoryNumber, block, face, polygonId, streetNumbers)
        res.json({ success })
    })

    // delete hth building
    .delete('/building/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const block = req.params.block as types.typeBlock
        const face = req.params.face as types.typeFace
        const streetNumber: number = req.body.streetNumber
        const territoryNumber = req.params.territoryNumber as unknown as types.typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHBuildingService(req.user, territoryNumber, block, face, streetNumber)
        res.json({ success })
    })
;
