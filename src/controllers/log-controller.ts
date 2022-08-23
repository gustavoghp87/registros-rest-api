import express, { Request, Response, Router } from 'express'
import { setUpUser } from './filter-controller'
import { logger } from '../server'
import { authorizationString, typeAllLogsObj } from '../models'

export const logController: Router = express.Router()

    // get all logs
    .get('/', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const allLogsObj: typeAllLogsObj|null = await logger.GetAll(token)
        res.json({ success: !!allLogsObj, allLogsObj })
    })
;
