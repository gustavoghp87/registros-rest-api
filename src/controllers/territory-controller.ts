import express from 'express'
import * as territoryServices from '../services/territory-services'
import { typeHousehold } from '../models/household'

export const router = express.Router()

    // get blocks
    .get('/blocks/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const territory: string = req.params.territory
        const blocks: string[]|null = await territoryServices.getBlocksService(token, territory)
        if (!blocks) return res.json({ success: false })
        res.json({ success: true, blocks })
    })

    // get households
    .post('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const { territory, manzana, aTraer, traerTodos } = req.body
        const response: [typeHousehold[], boolean] | null =
            await territoryServices.getHouseholdsByTerritoryService(token, territory, manzana, aTraer, traerTodos)
        if (!response || !response[0]) return res.json({ success: false })
        const households: typeHousehold[]|null = response[0]
        res.json({ success: true, households, isAll: response[1] })
    })

    // edit household
    .put('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const { inner_id, estado, noAbonado, asignado } = req.body
        const households: typeHousehold|null = await territoryServices.modifyHouseholdService(token, inner_id, estado, noAbonado, asignado)
        if (!households) return res.json({ success: false })
        res.json({ success: true, households })
    })
    
    // reset territory
    .delete('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const { territory, option } = req.body
        const success: boolean = await territoryServices.resetTerritoryService(token, territory, option)
        res.json({ success })
    })
;
