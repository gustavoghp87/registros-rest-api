import NodeGeocoder from 'node-geocoder'
import { googleGeocodingAPIKey } from '../env-variables'
import { logger } from '../server'
import { errorLogs } from './log-services'
import { getActivatedUserByAccessTokenService } from './user-services'
import { typeCoords, typeUser } from '../models'

export const getGeocodingFromAddressService = async (token: string, address: string): Promise<typeCoords|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
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
        if (!response || !response[0] || !response[0].latitude || !response[0].longitude) return null
        return {
            lat: response[0].latitude,
            lng: response[0].longitude
        }
    } catch (error) {
        console.log(error)
        logger.Add(`No se pudo geolocalizar desde dirección ${address}: ${error}`, errorLogs)
        return null
    }
}

export const getGeocodingFromCoordinatesService = async (token: string, coordinates: typeCoords): Promise<string|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !coordinates || !coordinates.lat || !coordinates.lng) return null
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
        if (!response || !response[0] || !response[0].formattedAddress) return null
        return response[0].formattedAddress
    } catch (error) {
        console.log(error)
        logger.Add(`No se pudo geolocalizar desde coordenadas ${coordinates?.lat} ${coordinates?.lng}: ${error}`, errorLogs)
        return null
    }
}
