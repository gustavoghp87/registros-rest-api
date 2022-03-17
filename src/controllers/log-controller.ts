import express from 'express'
import { logger } from '../server'
import { typeLogsObj } from '../models/log'

export const router = express.Router()

    // get all logs
    .get('/', async (req: any, res: any) => {
        const token: string = req.header('authorization') || ""
        const logsObject: typeLogsObj|null = await logger.GetAll(token)
        if (!logsObject) return res.json({ success: false })
        res.json({ success: true, logsObject })
    })
;
