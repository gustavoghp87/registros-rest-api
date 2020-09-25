import express from 'express';
const router = express.Router();
//const Vivienda = require('../model/Vivienda');
//const User = require('../model/User');
//const Mayor = require('../model/Mayor');
//const passport = require('passport');
//const env = require('../env.json');


router.post('/register', async (_, res) => {res.send("Register")});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    
    res.status(200).json({login:"ok"});
});

router.get('/logout', (req, res) => {
    res.status(200).json({response:"ok"})
});


module.exports = router;
