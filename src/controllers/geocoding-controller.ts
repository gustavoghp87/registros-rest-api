import express, { Request, Response, Router } from 'express'
import { getGeocodingFromAddressService, getGeocodingFromCoordinatesService } from '../services/geocoding-services'
import { typeCoords } from '../models'

export const geocodingController: Router = express.Router()

    // get geocoding from address
    .post('/address', async (req: Request, res: Response) => {
        const address: string = req.body.address as string
        const coordinates: typeCoords|null = await getGeocodingFromAddressService(req.user, address)
        return res.json({ success: !!coordinates, coordinates })
    })

    // get geocoding from coordinates
    .post('/coordinates', async (req: Request, res: Response) => {
        const coordinates: typeCoords = req.body.coordinates as typeCoords
        const address: string|null = await getGeocodingFromCoordinatesService(req.user, coordinates)
        return res.json({ success: !!address, address })
    })
;
