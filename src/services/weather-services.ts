import { errorLogs } from './log-services'
import { logger } from '../server'
import { openWeatherToken } from '../env-variables'
import { typeForecastResponse, typeWeatherResponse } from '../models'
import { WeatherDb } from '../services-db/weatherDbConnection'
import axios from 'axios'

const urlBase: string = 'https://api.openweathermap.org/data/2.5'
const idBuenosAires = 3435910

const weatherDbConnection: WeatherDb = new WeatherDb()

export const getWeatherAndForecastService =
 async (congregation: number|null): Promise<{ weather: typeWeatherResponse, forecast: typeForecastResponse }|null> => {
    const weatherAndForecast = await weatherDbConnection.GetWeatherAndForecast()
    if (weatherAndForecast && weatherAndForecast.weather && weatherAndForecast.forecast && weatherAndForecast.date
     && weatherAndForecast.date > +new Date() - 1500000) {
        return {
            weather: weatherAndForecast.weather,
            forecast: weatherAndForecast.forecast
        }
    }
    const weatherEndPoint: string = `/weather?id=${idBuenosAires}&appid=${openWeatherToken}&units=metric`
    const forecastEndPoint: string = `/forecast?id=${idBuenosAires}&appid=${openWeatherToken}&units=metric`
    try {
        const weather: typeWeatherResponse = (await axios(urlBase + weatherEndPoint)).data
        const forecast: typeForecastResponse = (await axios(urlBase + forecastEndPoint)).data
        if (weather && forecast) {
            const success: boolean = await weatherDbConnection.SaveWeatherAndForecast(weather, forecast)
            if (!success) logger.Add(congregation || 1, `No se pudo guardar el pronóstico del tiempo en la DB`, errorLogs)
        }
        return { weather, forecast }
    } catch (error) {
        logger.Add(congregation || 1, `Falló getWeatherAndForecastService(): ${error}`, errorLogs)
        return null
    }
}
