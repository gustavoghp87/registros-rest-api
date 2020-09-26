import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
const cookieParser = require('cookie-parser');
export const app = express();
const port = process.env.PORT || 4005;

require('./controllers/database');

// middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('dev'));

// routes
app.use('/api/users', require('./routes/users'));
app.use('/api/buildings', require('./routes/buildings'));

//static files
app.use(express.static(path.join(__dirname, 'frontend-src')));
app.use(express.static(path.join(__dirname, 'build')));


(() => {
    try {
        app.listen(port, () => {
            console.log(`\n\nServer listening on port ${port}`);
        });
    } catch (error) {console.log(error)};
})();
