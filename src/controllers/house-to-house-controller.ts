import express from 'express'
import * as hTHServices from '../services/house-to-house-services'
import { typeHTHBuilding, typeHTHHousehold } from '../models/houseToHouse'

export const router = express.Router()
    .get('/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const territory: string = req.params.territory
        const buildings: typeHTHBuilding[]|null = await hTHServices.getHTHBuildingsService(token, territory)
        if (!buildings) return res.json({ success: false })
        res.json({ success: true, hthTerritory: buildings })
    })
    .post('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const building: typeHTHBuilding = req.body.building
        const buildings: typeHTHBuilding[]|null|any = await hTHServices.addHTHBuildingService(token, building)
        if (!buildings) return res.json({ success: false })
        if (buildings.exists) return res.json({ success: false, exists: true })
        res.json({ success: true, hthTerritory: buildings })
    })
    .patch('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const household: typeHTHHousehold = req.body.household
        const buildingId: string = req.body.buildingId
        const success: boolean = await hTHServices.modifyHTHHouseholdStateService(token, household, buildingId)
        res.json({ success })
    })
    .put('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const building: typeHTHBuilding = req.body.building
        const success: boolean = await hTHServices.modifyHTHBuildingService(token, building)
        res.json({ success })
    })
    .get('/streets/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const territory: string = req.params.territory
        const streets: string[]|null = await hTHServices.getHTHTerritoryStreetsService(token, territory)
        if (!streets) return res.json({ success: false })
        res.json({ success: true, streets })
    })
;
