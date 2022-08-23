import express, { Request, Response, Router } from 'express'
import { setUpUser } from './filter-controller'
import { getForecast, getWeather } from '../services/weather-services'
import { authorizationString, typeForecastResponse, typeWeatherResponse } from '../models'

export const weatherController: Router = express.Router()

    // get weather
    .get('/', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const weather: typeWeatherResponse|null = await getWeather(token)
        res.json({ success: !!weather, weather })
    })

    // get forecast
    .get('/forecast', setUpUser, async (req: Request, res: Response) => {
        const token: string = req.header(authorizationString) || ""
        const forecast: typeForecastResponse|null = await getForecast(token)
        res.json({ success: !!forecast, forecast })
    })
;
