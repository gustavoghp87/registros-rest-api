import express from 'express'
import * as territoryServices from '../services/territory-services'
import { localStatistic, statistic } from '../models/statistic'

export const router = express.Router()
    .post('/local', async (req, res) => {
        const { token, territory } = req.body
        if (!territory) return res.json({ success: false })
        console.log("Sending ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, local statics territory " + territory)
        let data: localStatistic|null = await territoryServices.getLocalStatistics(token, territory, false)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })

    .post('/local-all', async (req, res) => {
        const { token } = req.body
        console.log("Sending ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, all local statics")
        let data: localStatistic[]|null|undefined = await territoryServices.getAllLocalStatistics(token)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })

    .post('/global', async (req, res) => {
        const { token } = req.body
        console.log("Sending ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, global statics")
        let data: statistic|null = await territoryServices.getGlobalStatistics(token)
        if (!data) return res.json({ success: false })
        res.json({ success: true, data })
    })
;
