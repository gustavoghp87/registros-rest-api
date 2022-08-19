import express, { Request, Response, Router } from 'express'
import * as statisticServices from '../services/statistic-services'
import { authorizationString, localStatistic, statistic } from '../models'

export const statisticsController: Router = express.Router()

    // get the number of free phone numbers
    .get('/free/:territory', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territory: string = req.params.territory
        const numberOfFreePhones: number|null = await statisticServices.getNumberOfFreePhonesService(token, territory)
        res.json({ success: numberOfFreePhones !== null, numberOfFreePhones })
    })

    // get local statistics
    .get('/:territory', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const territory: string = req.params.territory
        const localStatistic: localStatistic|null = await statisticServices.getLocalStatisticsService(token, territory)
        res.json({ success: localStatistic !== null, localStatistic })
    })

    // get local statistics for all territories
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const localStatistics: localStatistic[]|null = await statisticServices.getAllLocalStatisticsService(token)
        res.json({ success: localStatistics !== null, localStatistics })
    })

    // get global statistics
    .post('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const statistic: statistic|null = await statisticServices.getGlobalStatisticsService(token)
        res.json({ success: statistic !== null, statistic })
    })
;
