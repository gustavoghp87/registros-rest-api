import express, { Request, Response, Router } from 'express'
import { logger } from '../server1'
import { authorizationString, typeAllLogsObj } from '../models1'

export const logController: Router = express.Router()

    // get all logs
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const allLogsObj: typeAllLogsObj|null = await logger.GetAll(token)
        res.json({ success: !!allLogsObj, allLogsObj })
    })
;
