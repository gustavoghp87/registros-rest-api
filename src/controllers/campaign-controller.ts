import express from 'express'
import * as campaignServices from '../services/campaign-services'
import { typeCampaignPack } from '../models/campaign'
import { Request, Response } from 'express'

export const router = express.Router()

    // get campaign packs for admins
    .get('/all', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const packs: typeCampaignPack[]|null = await campaignServices.getCampaignPacksService(token)
        if (!packs) return res.json({ success: false })
        res.json({ success: true, packs })
    })

    // get campaign packs for user
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const packs: typeCampaignPack[]|null = await campaignServices.getCampaignPacksByUserService(token)
        if (!packs) return res.json({ success: false })
        res.json({ success: true, packs })
    })

    // get campaign pack
    .get('/:id', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const id: string = req.params.id
        const pack: typeCampaignPack|null = await campaignServices.getCampaignPackService(token, id)
        if (!pack) return res.json({ success: false })
        res.json({ success: true, pack })
    })

    // edit checkbox
    .patch('/', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const id: number = req.body.id
        const phoneNumber: number = req.body.phoneNumber
        const checked: boolean = req.body.checked
        const success: boolean = await campaignServices.editCampaignPackService(token, id, phoneNumber, checked)
        res.json({ success })
    })

    // close pack
    .patch('/all', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const id: number = req.body.id
        const success: boolean = await campaignServices.closeCampaignPackService(token, id)
        res.json({ success })
    })

    // assign campaign pack to user by email
    .put('/:id', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const email: string = req.body.email
        const id: string = req.params.id
        const success: boolean = await campaignServices.assignCampaignPackService(token, id, email)
        res.json({ success })
    })

    // get campaign packs for user
    .post('/new-pack', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const success: boolean = await campaignServices.askForANewCampaignPackService(token)
        res.json({ success })
    })

    // change accessibility mode
    .patch('/accessibility', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const id: number = req.body.id
        const accessible: boolean = req.body.accessible
        const success: boolean = await campaignServices.enableAccesibilityModeService(token, id, accessible)
        res.json({ success })
    })
;
