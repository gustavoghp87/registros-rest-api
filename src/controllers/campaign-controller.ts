import express, { Request, Response, Router } from 'express'
import { setUpUser } from './filter-controller'
import * as campaignServices from '../services/campaign-services'
import { authorizationString, typeCampaignPack } from '../models'

export const campaignController: Router = express.Router()

    // get campaign packs for admins
    .get('/all', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const campaignPacks: typeCampaignPack[]|null = await campaignServices.getCampaignPacksService(token)
        res.json({ success: !!campaignPacks, campaignPacks })
    })

    .get('/assignment', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const campaignAssignments: number[]|null = await campaignServices.getCampaignPacksByUserService(token)
        res.json({ success: !!campaignAssignments, campaignAssignments })
    })

    // get campaign pack
    .get('/:id', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const id: string = req.params.id
        const campaignPack: typeCampaignPack|null = await campaignServices.getCampaignPackService(token, id)
        res.json({ success: !!campaignPack, campaignPack })
    })

    // edit checkbox
    .patch('/', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const id: number = req.body.id
        const phoneNumber: number = req.body.phoneNumber
        const checked: boolean = req.body.checked
        const campaignPack: typeCampaignPack|null = await campaignServices.editCampaignPackService(token, id, phoneNumber, checked)
        res.json({ success: !!campaignPack, campaignPack })
    })

    // close pack
    .patch('/all', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const id: number = req.body.id
        const success: boolean = await campaignServices.closeCampaignPackService(token, id)
        res.json({ success })
    })

    // assign campaign pack to user by email
    .put('/:id', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const email: string = req.body.email
        const id: string = req.params.id
        const success: boolean = await campaignServices.assignCampaignPackService(token, id, email)
        res.json({ success })
    })

    // get campaign packs for user
    .post('/new-pack', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const success: boolean = await campaignServices.askForANewCampaignPackService(token)
        res.json({ success })
    })

    // change accessibility mode
    .patch('/accessibility', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const id: number = req.body.id
        const accessible: boolean = req.body.accessible
        const success: boolean = await campaignServices.enableAccesibilityModeService(token, id, accessible)
        res.json({ success })
    })
;
