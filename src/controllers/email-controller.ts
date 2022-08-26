import express, { Request, Response, Router } from 'express'
import { Credentials } from 'google-auth-library'
import { getGmailRequestService, getGmailUrlService, saveNewGmailAPITokenToDBService } from '../services/email-services'

export const emailController: Router = express.Router()

    // step 1
    .get('/', async (req: Request, res: Response) => {
        const url: string|null = await getGmailUrlService(req.user)
        res.json({ success: !!url, url })
    })

    // step 2
    .post('/', async (req: Request, res: Response) => {
        const code: string = req.body.code
        const gmailKeys: Credentials|null = await getGmailRequestService(req.user, code)
        res.json({ success: !!gmailKeys, gmailKeys })
    })

    // save new Gmail API token
    .put('/', async (req: Request, res: Response) => {
        const accessToken: string = req.body.accessToken
        const refreshToken: string = req.body.refreshToken
        const success: boolean = await saveNewGmailAPITokenToDBService(req.user, accessToken, refreshToken)
        res.json({ success })
    })
;
