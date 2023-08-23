import { getConfigService, setGoogleBoardUrlService, setNameOfCongregationService } from '../services/config-services'
import { typeConfig } from '../models'
import express, { Request, Response, Router } from 'express'

export const configController: Router = express.Router()

    // get config, not used
    .get('/', async (req: Request, res: Response) => {
        const config: typeConfig|null = await getConfigService(req.user)
        return res.json({ success: !!config, config })
    })

    // edit name of congregation or google site url
    .patch('/', async (req: Request, res: Response) => {
        const name = req.body.name as string
        const googleBoardUrl = req.body.googleBoardUrl as string
        if (name) {
            const success: boolean = await setNameOfCongregationService(req.user, name)
            return res.json({ success })
        } else if (googleBoardUrl) {
            const success: boolean = await setGoogleBoardUrlService(req.user, googleBoardUrl)
            return res.json({ success })
        } else {
            return res.json({ success: false })
        }
    })
;
