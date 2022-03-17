import express from 'express'
import * as stateTerritoryServices from '../services/state-territory-services'
import { stateOfTerritory } from '../models/stateOfTerritory';

export const router = express.Router()
    .get('/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const territory: string = req.params.territory
        const obj: stateOfTerritory|null = await stateTerritoryServices.getStateOfTerritoryService(token, territory)
        if (!obj) return res.json({ success: false })
        res.json({ success: true, obj })
    })

    .get('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const obj: stateOfTerritory[]|null = await stateTerritoryServices.getStateOfTerritoriesService(token)
        if (!obj) return res.json({ success: false })
        res.json({ success: true, obj })
    })

    .patch('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const territory: string = req.body.territory
        const isFinished: boolean = req.body.isFinished
        const success: boolean = await stateTerritoryServices.changeStateOfTerritoryService(token, territory, isFinished)
        res.json({ success })
    })
;
