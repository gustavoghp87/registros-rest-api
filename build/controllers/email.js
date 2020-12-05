"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const server_1 = require("../server");
const myEmail = 'misericordiawebapp@gmail.com';
const yourEmail = 'ghc.8786@gmail.com';
let transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: myEmail,
        pass: server_1.emailPSW
    }
});
exports.sendEmail = (territorios) => {
    const mailOptions = {
        from: myEmail,
        to: yourEmail,
        subject: 'App: Alerta de territorios casi terminados',
        html: `<h1>Misericordia Web</h1>
      <p>Este correo automático advierte que los siguientes territorios tienen menos de 50 viviendas libres para predicar:</p><br/>
      ${territorios.map((territorio) => (`<p>Territorio ${territorio}</p><br/>`))}
    `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("No se mandó correo:", error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
};
