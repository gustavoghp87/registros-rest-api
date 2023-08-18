import { typeCampaignPack } from '../models'
import * as campaignServices from '../services/campaign-services'
import express, { Request, Response, Router } from 'express'

export const campaignController: Router = express.Router()

    // get campaign packs for admins
    .get('/all', async (req: Request, res: Response) => {
        const campaignPacks: typeCampaignPack[]|null = await campaignServices.getCampaignPacksService(req.user)
        res.json({ success: !!campaignPacks, campaignPacks })
    })

    .get('/assignment', async (req: Request, res: Response) => {
        const campaignAssignments: number[]|null = await campaignServices.getCampaignPacksByUserService(req.user)
        res.json({ success: !!campaignAssignments, campaignAssignments })
    })

    // get campaign pack
    .get('/:id', async (req: Request, res: Response) => {
        const id: string = req.params.id
        const campaignPack: typeCampaignPack|null = await campaignServices.getCampaignPackService(req.user, id)
        res.json({ success: !!campaignPack, campaignPack })
    })

    // edit checkbox
    .patch('/', async (req: Request, res: Response) => {
        const id: number = req.body.id
        const phoneNumber: number = req.body.phoneNumber
        const checked: boolean = req.body.checked
        const campaignPack: typeCampaignPack|null = await campaignServices.editCampaignPackService(req.user, id, phoneNumber, checked)
        res.json({ success: !!campaignPack, campaignPack })
    })

    // close pack
    .patch('/all', async (req: Request, res: Response) => {
        const id: number = req.body.id
        const success: boolean = await campaignServices.closeCampaignPackService(req.user, id)
        res.json({ success })
    })

    // assign campaign pack to user by email
    .put('/:id', async (req: Request, res: Response) => {
        const email: string = req.body.email
        const id: string = req.params.id
        const success: boolean = await campaignServices.assignCampaignPackService(req.user, id, email)
        res.json({ success })
    })

    // get campaign packs for user
    .post('/new-pack', async (req: Request, res: Response) => {
        const success: boolean = await campaignServices.askForANewCampaignPackService(req.user)
        res.json({ success })
    })

    // change accessibility mode
    .patch('/accessibility', async (req: Request, res: Response) => {
        const id: number = req.body.id
        const accessible: boolean = req.body.accessible
        const success: boolean = await campaignServices.enableAccesibilityModeService(req.user, id, accessible)
        res.json({ success })
    })
;
