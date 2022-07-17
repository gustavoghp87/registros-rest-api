import NodeGeocoder from 'node-geocoder'
import { googleGeocodingAPIKey } from '../env-variables'
import { getActivatedUserByAccessTokenService } from './user-services'
import { typeCoords } from '../models/houseToHouse'
import { typeUser } from '../models/user'

export const getGeocodingFromAddressService = async (token: string, address: string): Promise<typeCoords|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    const geocoder = NodeGeocoder({
        provider: 'google',
        // fetch: customFetchImplementation,
        apiKey: googleGeocodingAPIKey,
        formatter: null
    })
    const response: NodeGeocoder.Entry[] = await geocoder.geocode({ address, country: 'Argentine' })
    if (!response || !response[0] || !response[0].latitude || !response[0].longitude) return null
    return {
        lat: response[0].latitude,
        lng: response[0].longitude
    }
}

export const getGeocodingFromCoordinatesService = async (token: string, coordinates: typeCoords): Promise<string|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !coordinates || !coordinates.lat || !coordinates.lng) return null
    const geocoder = NodeGeocoder({
        provider: 'google',
        // fetch: customFetchImplementation,
        apiKey: googleGeocodingAPIKey,
        formatter: null
    })
    const response: NodeGeocoder.Entry[] = await geocoder.reverse({ lat: coordinates.lat, lon: coordinates.lng })
    if (!response || !response[0] || !response[0].formattedAddress) return null
    return response[0].formattedAddress
}
