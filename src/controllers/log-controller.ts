import express from 'express'
import { logger } from '../server'
import { typeLogsObj } from '../models/log'
import { Request, Response } from 'express'

export const router = express.Router()

    // get all logs
    .get('/', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const logsObject: typeLogsObj|null = await logger.GetAll(token)
        if (!logsObject) return res.json({ success: false })
        res.json({ success: true, logsObject })
    })
;
