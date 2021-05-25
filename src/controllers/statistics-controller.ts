import express from 'express'
import { localStatistic } from '../models/statistic'
import * as territoryServices from '../services/territory-services'

export const router = express.Router()

router.post('/', async (req, res) => {
    console.log("Enviando ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,, local statics");
    let datos2: localStatistic|null = await territoryServices.getLocalStatistics(req.body.token, req.body.territorio)
    if (!datos2) return null
    res.json(datos2)
})
