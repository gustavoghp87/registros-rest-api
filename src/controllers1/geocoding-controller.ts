import express, { Request, Response, Router } from 'express'
import { getGeocodingFromAddressService, getGeocodingFromCoordinatesService } from '../services1/geocoding-services'
import { authorizationString, typeCoords } from '../models1'

export const geocodingController: Router = express.Router()

    // get geocoding from address
    .post('/address', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const address: string = req.body.address as string
        const coordinates: typeCoords|null = await getGeocodingFromAddressService(token, address)
        return res.json({ success: !!coordinates, coordinates })
    })

    // get geocoding from coordinates
    .post('/coordinates', async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const coordinates: typeCoords = req.body.coordinates as typeCoords
        const address: string|null = await getGeocodingFromCoordinatesService(token, coordinates)
        return res.json({ success: !!address, address })
    })
;
