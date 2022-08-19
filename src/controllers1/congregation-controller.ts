import express, { Request, Response, Router } from 'express'
import { getCongregationItems } from '../services1/congregation-services'
import { authorizationString, typeCongregationItem } from '../models1'

export const congregationController: Router = express.Router()

    // get congregation items
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const congregationItems: typeCongregationItem[]|null = await getCongregationItems(token)
        return res.json({ success: !!congregationItems, congregationItems })
    })
;
