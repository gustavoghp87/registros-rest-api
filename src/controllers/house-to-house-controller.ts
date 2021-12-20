import express from 'express'
import * as hTHServices from '../services/house-to-house-services'
import { typeHTHBuilding, typeHTHHousehold } from '../models/houseToHouse'

export const router = express.Router()
    .get('/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        const territory: string = req.params.territory
        const buildings: typeHTHBuilding[]|null = await hTHServices.getBuildingsService(token, territory)
        if (!buildings) return res.json({ success: false })
        res.json({ success: true, hthTerritory: buildings })
    })
    .post('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        const body = req.body
        const buildings: typeHTHBuilding[]|null = await hTHServices.addBuildingService(token, body)
        if (!buildings) return res.json({ success: false })
        res.json({ success: true, hthTerritory: buildings })
    })
    .put('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        const household: typeHTHHousehold = req.body.household
        const buildingId: string = req.body.buildingId
        const success: boolean = await hTHServices.modifyHTHHouseholdState(token, household, buildingId)
        res.json({ success })
    })
    .get('/streets/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        const territory: string = req.params.territory
        const streets: string[]|null = await hTHServices.getTerritoryStreetsService(token, territory)
        if (!streets) return res.json({ success: false })
        res.json({ success: true, streets })
    })
;
