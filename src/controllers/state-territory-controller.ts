import express from 'express'
import * as stateTerritoryServices from '../services/state-territory-services'
import { stateOfTerritory } from '../models/territorio';

export const router = express.Router()
    .get('/:territory', async (req, res) => {
        const token: string = req.header('authorization') || ""
        const { territory } = req.params
        if (!territory) return res.json({ success: false })
        const obj: stateOfTerritory|null = await stateTerritoryServices.getStateOfTerritory(token, territory)
        if (!obj) return res.json({ success: false })
        res.json({ success: true, obj })
    })

    .get('/', async (req, res) => {
        const token: string = req.header('authorization') || ""
        const obj: stateOfTerritory[]|null = await stateTerritoryServices.getStateOfTerritories(token)
        if (!obj) return res.json({ success: false })
        res.json({ success: true, obj })
    })

    .patch('/', async (req, res) => {
        const token: string = req.header('authorization') || ""
        const { territory, isFinished } = req.body
        if (!territory || isFinished === null || isFinished === undefined) return res.json({ success: false })
        const success: boolean = await stateTerritoryServices.changeStateOfTerritory(token, territory, isFinished)
        res.json({ success })
    })
;
