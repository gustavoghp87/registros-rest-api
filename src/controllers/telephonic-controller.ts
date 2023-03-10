import express, { Request, Response, Router } from 'express'
import * as territoryServices from '../services/telephonic-services'
import { typeHousehold, typeTerritoryNumber, typeTelephonicTerritory, typeLocalTelephonicStatistic, typeTelephonicStatistic, typeTerritoryRow } from '../models'

export const telephonicController: Router = express.Router()

    // get territory
    .get('/:territoryNumber', async (req: Request, res: Response) => {
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as typeTerritoryNumber
        const telephonicTerritory: typeTelephonicTerritory|null = await territoryServices.getTelephonicTerritoryService(req.user, territoryNumber)
        res.json({ success: !!telephonicTerritory, telephonicTerritory })
    })

    // edit household
    .put('/:territoryNumber', async (req: Request, res: Response) => {
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as typeTerritoryNumber
        const { householdId, callingState, notSubscribed, isAssigned } = req.body
        const household: typeHousehold|null =
            await territoryServices.modifyHouseholdService(req.user, territoryNumber, householdId, callingState, notSubscribed, isAssigned)
        res.json({ success: !!household, household })
    })
    
    // reset territory
    .delete('/', async (req: Request, res: Response) => {
        const { territoryNumber, option } = req.body
        const modifiedCount: number|null = await territoryServices.resetTerritoryService(req.user, territoryNumber, option)
        res.json({ success: modifiedCount !== null, modifiedCount })
    })

    // open and close territory
    .patch('/', async (req: Request, res: Response) => {
        const isFinished: boolean = req.body.isFinished
        const territoryNumber: typeTerritoryNumber = req.body.territoryNumber
        const success: boolean = await territoryServices.changeStateOfTerritoryService(req.user, territoryNumber, isFinished)
        res.json({ success })
    })

    // get local statistics
    .get('/statistic/local', async (req: Request, res: Response) => {
        const localStatistics: typeLocalTelephonicStatistic[]|null = await territoryServices.getTelephonicLocalStatisticsService(req.user)
        res.json({ success: !!localStatistics, localStatistics })
    })

    // get global statistics
    .get('/statistic/global', async (req: Request, res: Response) => {
        const globalStatistics: typeTelephonicStatistic|null = await territoryServices.getTelephonicGlobalStatisticsService(req.user)
        res.json({ success: !!globalStatistics, globalStatistics })
    })

    // get territories table data
    .get('/statistics/table', async (req: Request, res: Response) => {
        const territoriesTableData: typeTerritoryRow[]|null = await territoryServices.getTelephonicStatisticsTableDataService(req.user)
        res.json({ success: !!territoriesTableData, territoriesTableData })
    })
;
