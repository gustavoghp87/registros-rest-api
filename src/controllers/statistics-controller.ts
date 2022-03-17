import express from 'express'
import * as territoryServices from '../services/territory-services'
import { localStatistic, statistic } from '../models/statistic'

export const router = express.Router()
    .get('/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const territory: string = req.params.territory
        const data: localStatistic|null = await territoryServices.getLocalStatisticsService(token, territory)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })

    .get('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const data: localStatistic[]|null = await territoryServices.getAllLocalStatisticsService(token)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })

    .post('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const data: statistic|null = await territoryServices.getGlobalStatisticsService(token)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })
;
