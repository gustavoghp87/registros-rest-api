import express from 'express'
const router = express.Router()
import * as functions from '../controllers/functions'


router.post('/', async (req:any, res:any) => {
    console.log("Llegó petición reset...", req.body.territorio, req.body.option, "\n", req.body.token)
    const resp = await functions.resetTerritory(req.body.token, req.body.option, req.body.territorio)
    if (resp) return res.json({success:true})
    res.json({success:false})
})


module.exports = router
