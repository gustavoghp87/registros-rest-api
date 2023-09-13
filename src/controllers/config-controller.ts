import { sendInvitationForNewUserService, setDisableEditMapsService, setGoogleBoardUrlService, setNameOfCongregationService } from '../services/config-services'
import express, { Request, Response, Router } from 'express'

export const configController: Router = express.Router()

    // get config, not used
    .get('/', async (req: Request, res: Response) => {
        // const config: typeConfig|null = await getConfigService(req.user)
        // res.json({ success: !!config, config })
    })

    // edit name of congregation or google site url
    .patch('/', async (req: Request, res: Response) => {
        const name = req.body.name as string
        const googleBoardUrl = req.body.googleBoardUrl as string
        const disableEditMaps = req.body.disableEditMaps as boolean
        if ([true, false].includes(disableEditMaps)) {
            const success: boolean = await setDisableEditMapsService(req.user, disableEditMaps)
            res.json({ success })
        } else if (name) {
            const success: boolean = await setNameOfCongregationService(req.user, name)
            res.json({ success })
        } else if (googleBoardUrl) {
            const success: boolean = await setGoogleBoardUrlService(req.user, googleBoardUrl)
            res.json({ success })
        } else {
            res.json({ success: false })
        }
    })

    // invite new user by email
    .put('/invite', async (req: Request, res: Response) => {
        const email = req.body.email as string
        const newCongregation = req.body.newCongregation as boolean
        const success: boolean|string = await sendInvitationForNewUserService(req.user, email, newCongregation === true)
        if (success === 'exists') {
            res.json({ success: false, userExists: true})
            return
        }
        if (success === 'not sent') {
            res.json({ success: false, notSent: true })
            return
        }
        res.json({ success })
    })
;
