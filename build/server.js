"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_ENV = exports.port = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.app = express_1.default();
exports.port = process.env.PORT || 4005;
exports.NODE_ENV = process.env.NODE_ENV || "dev";
require('./controllers/database');
// middlewares
exports.app.use(cors_1.default());
exports.app.use(cookie_parser_1.default());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use(express_1.default.json());
exports.app.use(morgan_1.default('dev'));
// routes
exports.app.all('/', function (req, res, next) {
    res.header({ "Access-Control-Allow-Origin": true });
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
exports.app.use('/api/graphql', require('./graphql/gql.index'));
exports.app.use('/api/users', require('./routes/users'));
exports.app.use('/api/buildings', require('./routes/buildings'));
//static files
exports.app.use(express_1.default.static(path_1.default.join(__dirname, 'frontend-src')));
exports.app.use(express_1.default.static(path_1.default.join(__dirname, 'build')));
(() => {
    try {
        exports.app.listen(exports.port, () => {
            console.log(`\n\nServer listening on port ${exports.port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
})();
