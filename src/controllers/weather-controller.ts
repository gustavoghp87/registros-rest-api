import { getWeatherAndForecastService } from '../services/weather-services'
import express, { Request, Response, Router } from 'express'

export const weatherController: Router = express.Router()

    // get weather and forecast
    .get('/', async (req: Request, res: Response) => {
        const response = await getWeatherAndForecastService(req.user?.congregation || null)
        res.json({
            success: !!response && !!response.weather && !!response.forecast,
            weather: response?.weather,
            forecast: response?.forecast
        })
    })
;
