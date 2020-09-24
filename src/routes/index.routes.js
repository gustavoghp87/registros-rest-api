const express = require('express');
const router = express.Router();
//const Vivienda = require('../model/Vivienda');
//const User = require('../model/User');
//const Mayor = require('../model/Mayor');
//const passport = require('passport');
//const env = require('../env.json');

router.get('/', (_, res) => res.send("Ok get /"));
router.get('/register', async (_, res) => {res.send("Register")});
router.get('/login', async (_, res) => {res.send("login")});
router.post('/login', (req, res) => {res.send("login post")});
router.get('/logout', (req, res) => {res.send("logout")});
router.get('/admins', async (req, res) => {res.send("admins")});
router.get('/territorios', async (req, res) => {res.send("territorios")});
router.get('/territorios/:terri/:manzana', async (req, res) => {res.send("territorios")});
router.get('/territorios/:terri/:manzana/nopred', async (req, res) => {res.send("territorios")});
router.get('/estadisticas', async (req, res) => {res.send("estadisticas")});
router.get('/estadisticas/:terri', async (req, res) => {res.send("estadisticas")});
router.post('/agregarVivienda', async (req, res) => {res.send("agregarVivienda")});
router.get('/revisitas', async (req, res) => {res.send("revisitas")});

module.exports = router;
