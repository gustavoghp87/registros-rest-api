"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const server_1 = require("../server");
const myEmail = 'maslabook.app@gmail.com';
const yourEmail = 'ghc.8786@gmail.com';
let transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: myEmail,
        pass: server_1.emailPSW
    }
});
const mailOptions = {
    from: myEmail,
    to: yourEmail,
    subject: 'App: Territorio casi terminado',
    html: '<h1>Welcome</h1><p>That was easy!</p>'
};
// text: 'Quedan pocos teléfonos sin predicar en los siguientes territorios:',
exports.sendEmail = () => {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("No se mandó correo:", error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
};
