"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodingController = void 0;
const express_1 = __importDefault(require("express"));
const geocoding_services_1 = require("../services/geocoding-services");
exports.geocodingController = express_1.default.Router()
    // get geocoding from address
    .post('/address', async (req, res) => {
    const address = req.body.address;
    const coordinates = await (0, geocoding_services_1.getGeocodingFromAddressService)(req.user, address);
    return res.json({ success: !!coordinates, coordinates });
})
    // get geocoding from coordinates
    .post('/coordinates', async (req, res) => {
    const coordinates = req.body.coordinates;
    const address = await (0, geocoding_services_1.getGeocodingFromCoordinatesService)(req.user, coordinates);
    return res.json({ success: !!address, address });
});
