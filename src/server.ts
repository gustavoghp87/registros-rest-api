//const express = require('express');
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 4005;

// middlewares
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(morgan('dev'));


//static files
app.use(express.static(path.join(__dirname, 'frontend-src')));
app.use(express.static(path.join(__dirname, 'build')));

// routes
app.use('/api/users', require('./routes/users'));
app.use('/api/buildings', require('./routes/buildings'));


(() => {
    try {
        app.listen(port, () => {
            console.log(`\n\nServer listening on port ${port}`);
        });
    } catch (error) {console.log(error)};
})();
