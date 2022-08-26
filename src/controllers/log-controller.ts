import express, { Request, Response, Router } from 'express'
import { logger } from '../server'
import { typeAllLogsObj } from '../models'

export const logController: Router = express.Router()

    // get all logs
    .get('/', async (req: Request, res: Response) => {
        const allLogsObj: typeAllLogsObj|null = await logger.GetAll(req.user)
        res.json({ success: !!allLogsObj, allLogsObj })
    })
;
