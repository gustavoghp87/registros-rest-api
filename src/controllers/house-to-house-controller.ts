import express, { Request, Response, Router } from 'express'
import * as hTHServices from '../services/house-to-house-services'
import { authorizationString, typeBlock, typeDoNotCall, typeFace, typeHTHMap, typeHTHTerritory, typeObservation, typePolygon, typeTerritoryNumber } from '../models'

export const houseToHouseController: Router = express.Router()

    // create hth territories
    .post('/genesys', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const success: boolean = await hTHServices.createHTHTerritoriesService(token)
        res.json({ success })
    })

    // get hth territory
    .get('/:territoryNumber', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const hthTerritory: typeHTHTerritory|null = await hTHServices.getHTHTerritoryService(token, territoryNumber)
        res.json({ success: !!hthTerritory, hthTerritory })
    })

    // get territory streets
    .get('/street/:territoryNumber', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const streets: string[]|null = await hTHServices.getHTHStreetsByTerritoryService(token, territoryNumber)
        res.json({ success: !!streets, streets })
    })

    // add do not call
    .post('/do-not-call/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const doNotCall: typeDoNotCall = req.body.doNotCall as typeDoNotCall
        const face: typeFace = req.params.face as typeFace
        const polygonId: number = req.body.polygonId as number
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHDoNotCallService(token, territoryNumber, block, face, polygonId, doNotCall)
        res.json({ success })
    })

    // add observation
    .post('/observation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const observation: typeObservation = req.body.observation as typeObservation
        const polygonId: number = req.body.polygonId as number
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHObservationService(token, territoryNumber, block, face, polygonId, observation)
        res.json({ success })
    })

    // delete do not call
    .delete('/do-not-call/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const doNotCallId: number = req.body.doNotCallId as number
        const face: typeFace = req.params.face as typeFace
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHDoNotCallService(token, territoryNumber, block, face, doNotCallId)
        res.json({ success })
    })

    // delete observation
    .delete('/observation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const observationId: number = req.body.observationId as number
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHObservationService(token, territoryNumber, block, face, observationId)
        res.json({ success })
    })

    // edit observation
    .patch('/observation/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const observation: typeObservation = req.body.observation as typeObservation
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.editHTHObservationService(token, territoryNumber, block, face, observation)
        res.json({ success })
    })

    // edit face finished state
    .patch('/state/:territoryNumber/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const polygonId: number = req.body.polygonId
        const isFinish: boolean = req.body.isFinish as boolean
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.setHTHIsFinishedService(token, territoryNumber, block, face, polygonId, isFinish)
        res.json({ success })
    })

    // edit territory map
    .patch('/map/:territoryNumber', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const editedHTHMap: typeHTHMap = req.body.editedHTHMap as typeHTHMap
        const editedHTHPolygons: typePolygon[] = req.body.editedHTHPolygons as typePolygon[]
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.editHTHMapService(token, territoryNumber, editedHTHMap, editedHTHPolygons)
        res.json({ success })
    })

    // add polygon face to hth territorys
    .post('/map/:territoryNumber', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const polygon: typePolygon = req.body.polygon as typePolygon
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHPolygonFaceService(token, territoryNumber, polygon)
        res.json({ success })
    })
;
