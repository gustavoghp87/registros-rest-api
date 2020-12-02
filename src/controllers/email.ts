import nodemailer from 'nodemailer'
import { emailPSW } from '../server'

console.log(emailPSW)

const myEmail = 'misericordiawebapp@gmail.com'
const yourEmail = 'ghc.8786@gmail.com'

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: myEmail,
        pass: emailPSW
    }
})

const mailOptions = {
    from: myEmail,
    to: yourEmail,
    subject: 'App: Territorio casi terminado',
    html: '<h1>Welcome</h1><p>That was easy!</p>'
}

// text: 'Quedan pocos teléfonos sin predicar en los siguientes territorios:',

export const sendEmail = () => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("No se mandó correo:", error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })
}
