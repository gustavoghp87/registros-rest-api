import express from 'express'
import { Request, Response } from 'express'
import { logger } from '../server'
import { authorizationString, typeLogsObj } from '../models'

export const router = express.Router()

    // get all logs
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const logsObject: typeLogsObj|null = await logger.GetAll(token)
        if (!logsObject) return res.json({ success: false })
        res.json({ success: true, logsObject })
    })
;
