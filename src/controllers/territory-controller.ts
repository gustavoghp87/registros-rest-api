import express, { Request, Response, Router } from 'express'
import * as territoryServices from '../services/territory-services'
import { authorizationString, typeStateOfTerritory, typeHousehold, typeTerritoryNumber } from '../models'

export const territoryController: Router = express.Router()

    // get blocks
    // .get('/blocks/:territory', async (req: Request, res: Response) => {
    //     const token: string = req.header(authorizationString) || ""
    //     const territory: string = req.params.territory
    //     const blocks: string[]|null = await territoryServices.getBlocksService(token, territory)
    //     res.json({ success: blocks !== null, blocks })
    // })

    // get households
    .get('/:territory', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territory: typeTerritoryNumber = req.params.territory as typeTerritoryNumber
        const response: [typeHousehold[], typeStateOfTerritory]|null = await territoryServices.getHouseholdsByTerritoryService(token, territory)
        if (!response || !response.length) return res.json({ success: false })
        res.json({ success: true, households: response[0], stateOfTerritory: response[1] })
    })

    // edit household
    .put('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const { inner_id, estado, noAbonado, asignado } = req.body
        const household: typeHousehold|null = await territoryServices.modifyHouseholdService(token, inner_id, estado, noAbonado, asignado)
        res.json({ success: !!household, household })
    })
    
    // reset territory
    .delete('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const { territory, option } = req.body
        const success: boolean = await territoryServices.resetTerritoryService(token, territory, option)
        res.json({ success })
    })
;
