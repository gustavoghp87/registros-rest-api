import { Server } from 'socket.io'
import { domain, server, testingDomain } from '../server'
import { typeUser } from '../models/user'
import { typeVivienda } from '../models/vivienda'

export const socketConnection = (): void => {
    new Server(server, {
        cors: {
            origin: [`${domain}`, `${testingDomain}`],
            methods: ["GET", "POST"],
            //allowedHeaders: ["my-custom-header"],
            credentials: true
        }
    }).on('connection', (socket: any): void => {
        console.log("NEW SOCKET CONNECTION", socket.id)
        socket.on('household: change', (objPackage: any): void => {
            let households: typeVivienda[] = objPackage.households
            const updatedHousehold: typeVivienda = objPackage.updatedHousehold
            const indexOfHousehold: number = objPackage.indexOfHousehold
            if (!households || !updatedHousehold || !indexOfHousehold) { console.log("Error in socket household: change"); return }
            households[indexOfHousehold] = updatedHousehold
            socket.emit('household: change', households)
        })
        socket.on('user: change', (updatedUser: typeUser): void => {
            socket.emit('user: change', updatedUser)
        })
    })
}
