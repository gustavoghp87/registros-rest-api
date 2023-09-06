import { getCoordinatesFromAddressService, getAddressFromCoordinatesService, getStreetFromCoordinatesService } from '../services/geocoding-services'
import { typeCoords } from '../models'
import express, { Request, Response, Router } from 'express'

export const geocodingController: Router = express.Router()

    // get coordinates from address
    .post('/address', async (req: Request, res: Response) => {
        const address = req.body.address as string
        const coordinates: typeCoords|null = await getCoordinatesFromAddressService(req.user, address)
        return res.json({ success: !!coordinates, coordinates })
    })

    // get address from coordinates
    .post('/coordinates', async (req: Request, res: Response) => {
        const coordinates: typeCoords = req.body.coordinates as typeCoords
        const address: string|null = await getAddressFromCoordinatesService(req.user, coordinates)
        return res.json({ success: !!address, address })
    })

    // get geocoding from coordinates
    .post('/street', async (req: Request, res: Response) => {
        const coordinates: typeCoords = req.body.coordinates as typeCoords
        const street: string|null = await getStreetFromCoordinatesService(req.user, coordinates)
        return res.json({ success: !!street, street })
    })
;
