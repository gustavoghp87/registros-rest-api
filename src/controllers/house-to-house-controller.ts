import express from 'express'
import { Request, Response } from 'express'
import * as hTHServices from '../services/house-to-house-services'
import { getHTHStreetsByTerritoryService } from '../services/house-to-house-services'
import { typeDoNotCall, typeFace, typeHTHTerritory, typeObservation } from '../models/houseToHouse'
import { typeBlock, typeTerritoryNumber } from '../models/household'

export const router = express.Router()

    // get hth territory
    .get('/:territory', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const hthTerritory: typeHTHTerritory|null = await hTHServices.getHTHTerritoryService(token, territory)
        if (!hthTerritory) return res.json({ success: false })
        res.json({ success: true, hthTerritory })
    })

    // get territory streets
    .get('/street/:territory', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const streets: string[]|null = await getHTHStreetsByTerritoryService(token, territory)
        if (!streets || !streets.length) return res.json({ success: false })
        res.json({ success: true, streets })
    })

    // add do not call
    .post('/do-not-call/:territory', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const doNotCall: typeDoNotCall = req.body.doNotCall as typeDoNotCall
        const success: boolean = await hTHServices.addHTHDoNotCallService(token, doNotCall, territory)
        res.json({ success })
    })

    // add observation
    .post('/observation/:territory', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const observation: typeObservation = req.body.observation as typeObservation
        const success: boolean = await hTHServices.addHTHObservationService(token, observation, territory)
        res.json({ success })
    })

    // delete do not call
    .delete('/do-not-call/:territory', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const doNotCallId: number = req.body.doNotCallId as number
        const success: boolean = await hTHServices.deleteHTHDoNotCallService(token, doNotCallId, territory)
        res.json({ success })
    })

    // delete observation
    .delete('/observation/:territory', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const observationId: number = req.body.observationId as number
        const success: boolean = await hTHServices.deleteHTHObservationService(token, observationId, territory)
        res.json({ success })
    })

    // // update do not call
    // .patch('/do-not-call/:territory', async (req: Request, res: Response) => {
    //     const token: string = req.header('Authorization') || ""
    //     const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
    //     const doNotCall: typeDoNotCall = req.body.doNotCall as typeDoNotCall
    //     const success: boolean = await hTHServices.editHTHDoNotCallService(token, doNotCall, territory)
    //     res.json({ success })
    // })

    // update observation
    .patch('/observation/:territory', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const observation: typeObservation = req.body.observation as typeObservation
        const success: boolean = await hTHServices.editHTHObservationService(token, observation, territory)
        res.json({ success })
    })

    // update face state
    .patch('/state/:territory', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const territory: typeTerritoryNumber = req.params.territory as unknown as typeTerritoryNumber
        const isFinish: boolean = req.body.isFinish as boolean
        const block: typeBlock = req.body.block as typeBlock
        const face: typeFace = req.body.face as typeFace
        const success: boolean = await hTHServices.setHTHIsFinishedService(token, isFinish, territory, block, face)
        res.json({ success })
    })
;
