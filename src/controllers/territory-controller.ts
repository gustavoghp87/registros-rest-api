import express from 'express'
import * as territoryServices from '../services/territory-services'
import { typeVivienda } from '../models/vivienda'

export const router = express.Router()
  .post('/get-blocks', async (req: any, res: any) => {
    const { token, territory } = req.body
    console.log("get blocks " + territory)
    const blocks: string[]|null = await territoryServices.getBlocks(token, territory)
    if (!blocks) return res.json({ success: false })
    res.json({ success: true, blocks })
  })

  .post('/reset', async (req: any, res: any) => {
    const { token, territory, option } = req.body
    const success: boolean = await territoryServices.resetTerritory(token, territory, option)
    res.json({ success })
  })

  .post('/get-households', async (req: any, res: any) => {
    const { token, territory, manzana, isTodo, traidos, traerTodos } = req.body
    const households: typeVivienda[]|null =
      await territoryServices.getHouseholdsByTerritory(token, territory, manzana, isTodo, traidos, traerTodos)
    if (!households) return res.json({ success: false })
    res.json({ success: true, households })
  })

  .post('/modify-household', async (req: any, res: any) => {
    const { token, inner_id, estado, noAbonado, asignado } = req.body
    const households: typeVivienda|null = await territoryServices.modifyHousehold(token, inner_id, estado, noAbonado, asignado)
    if (!households) return res.json({ success: false })
    res.json({ success: true, households })
  })
;
