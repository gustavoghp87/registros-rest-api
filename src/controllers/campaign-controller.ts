import express from 'express'
import * as campaignServices from '../services/campaign-services'

export const router = express.Router()

router
    .post('/getCampaign', async (req, res) => {
        console.log("Get Campaign:", req.body.token?.length)
        const packs = await campaignServices.getCampaign(req.body.token)
        res.json(packs)
    })

    .post('/asign', async (req, res) => {
        const asign = await campaignServices.asignCampaign(req.body.token, req.body.id, req.body.email)
        if (asign) res.json({ success: true })
        else res.json({ success: false })
    })

    .post('/getPack', async (req, res) => {
        try {
            const id = parseInt(req.body.id)
            const pack = await campaignServices.getPack(id)
            res.json(pack)
        } catch (error) {
            res.json({ success: false })
        }
    })

    .post('/clickBox', async (req, res) => {
        const task = await campaignServices.clickBox(req.body.token, req.body.tel, req.body.id, req.body.checked)
        if (!task) return res.json({ success: false })
        res.json({ success: true })
    })

    .post('/finished', async (req, res) => {
        try {
            const packId = parseInt(req.body.packId)
            console.log("Finished request:", packId)
            const task = await campaignServices.markEverythingLikeCalled(req.body.token, packId)
            if (!task) return res.json({ success: false })
            res.json({ success: true })
            
        } catch (error) {
            console.log("Something failed in markEverythingLikeCalled:", error);
            res.json({ success: false })
        }
    })
;
