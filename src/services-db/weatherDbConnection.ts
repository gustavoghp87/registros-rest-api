import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { InsertOneResult, UpdateResult } from 'mongodb'
import { typeForecastResponse, typeWeatherResponse } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollWeather)

export class WeatherDb {
    async Genesys(): Promise<boolean> {
        try {
            const result: InsertOneResult = await getCollection().insertOne({
                weather: null,
                forecast: null,
                date: Date.now()
            })
            console.log("Weather Genesys:", result.insertedId)
            return !!result.insertedId
        } catch (error) {
            logger.Add(1, `Falló Weather Genesys(): ${error}`, errorLogs)
            return false
        }
    }
    async GetWeatherAndForecast(): Promise<{ weather?: typeWeatherResponse, forecast?: typeForecastResponse, date?: number }|null> {
        try {
            const weatherAndForecast = await getCollection().findOne() as unknown as { weather: typeWeatherResponse, forecast: typeForecastResponse, date: number }
            if (!weatherAndForecast) throw new Error("No se pudo leer documento")
            return {
                weather: weatherAndForecast.weather,
                forecast: weatherAndForecast.forecast,
                date: weatherAndForecast.date
            }
        } catch (error) {
            logger.Add(1, `Falló GetWeatherAndForecast(): ${error}`, errorLogs)
            return null
        }
    }
    async SaveWeatherAndForecast(weather: typeWeatherResponse, forecast: typeForecastResponse): Promise<boolean> {
        try {
            const result: UpdateResult = await getCollection().updateOne(
                {  },
                { $set: { weather, forecast, date: Date.now() } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(1, `Falló SaveWeatherAndForecast(): ${error}`, errorLogs)
            return false
        }
    }
}
