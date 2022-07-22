import express from 'express'
import { Request, Response } from 'express'
import * as hTHServices from '../services/house-to-house-services'
import { authorizationString, typeBlock, typeDoNotCall, typeFace, typeHTHMap, typeHTHTerritory, typeObservation, typePolygon, typeTerritoryNumber } from '../models'

export const router = express.Router()

    // create hth territories
    .post('/genesys', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const success: boolean = await hTHServices.createHTHTerritoriesService(token)
        res.json({ success })
    })

    // get hth territory
    .get('/:territory', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const hthTerritory: typeHTHTerritory|null = await hTHServices.getHTHTerritoryService(token, territory)
        if (!hthTerritory) return res.json({ success: false })
        res.json({ success: true, hthTerritory })
    })

    // get territory streets
    .get('/street/:territory', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const streets: string[]|null = await hTHServices.getHTHStreetsByTerritoryService(token, territory)
        if (!streets) return res.json({ success: false })
        res.json({ success: true, streets })
    })

    // add do not call
    .post('/do-not-call/:territory/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const doNotCall: typeDoNotCall = req.body.doNotCall as typeDoNotCall
        const face: typeFace = req.params.face as typeFace
        const polygonId: number = req.body.polygonId as number
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHDoNotCallService(token, doNotCall, territory, block, face, polygonId)
        res.json({ success })
    })

    // add observation
    .post('/observation/:territory/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const observation: typeObservation = req.body.observation as typeObservation
        const polygonId: number = req.body.polygonId as number
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHObservationService(token, observation, territory, block, face, polygonId)
        res.json({ success })
    })

    // delete do not call
    .delete('/do-not-call/:territory/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const doNotCallId: number = req.body.doNotCallId as number
        const face: typeFace = req.params.face as typeFace
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHDoNotCallService(token, doNotCallId, territory, block, face)
        res.json({ success })
    })

    // delete observation
    .delete('/observation/:territory/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const observationId: number = req.body.observationId as number
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.deleteHTHObservationService(token, observationId, territory, block, face)
        res.json({ success })
    })

    // edit observation
    .patch('/observation/:territory/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const observation: typeObservation = req.body.observation as typeObservation
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.editHTHObservationService(token, observation, territory, block, face)
        res.json({ success })
    })

    // edit face finished state
    .patch('/state/:territory/:block/:face', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const block: typeBlock = req.params.block as typeBlock
        const face: typeFace = req.params.face as typeFace
        const polygonId: number = req.body.polygonId
        const isFinish: boolean = req.body.isFinish as boolean
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.setHTHIsFinishedService(token, isFinish, territory, block, face, polygonId)
        res.json({ success })
    })

    // edit territory map
    .patch('/map/:territory', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const editedHTHMap: typeHTHMap = req.body.editedHTHMap as typeHTHMap
        const editedHTHPolygons: typePolygon[] = req.body.editedHTHPolygons as typePolygon[]
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.editHTHMapService(token, territory, editedHTHMap, editedHTHPolygons)
        res.json({ success })
    })

    // add polygon face to hth territorys
    .post('/map/:territory', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const polygon: typePolygon = req.body.polygon as typePolygon
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const success: boolean = await hTHServices.addHTHPolygonFaceService(token, polygon, territory)
        res.json({ success })
    })
;
