import { domain, logger, server, testingDomain } from '../server'
import { errorLogs } from './log-services'
import { Server, Socket } from 'socket.io'
import { typeHousehold, typeTerritoryNumber, typeUser } from '../models'

type householdChangeObjectPackage = {
    congregation: number;
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

export const socketConnection = (isProduction: boolean): void => {
    new Server(server, {
        cors: {
            origin: isProduction ? [domain] : [domain, testingDomain],
            methods: ["GET", "POST"],
            credentials: true
        }
    }).on(connection, (socket: Socket): void => {
        socket.emit(connection, null)
        socket.on(householdChange, (objPackage: householdChangeObjectPackage): void => {
            if (!objPackage) return
            const congregation: number = objPackage.congregation
            const territoryNumber: typeTerritoryNumber = objPackage.territoryNumber
            const updatedHousehold: typeHousehold = objPackage.updatedHousehold
            const userEmail: string = objPackage.userEmail
            if (!congregation || !territoryNumber || !updatedHousehold || !userEmail) {
                logger.Add(congregation, `Error en socket household change: ${territoryNumber} ${userEmail} ${JSON.stringify(updatedHousehold)}`, errorLogs)
                return
            }
            socket.emit(householdChange, congregation, territoryNumber, updatedHousehold, userEmail)
            socket.broadcast.emit(householdChange, congregation, territoryNumber, updatedHousehold, userEmail)
        })
        socket.on(userChange, (updatedUser: typeUser): void => {
            socket.emit(userChange, updatedUser)
            socket.broadcast.emit(userChange, updatedUser)
        })
        socket.on(hthChange, (congregation: number, territoryNumber0: typeTerritoryNumber, userEmail: string) => {
            if (!congregation || !territoryNumber0 || !userEmail) return
            socket.emit(hthChange, congregation, territoryNumber0, userEmail)
            socket.broadcast.emit(hthChange, congregation, territoryNumber0, userEmail)
        })
    })
}
