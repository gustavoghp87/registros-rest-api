"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeatherAndForecastService = void 0;
const axios_1 = __importDefault(require("axios"));
const server_1 = require("../server");
const env_variables_1 = require("../env-variables");
const log_services_1 = require("./log-services");
const weatherDbConnection_1 = require("../services-db/weatherDbConnection");
const urlBase = 'https://api.openweathermap.org/data/2.5';
const idBuenosAires = 3435910;
const weatherDbConnection = new weatherDbConnection_1.WeatherDb();
const getWeatherAndForecastService = async () => {
    const weatherAndForecast = await weatherDbConnection.GetWeatherAndForecast();
    if (weatherAndForecast && weatherAndForecast.weather && weatherAndForecast.forecast && weatherAndForecast.date
        && weatherAndForecast.date > +new Date() - 1500000) {
        return {
            weather: weatherAndForecast.weather,
            forecast: weatherAndForecast.forecast
        };
    }
    const weatherEndPoint = `/weather?id=${idBuenosAires}&APPID=${env_variables_1.openWeatherToken}&units=metric`;
    const forecastEndPoint = `/forecast?id=${idBuenosAires}&appid=${env_variables_1.openWeatherToken}&units=metric`;
    try {
        const weather = (await (0, axios_1.default)(urlBase + weatherEndPoint)).data;
        const forecast = (await (0, axios_1.default)(urlBase + forecastEndPoint)).data;
        if (weather && forecast) {
            const success = await weatherDbConnection.SaveWeatherAndForecast(weather, forecast);
            if (!success)
                server_1.logger.Add(`No se pudo guardar el pronóstico del tiempo en la DB`, log_services_1.errorLogs);
        }
        return { weather, forecast };
    }
    catch (error) {
        server_1.logger.Add(`Falló getWeatherAndForecastService(): ${error}`, log_services_1.errorLogs);
        return null;
    }
};
exports.getWeatherAndForecastService = getWeatherAndForecastService;
