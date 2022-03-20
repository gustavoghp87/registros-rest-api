import express from 'express'
import * as statisticServices from '../services/statistic-services'
import { localStatistic, statistic } from '../models/statistic'

export const router = express.Router()
    .get('/free/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const territory: string = req.params.territory
        const data: number|null = await statisticServices.getNumberOfFreePhonesService(token, territory)
        if (data === null) return res.json({ success: false })
        res.json({ success: true, data })
    })

    .get('/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const territory: string = req.params.territory
        const data: localStatistic|null = await statisticServices.getLocalStatisticsService(token, territory)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })

    .get('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const data: localStatistic[]|null = await statisticServices.getAllLocalStatisticsService(token)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })

    .post('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const data: statistic|null = await statisticServices.getGlobalStatisticsService(token)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })
;
