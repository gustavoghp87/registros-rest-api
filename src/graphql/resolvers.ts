import { PubSub } from 'apollo-server-express'
export const pubsub = new PubSub()

module.exports = {

    Mutation: require('./mutations'),

    Query: require('./queries'),

    Subscription: {
        escucharCambioDeEstado: {
            subscribe: () => {
                console.log(`escuchando /////////////////////////////////////`)
                return pubsub.asyncIterator('cambiarEstado')
            }
        },
        escucharCambioDeUsuario: {
            subscribe: () => {
                console.log(`escuchando /////////////////////////////////////`)
                return pubsub.asyncIterator('cambiarUsuario')
            }
        }
    }

}
