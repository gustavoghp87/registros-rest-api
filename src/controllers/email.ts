import nodemailer from 'nodemailer'
import { emailPSW } from '../server'


const myEmail = 'misericordiawebapp@gmail.com'
const yourEmail = 'ghc.8786@gmail.com'

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: myEmail,
        pass: emailPSW
    }
})

export const sendEmail = (territorios:number[]) => {

  const mailOptions = {
    from: myEmail,
    to: yourEmail,
    subject: 'App: Alerta de territorios casi terminados',
    html: `<h1>Misericordia Web</h1>
      <p>Este correo automático advierte que los siguientes territorios tienen menos de 50 viviendas libres para predicar:</p><br/>
      ${territorios.map((territorio:number) => (
        `<p>Territorio ${territorio}</p><br/>`
      ))}
    `
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("No se mandó correo:", error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}
