import express, { Request, Response } from 'express'
import { territorioType } from "../types/types"
import * as functions from '../controllers/functions'

const router = express.Router()
const { auth } = require('../controllers/auth')

router

.post('/territorios', auth, async (req:Request, res:Response) => {
    let territorios = req.user.asign
    res.json({territorios})
})


.post('/getBuildings/:terri', async (req, res) => {
    const territorio = await functions.searchTerritoryByNumber(req.params.terri, "1")
    let unterritorio:territorioType[] = territorio
    res.status(200).json({unterritorio})
})


.get('/territorios/:terri/:manzana/nopred', async (req, res) => {res.send("territorios")})
.get('/estadisticas', async (req, res) => {res.send("estadisticas")})
.get('/estadisticas/:terri', async (req, res) => {res.send("estadisticas")})
.post('/agregarVivienda', async (req, res) => {res.send("agregarVivienda")})
.get('/revisitas', async (req, res) => {res.send("revisitas")})


module.exports = router
