import express from 'express'
import { Request, Response } from 'express'
import { Credentials } from 'google-auth-library'
import { authorizationString } from '../models';
import { getGmailRequestService, getGmailUrlService, saveNewGmailAPITokenToDBService } from '../services/email-services/email-services'

export const router = express.Router()

    // step 1
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const url: string|null = await getGmailUrlService(token)
        res.json({ success: url ? true : false, url })
    })

    // step 2
    .post('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const code: string = req.body.code
        const gmailKeys: Credentials|null = await getGmailRequestService(token, code)
        res.json({ success: gmailKeys ? true : false, gmailKeys })
    })

    // save new Gmail API token
    .put('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const accessToken: string = req.body.accessToken
        const refreshToken: string = req.body.refreshToken
        const success: boolean = await saveNewGmailAPITokenToDBService(token, accessToken, refreshToken)
        res.json({ success })
    })
;