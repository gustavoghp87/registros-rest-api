import express from 'express'
import * as territoryServices from '../services/territory-services'

export const router = express.Router()

router.post('/', async (req:any, res:any) => {
    console.log("Reset request coming...", req.body.territorio, req.body.option, "\n", req.body.token)
    const resp = await territoryServices.resetTerritory(req.body.token, req.body.option, req.body.territorio)
    if (resp) return res.json({success:true})
    res.json({success:false})
})
