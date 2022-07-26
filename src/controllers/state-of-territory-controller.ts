import express from 'express'
import { Request, Response } from 'express'
import * as stateTerritoryServices from '../services/state-of-territory-services'
import { authorizationString, typeStateOfTerritory } from '../models'

export const router = express.Router()

    // get state of territory by number
    .get('/:territory', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territory: string = req.params.territory
        const stateOfTerritory: typeStateOfTerritory|null = await stateTerritoryServices.getStateOfTerritoryService(token, territory)
        res.json({ success: stateOfTerritory !== null, stateOfTerritory })
    })

    // get state of territories
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const stateOfTerritories: typeStateOfTerritory[]|null = await stateTerritoryServices.getStateOfTerritoriesService(token)
        res.json({ success: stateOfTerritories !== null, stateOfTerritories })
    })

    // open and close territory
    .patch('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territory: string = req.body.territory
        const isFinished: boolean = req.body.isFinished
        const success: boolean = await stateTerritoryServices.changeStateOfTerritoryService(token, territory, isFinished)
        res.json({ success })
    })
;
