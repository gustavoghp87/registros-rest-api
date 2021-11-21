import express from 'express'
import * as territoryServices from '../services/territory-services'
import { typeVivienda } from '../models/vivienda'

export const router = express.Router()

    // get blocks
    .get('/blocks/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const { territory } = req.params
        const blocks: string[]|null = await territoryServices.getBlocks(token, territory)
        if (!blocks) return res.json({ success: false })
        res.json({ success: true, blocks })
    })

    // get households
    .post('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const { territory, manzana, isTodo, traidos, traerTodos } = req.body
        const households: typeVivienda[]|null =
        await territoryServices.getHouseholdsByTerritory(token, territory, manzana, isTodo, traidos, traerTodos)
        if (!households) return res.json({ success: false })
        res.json({ success: true, households })
    })

    // edit household
    .put('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const { inner_id, estado, noAbonado, asignado } = req.body
        const households: typeVivienda|null = await territoryServices.modifyHousehold(token, inner_id, estado, noAbonado, asignado)
        if (!households) return res.json({ success: false })
        res.json({ success: true, households })
    })
    
    // reset territory
    .delete('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const { territory, option } = req.body
        const success: boolean = await territoryServices.resetTerritory(token, territory, option)
        res.json({ success })
    })
;
