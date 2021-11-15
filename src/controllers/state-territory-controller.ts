import express from 'express'
import * as stateTerritoryServices from '../services/state-territory-services'
import { stateOfTerritory } from '../models/territorio';

export const router = express.Router()
    .get('/:territory', async (req, res) => {
        const token: string = req.header('authorization') || "abcde0123456987"
        const { territory } = req.params
        if (!territory) return res.json({ success: false })
        const obj: stateOfTerritory|null = await stateTerritoryServices.searchStateOfTerritory(token, territory)
        if (!obj) return res.json({ success: false })
        res.json({ success: true, obj })
    })

    .get('/', async (req, res) => {
        const token: string = req.header('authorization') || "abcde0123456987"
        const obj: stateOfTerritory[]|null = await stateTerritoryServices.searchStateOfTerritories(token)
        if (!obj) return res.json({ success: false })
        res.json({ success: true, obj })
    })

    .patch('/', async (req, res) => {
        const { token, territory, estado } = req.body
        if (!territory || estado === null || estado === undefined) return res.json({ success: false })
        const success: boolean = await stateTerritoryServices.changeStateOfTerritory(token, territory, estado)
        res.json({ success })
    })
;
