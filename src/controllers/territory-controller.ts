import express from 'express'
import { changeStateOfTerritory, searchStateOfTerritories, searchStateOfTerritory } from '../services/state-territory-services'

export const router = express.Router()

router
  .get('/:territorio', async (req, res) => {
    const token = req.header('authorization') || "abcde0123456987"
    const { territorio } = req.params
    const obj = await searchStateOfTerritory(territorio, token)
    res.json({ obj })
  })

  .get('/', async (req, res) => {
    const token = req.header('authorization') || "abcde0123456987"
    const obj = await searchStateOfTerritories(token)
    res.json({ obj })
  })

  .patch('/', async (req, res) => {
    const { territorio, estado, token } = req.body
    if (!territorio || estado === null || estado === undefined) return res.json({ success: false })
    const success = await changeStateOfTerritory(territorio, estado, token)
    res.json({ success })
  })
;
