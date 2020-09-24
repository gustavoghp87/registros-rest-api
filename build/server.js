"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//const express = require('express');
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const app = express_1.default();
const port = process.env.PORT || 4005;
// middlewares
app.use(morgan_1.default('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
//static files
app.use(express_1.default.static(path_1.default.join(__dirname, 'frontend-src')));
// routes
app.use(require('./routes/index.routes'));
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
