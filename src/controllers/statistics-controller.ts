import express from 'express'
import * as territoryServices from '../services/territory-services'

export const router = express.Router()

router.post('/', async (req, res) => {
    let datos2 = await territoryServices.getLocalStatistics(req.body.token, req.body.territorio)
    res.json(datos2)
})
