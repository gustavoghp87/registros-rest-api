"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherController = void 0;
const express_1 = __importDefault(require("express"));
const weather_services_1 = require("../services/weather-services");
exports.weatherController = express_1.default.Router()
    // get weather and forecast
    .get('/', async (req, res) => {
    const response = await (0, weather_services_1.getWeatherAndForecastService)();
    res.json({
        success: !!response && !!response.weather && !!response.forecast,
        weather: response === null || response === void 0 ? void 0 : response.weather,
        forecast: response === null || response === void 0 ? void 0 : response.forecast
    });
});
