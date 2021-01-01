import express from 'express'
import * as functions from '../controllers/functions'
const router = express.Router()


router.post('/getCampaign', async (req, res) => {
    const packs = await functions.getCampaign(req.body.token)
    res.json(packs)
})

router.post('/asign', async (req, res) => {
    const asign = await functions.asignCampaign(req.body.token, req.body.id, req.body.email)
    if (asign) res.json({success:true})
    else res.json({success:false})
})


module.exports = router
