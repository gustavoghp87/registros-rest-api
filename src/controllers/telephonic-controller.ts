import express, { Request, Response, Router } from 'express'
import { setUpUser } from './filter-controller'
import * as territoryServices from '../services/telephonic-services'
import { authorizationString, typeHousehold, typeTerritoryNumber, typeTelephonicTerritory, typeLocalTelephonicStatistic, typeTelephonicStatistic } from '../models'

export const telephonicController: Router = express.Router()

    // get territory
    .get('/:territoryNumber', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as typeTerritoryNumber
        const telephonicTerritory: typeTelephonicTerritory|null = await territoryServices.getTelephonicTerritoryService(token, territoryNumber)
        res.json({ success: !!telephonicTerritory, telephonicTerritory })
    })

    // edit household
    .put('/:territoryNumber', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territoryNumber: typeTerritoryNumber = req.params.territoryNumber as typeTerritoryNumber
        const { householdId, callingState, notSubscribed, isAssigned } = req.body
        const household: typeHousehold|null =
            await territoryServices.modifyHouseholdService(token, territoryNumber, householdId, callingState, notSubscribed, isAssigned)
        res.json({ success: !!household, household })
    })
    
    // reset territory
    .delete('/', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const { territoryNumber, option } = req.body
        const modifiedCount: number|null = await territoryServices.resetTerritoryService(token, territoryNumber, option)
        res.json({ success: modifiedCount !== null, modifiedCount })
    })

    // open and close territory
    .patch('/', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const isFinished: boolean = req.body.isFinished
        const territoryNumber: typeTerritoryNumber = req.body.territoryNumber
        const success: boolean = await territoryServices.changeStateOfTerritoryService(token, territoryNumber, isFinished)
        res.json({ success })
    })

    // get local statistics
    .get('/statistic/local', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const localStatistics: typeLocalTelephonicStatistic[]|null = await territoryServices.getTelephonicLocalStatisticsService(token)
        res.json({ success: !!localStatistics, localStatistics })
    })

    // get global statistics
    .get('/statistic/global', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const globalStatistics: typeTelephonicStatistic|null = await territoryServices.getTelephonicGlobalStatisticsService(token)
        res.json({ success: !!globalStatistics, globalStatistics })
    })
;
