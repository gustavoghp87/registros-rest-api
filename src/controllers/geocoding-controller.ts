import express from 'express'
import { Request, Response } from 'express'
import { typeCoords } from '../models/houseToHouse';
import { getGeocodingFromAddressService, getGeocodingFromCoordinatesService } from '../services/geocoding-services';

export const router = express.Router()

    // get geocoding from address
    .post('/address', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const address: string = req.body.address as string
        const coordinates: typeCoords|null = await getGeocodingFromAddressService(token, address)
        return res.json({ success: coordinates ? true : false, coordinates })
    })

    // get geocoding from coordinates
    .post('/coordinates', async (req: Request, res: Response) => {
        const token: string = req.header('Authorization') || ""
        const coordinates: typeCoords = req.body.coordinates as typeCoords
        const address: string|null = await getGeocodingFromCoordinatesService(token, coordinates)
        return res.json({ success: address ? true : false, address })
    })
;
