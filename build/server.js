"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//const express = require('express');
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
const port = process.env.PORT || 4005;
// middlewares
app.use(cors_1.default());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(morgan_1.default('dev'));
//static files
app.use(express_1.default.static(path_1.default.join(__dirname, 'frontend-src')));
app.use(express_1.default.static(path_1.default.join(__dirname, 'build')));
// routes
app.use('/api/users', require('./routes/users'));
app.use('/api/buildings', require('./routes/buildings'));
(() => {
    try {
        app.listen(port, () => {
            console.log(`\n\nServer listening on port ${port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
    ;
})();
