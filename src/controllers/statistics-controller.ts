import express from 'express'
import * as territoryServices from '../services/territory-services'

export const router = express.Router()

router.post('/', async (req, res) => {
    let data = await territoryServices.getLocalStatistics(req.body.token, req.body.territorio)
    if (!data) return null
    const datos2 = {...data, territorio: req.body.territorio}
    res.json(datos2)
})
