import axios from 'axios'
import { openWeatherToken } from '../env-variables'
import { typeForecastResponse, typeWeatherResponse } from '../models'

const urlBase: string = 'https://api.openweathermap.org/data/2.5'
const idBuenosAires = 3435910

export const getWeather = async (token: string): Promise<typeWeatherResponse|null> => {
    // TODO: auth
    // TODO: weather from db, check time
    const weatherEndPoint: string = `/weather?id=${idBuenosAires}&APPID=${openWeatherToken}&units=metric`
    try {
        const weather: typeWeatherResponse = (await axios(urlBase + weatherEndPoint)).data
        return weather
    } catch (error) {
        console.log(error)
        return null
    }
}

export const getForecast = async (token: string): Promise<typeForecastResponse|null> => {
    // TODO: auth
    // TODO: weather from db, check time
    const forecastEndPoint: string = `/forecast?id=${idBuenosAires}&appid=${openWeatherToken}&units=metric`
    try {
        const forecast: typeForecastResponse = (await axios(urlBase + forecastEndPoint)).data
    
        console.log({ forecast })

        forecast.list.forEach((element: any) => {
            console.log(element)
        })

        return forecast
    } catch (error) {
        console.log(error)
        return null
    }
}
