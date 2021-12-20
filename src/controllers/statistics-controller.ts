import express from 'express'
import * as territoryServices from '../services/territory-services'
import { localStatistic, statistic } from '../models/statistic'

export const router = express.Router()
    .get('/:territory', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const { territory } = req.params
        if (!token || !territory) return res.json({ success: false })
        console.log("Sending ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, local statics territory " + territory)
        let data: localStatistic|null = await territoryServices.getLocalStatistics(token, territory, false)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })

    .get('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        console.log("Sending ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, all local statics")
        let data: localStatistic[]|null|undefined = await territoryServices.getAllLocalStatistics(token)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })

    .post('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        if (!token) return res.json({ success: false })
        console.log("Sending ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, global statics")
        let data: statistic|null = await territoryServices.getGlobalStatistics(token)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })
;
