import express, { Request, Response, Router } from 'express'
import { getCongregationItems } from '../services/congregation-services'
import { typeCongregationItem } from '../models'

export const congregationController: Router = express.Router()

    // get congregation items
    .get('/', async (req: Request, res: Response) => {
        const congregationItems: typeCongregationItem[]|null = await getCongregationItems(req.user)
        return res.json({ success: !!congregationItems, congregationItems })
    })
;
