import axios from 'axios'
import { openWeatherToken } from '../env-variables'
import { typeForecastResponse, typeUser, typeWeatherResponse } from '../models'

const urlBase: string = 'https://api.openweathermap.org/data/2.5'
const idBuenosAires = 3435910

export const getWeatherAndForecastService = async (requesterUser: typeUser): Promise<{ weather: typeWeatherResponse, forecast: typeForecastResponse }|null> => {
    if (!requesterUser) return null

    // TODO: weather from db, check time
    
    
    const weatherEndPoint: string = `/weather?id=${idBuenosAires}&APPID=${openWeatherToken}&units=metric`
    const forecastEndPoint: string = `/forecast?id=${idBuenosAires}&appid=${openWeatherToken}&units=metric`
    try {
        const weather: typeWeatherResponse = (await axios(urlBase + weatherEndPoint)).data
        const forecast: typeForecastResponse = (await axios(urlBase + forecastEndPoint)).data
        return { weather, forecast }
    } catch (error) {
        console.log(error)
        return null
    }
}
