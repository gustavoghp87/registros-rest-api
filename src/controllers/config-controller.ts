import { getConfig } from '../services/config-services'
import { typeConfig } from '../models'
import express, { Request, Response, Router } from 'express'

export const configController: Router = express.Router()

    // get config
    .get('/', async (req: Request, res: Response) => {
        const config: typeConfig|null = await getConfig(req.user)
        return res.json({ success: !!config, config })
    })
;
