import express from 'express'
import { Request, Response } from 'express'
import * as territoryServices from '../services/territory-services'
import { authorizationString, typeHousehold } from '../models'

export const router = express.Router()

    // get blocks
    .get('/blocks/:territory', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territory: string = req.params.territory
        const blocks: string[]|null = await territoryServices.getBlocksService(token, territory)
        res.json({ success: blocks !== null, blocks })
    })

    // get households
    .post('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const { territory, manzana, aTraer, traerTodos } = req.body
        const response: [typeHousehold[], boolean] | null =
            await territoryServices.getHouseholdsByTerritoryService(token, territory, manzana, aTraer, traerTodos)
        if (!response || !response[0]) return res.json({ success: false })
        const households: typeHousehold[]|null = response[0]
        res.json({ success: true, households, isAll: response[1] })
    })

    // edit household
    .put('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const { inner_id, estado, noAbonado, asignado } = req.body
        const household: typeHousehold|null = await territoryServices.modifyHouseholdService(token, inner_id, estado, noAbonado, asignado)
        res.json({ success: household !== null, household })
    })
    
    // reset territory
    .delete('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const { territory, option } = req.body
        const success: boolean = await territoryServices.resetTerritoryService(token, territory, option)
        res.json({ success })
    })
;
