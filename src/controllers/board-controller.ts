import { getBoardItems } from '../services/board-services'
import { typeBoardItem } from '../models'
import express, { Request, Response, Router } from 'express'

export const boardController: Router = express.Router()

    // get board items
    .get('/', async (req: Request, res: Response) => {
        const boardItems: typeBoardItem[]|null = await getBoardItems(req.user)
        return res.json({ success: !!boardItems, boardItems })
    })
;
