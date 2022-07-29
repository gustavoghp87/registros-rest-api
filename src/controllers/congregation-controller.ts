import express from 'express'
import { Request, Response } from 'express'
import { authorizationString } from '../models'
import { getCongregationItems } from '../services/congregation-services'

export type typeCongregationItem = {
    title: string
    ids: string[]
}

export const router = express.Router()

    // get congregation items
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const congregationItems: typeCongregationItem[]|null = await getCongregationItems(token)
        return res.json({ success: !!congregationItems, congregationItems })
    })
;
