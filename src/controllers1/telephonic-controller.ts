import express, { Request, Response, Router } from 'express'
import * as territoryServices from '../services1/telephonic-services'
import { authorizationString, typeHousehold, typeTerritoryNumber, typeTelephonicTerritory, typeLocalTelephonicStatistic, typeTelephonicStatistic } from '../models1'

export const telephonicController: Router = express.Router()

    // get territory
    .get('/:territoryNumber', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as typeTerritoryNumber
        const telephonicTerritory: typeTelephonicTerritory|null = await territoryServices.getTelephonicTerritoryService(token, territoryNumber)
        res.json({ success: !!telephonicTerritory, telephonicTerritory })
    })

    // edit household
    .put('/:territoryNumber', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as typeTerritoryNumber
        const { householdId, callingState, notSubscribed, isAssigned } = req.body
        const household: typeHousehold|null =
            await territoryServices.modifyHouseholdService(token, territoryNumber, householdId, callingState, notSubscribed, isAssigned)
        res.json({ success: !!household, household })
    })
    
    // reset territory
    .delete('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const { territoryNumber, option } = req.body
        const modifiedCount: number|null = await territoryServices.resetTerritoryService(token, territoryNumber, option)
        res.json({ success: modifiedCount !== null, modifiedCount })
    })

    // open and close territory
    .patch('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const isFinished: boolean = req.body.isFinished
        const territoryNumber: typeTerritoryNumber = req.body.territoryNumber
        const success: boolean = await territoryServices.changeStateOfTerritoryService(token, territoryNumber, isFinished)
        res.json({ success })
    })

    // get local statistics
    .get('/statistic/local', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const localStatistics: typeLocalTelephonicStatistic[]|null = await territoryServices.getTelephonicLocalStatisticsService(token)
        res.json({ success: !!localStatistics, localStatistics })
    })

    // get global statistics
    .get('/statistic/global', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const globalStatistics: typeTelephonicStatistic|null = await territoryServices.getTelephonicGlobalStatisticsService(token)
        res.json({ success: !!globalStatistics, globalStatistics })
    })
;
