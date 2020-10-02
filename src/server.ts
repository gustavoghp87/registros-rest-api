import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
export const app = express();
const port = process.env.PORT || 4005;

require('./controllers/database');

// middlewares
app.use(cors());
// const whitelist = ['http://localhost:3000'];

// export const corsOptions = {
//     'Access-Control-Allow-Credentials': true,
//     origin: function (origin:any, callback:any) {
//         if(whitelist.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         };
//     }
// };
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(morgan('dev'));

// routes
app.all('/', function(req, res, next) {
    res.header({"Access-Control-Allow-Origin":true});
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
});
app.use('/api/graphql', require('./graphql/gql.index'))
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
