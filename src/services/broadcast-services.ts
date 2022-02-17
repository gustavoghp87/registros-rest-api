import { Server } from 'socket.io'
import { domain, server, testingDomain } from '../server'
import { typeUser } from '../models/user'
import { typeVivienda } from '../models/vivienda'
import { typeHTHBuilding } from '../models/houseToHouse'

export const socketConnection = (production: boolean): void => {
    new Server(server, {
        cors: {
            origin: production ? [domain] : [domain, testingDomain],
            methods: ["GET", "POST"],
            credentials: true
        }
    }).on('connection', (socket: any): void => {
        console.log("NEW SOCKET CONNECTION -------------------------------------------------------------------------", socket.id)
        socket.emit('connection', null);
        socket.on('household: change', (objPackage: any): void => {
            if (!objPackage) return
            let households: typeVivienda[] = objPackage.households
            const updatedHousehold: typeVivienda = objPackage.updatedHousehold
            const indexOfHousehold: number = objPackage.indexOfHousehold
            const userEmail: string = objPackage.userEmail
            if (!households || !updatedHousehold || indexOfHousehold === null) {
                console.log("\n\nError in socket household: change\n\n");
                return
            }
            households[indexOfHousehold] = updatedHousehold
            socket.emit('household: change', households, userEmail)
            socket.broadcast.emit('household: change', households, userEmail)
        })
        socket.on('user: change', (updatedUser: typeUser): void => {
            socket.emit('user: change', updatedUser)
            socket.broadcast.emit('user: change', updatedUser)
        })
        socket.on('hth: change', (updatedBuildings: typeHTHBuilding[]) => {
            socket.emit('hth: change', updatedBuildings)
            socket.broadcast.emit('hth: change', updatedBuildings)
        })
    })
}
