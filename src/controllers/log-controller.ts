import express, { Request, Response, Router } from 'express'
import { logger } from '../server'
import { authorizationString, typeLogsObj } from '../models'

export const logController: Router = express.Router()

    // get all logs
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const logsObject: typeLogsObj|null = await logger.GetAll(token)
        if (!logsObject) return res.json({ success: false })
        res.json({ success: true, logsObject })
    })
;
