import express, { Request, Response, Router } from 'express'
import { setUpUser } from './filter-controller'
import { getCongregationItems } from '../services/congregation-services'
import { authorizationString, typeCongregationItem } from '../models'

export const congregationController: Router = express.Router()

    // get congregation items
    .get('/', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const congregationItems: typeCongregationItem[]|null = await getCongregationItems(token)
        return res.json({ success: !!congregationItems, congregationItems })
    })
;
