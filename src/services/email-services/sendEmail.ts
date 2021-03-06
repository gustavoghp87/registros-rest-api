import nodemailer from 'nodemailer'
import { myEmail, yourEmail, emailPSW } from '../env-variables'


export const sendEmail = (territorios: string[]) => {

  const mailOptions = {
    from: myEmail,
    to: yourEmail,
    subject: 'App: Alerta de territorios casi terminados',
    html: `<h1>Misericordia Web</h1>
      <p>Este correo automático advierte que los siguientes territorios tienen menos
       de 50 viviendas libres para predicar:</p><br/>
      ${territorios.map((territorio:string) => (
        `<p>${territorio}</p>`
      ))}
    `
  }

  nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: myEmail,
        pass: emailPSW
    }
  }).sendMail(mailOptions, (error, info) => {
    if (error) console.log("No se mandó correo:", error)
    else console.log('Email sent: ' + info.response)
  })
}
