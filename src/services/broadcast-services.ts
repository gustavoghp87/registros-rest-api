import { Server, Socket } from 'socket.io'
import { domain, logger, server, testingDomain } from '../server'
import { typeUser } from '../models/user'
import { typeHousehold } from '../models/household'
import { typeHTHBuilding } from '../models/houseToHouse'

type householdChangeObjectPackage = {
    households: typeHousehold[]
    updatedHousehold: typeHousehold
    indexOfHousehold: number
    userEmail: string
}

export const socketConnection = (production: boolean): void => {
    new Server(server, {
        cors: {
            origin: production ? [domain] : [domain, testingDomain],
            methods: ["GET", "POST"],
            credentials: true
        }
    }).on('connection', (socket: Socket): void => {
        console.log("NEW SOCKET CONNECTION -", socket.id)
        socket.emit('connection', null);
        socket.on('household: change', (objPackage: householdChangeObjectPackage): void => {
            if (!objPackage) return
            let households: typeHousehold[] = objPackage.households
            const updatedHousehold: typeHousehold = objPackage.updatedHousehold
            const indexOfHousehold: number = objPackage.indexOfHousehold
            const userEmail: string = objPackage.userEmail
            if (!households || !updatedHousehold || indexOfHousehold === null) {
                console.log("\n\nError in socket household: change\n\n");
                logger.Add(`Error en socket household change: ${userEmail} ${households?.length} ${indexOfHousehold} ${JSON.stringify(updatedHousehold)}`, 'socketError')
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
