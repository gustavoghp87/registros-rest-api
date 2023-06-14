"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherDb = void 0;
const server_1 = require("../server");
const log_services_1 = require("../services/log-services");
const getCollection = () => server_1.dbClient.Client.db(server_1.dbClient.DbMW).collection(server_1.dbClient.CollWeather);
class WeatherDb {
    async Genesys() {
        try {
            const result = await getCollection().insertOne({
                weather: null,
                forecast: null,
                date: +new Date()
            });
            console.log("Weather Genesys:", result.insertedId);
            return !!result.insertedId;
        }
        catch (error) {
            server_1.logger.Add(`Falló Weather Genesys(): ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async GetWeatherAndForecast() {
        try {
            const weatherAndForecast = await getCollection().findOne();
            if (!weatherAndForecast)
                throw new Error("No se pudo leer documento");
            return {
                weather: weatherAndForecast.weather,
                forecast: weatherAndForecast.forecast,
                date: weatherAndForecast.date
            };
        }
        catch (error) {
            server_1.logger.Add(`Falló GetWeatherAndForecast(): ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async SaveWeatherAndForecast(weather, forecast) {
        try {
            const result = await getCollection().updateOne({}, { $set: { weather, forecast, date: +new Date() } });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló SaveWeatherAndForecast(): ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
}
exports.WeatherDb = WeatherDb;
