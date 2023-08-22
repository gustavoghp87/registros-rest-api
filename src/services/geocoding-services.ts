import { errorLogs } from './log-services'
import { googleGeocodingAPIKey } from '../env-variables'
import { logger } from '../server'
import { typeCoords, typeUser } from '../models'
import NodeGeocoder from 'node-geocoder'

export const getGeocodingFromAddressService = async (requesterUser: typeUser, address: string): Promise<typeCoords|null> => {
    if (!requesterUser || !address) return null
    try {
        const response: NodeGeocoder.Entry[] = await NodeGeocoder({
            provider: 'google',
            // fetch: customFetchImplementation,
            apiKey: googleGeocodingAPIKey,
            formatter: null
        }).geocode({
            address,
            country: 'Argentine'
        })
        if (!response || !response[0]?.latitude || !response[0]?.longitude) return null
        return {
            lat: response[0].latitude,
            lng: response[0].longitude
        }
    } catch (error) {
        logger.Add(requesterUser.congregation, `No se pudo geolocalizar desde dirección ${address}: ${error}`, errorLogs)
        return null
    }
}

export const getGeocodingFromCoordinatesService = async (requesterUser: typeUser, coordinates: typeCoords): Promise<string|null> => {
    if (!requesterUser || !coordinates?.lat || !coordinates?.lng) return null
    try {
        const response: NodeGeocoder.Entry[] = await NodeGeocoder({
            provider: 'google',
            // fetch: customFetchImplementation,
            apiKey: googleGeocodingAPIKey,
            formatter: null
        }).reverse({
            lat: coordinates.lat,
            lon: coordinates.lng
        })
        if (!response || !response[0]?.formattedAddress) return null
        return response[0].formattedAddress
    } catch (error) {
        logger.Add(requesterUser.congregation, `No se pudo geolocalizar desde coordenadas ${coordinates?.lat} ${coordinates?.lng}: ${error}`, errorLogs)
        return null
    }
}
