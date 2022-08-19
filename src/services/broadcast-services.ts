import { Server, Socket } from 'socket.io'
import { domain, logger, server, testingDomain } from '../server'
import { errorLogs } from './log-services'
import { typeHousehold, typeTerritoryNumber, typeUser } from '../models'

type householdChangeObjectPackage = {
    territoryNumber: typeTerritoryNumber
    updatedHousehold: typeHousehold
    userEmail: string
}

type socketConnection =
    'connection' |
    'hth: change' |
    'telephonic-household: change' |
    'user: change'
;

const connection: socketConnection = 'connection'
const householdChange: socketConnection = 'telephonic-household: change'
const userChange: socketConnection = 'user: change'
const hthChange: socketConnection = 'hth: change'

export const socketConnection = (production: boolean): void => {
    new Server(server, {
        cors: {
            origin: production ? [domain] : [domain, testingDomain],
            methods: ["GET", "POST"],
            credentials: true
        }
    }).on(connection, (socket: Socket): void => {
        socket.emit(connection, null)
        socket.on(householdChange, (objPackage: householdChangeObjectPackage): void => {
            if (!objPackage) return
            const territoryNumber: typeTerritoryNumber = objPackage.territoryNumber
            const updatedHousehold: typeHousehold = objPackage.updatedHousehold
            const userEmail: string = objPackage.userEmail
            if (!territoryNumber || !updatedHousehold || !userEmail) {
                logger.Add(`Error en socket household change: ${territoryNumber} ${userEmail} ${JSON.stringify(updatedHousehold)}`, errorLogs)
                return
            }
            socket.emit(householdChange, territoryNumber, updatedHousehold, userEmail)
            socket.broadcast.emit(householdChange, territoryNumber, updatedHousehold, userEmail)
        })
        socket.on(userChange, (updatedUser: typeUser): void => {
            socket.emit(userChange, updatedUser)
            socket.broadcast.emit(userChange, updatedUser)
        })
        socket.on(hthChange, (territoryNumber0: typeTerritoryNumber, userEmail: string) => {
            if (!territoryNumber0 || !userEmail) return
            socket.emit(hthChange, territoryNumber0, userEmail)
            socket.broadcast.emit(hthChange, territoryNumber0, userEmail)
        })
    })
}
