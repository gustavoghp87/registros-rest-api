"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMockedUserResponse = void 0;
const testUser = 'test@user.com';
const testAdmin = 'test@admin.com';
const tokenTestUser = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const tokenTestAdmin = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab';
const getMockedUserResponse = (token, email) => {
    if (!token && !email)
        return null;
    let isAdmin;
    if (token === tokenTestUser || email === testUser)
        isAdmin = false;
    else if (token === tokenTestAdmin || email === testAdmin)
        isAdmin = true;
    else
        return null;
    const userEmail = isAdmin ? testAdmin : testUser;
    return {
        success: true,
        address: "Concordia 21 1 2",
        allLogsObj: {
            campaignLogs: {
                logs: [{
                        logText: `20/8/2022, 19:47:38 | Usuario ${userEmail} recibió el paquete 97 por solicitud automática`,
                        timestamp: 1661168080000
                    }],
                type: 'CampaignLogs'
            },
            errorLogs: {
                logs: [{
                        logText: `14/7/2022 21:55:33 | No se pudo enviar correo de recuperación de cuenta a ${userEmail}`,
                        timestamp: 1661168080000
                    }],
                type: 'ErrorLogs'
            },
            houseToHouseAdminLogs: {
                logs: [{
                        logText: `19/8/2022, 10:59:33 | Admin ${userEmail} modificó el mapa del territorio 4`,
                        timestamp: 1661168080000
                    }],
                type: 'HouseToHouseAdminLogs'
            },
            houseToHouseLogs: {
                logs: [{
                        logText: `19/8/2022, 10:59:33 | El usuario ${userEmail} hizo una observación en el territorio 4`,
                        timestamp: 1661168080000
                    }],
                type: 'HouseToHouseLogs'
            },
            loginLogs: {
                logs: [{
                        logText: `19/8/2022, 10:59:33 | Se logueó el ${userEmail}`,
                        timestamp: 1661168080000
                    }],
                type: 'LoginLogs'
            },
            telephonicLogs: {
                logs: [{
                        logText: `19/8/2022, 10:59:33 | Usuario ${userEmail} modificó una vivienda: territorio 52, vivienda 22031, estado No contestó, no abonado false, asignado false`,
                        timestamp: 1661168080000
                    }],
                type: 'TelephonicLogs'
            },
            telephonicStateLogs: {
                logs: [{
                        logText: `19/8/2022, 10:59:33 | Usuario ${userEmail} cambia territorio 14 a terminado`,
                        timestamp: 1661168080000
                    }],
                type: 'TelephonicStateLogs'
            },
            userLogs: {
                logs: [{
                        logText: `19/8/2022, 10:59:33 | Se desasignó el territorio de telefónica 14 a ${userEmail} porque lo cerró`,
                        timestamp: 1661168080000
                    }],
                type: 'UserLogs'
            },
        },
        alreadyExists: false,
        campaignAssignments: [44],
        campaignPack: {
            assignedTo: userEmail,
            calledPhones: [],
            from: 1122223300,
            id: 44,
            isAccessible: false,
            isFinished: false,
            to: 1122223349
        },
        campaignPacks: [{
                assignedTo: userEmail,
                calledPhones: [],
                from: 1122223300,
                id: 44,
                isAccessible: false,
                isFinished: false,
                to: 1122223349
            }],
        congregationItems: [
            {
                ids: [],
                title: "Anuncios y Cartas"
            },
            {
                ids: [],
                title: "Programa de reuniones"
            },
            {
                ids: [],
                title: "Predicación"
            },
            {
                ids: [],
                title: "Sonido y Acomodadores"
            },
            {
                ids: [],
                title: "Limpieza"
            },
            {
                ids: [],
                title: "Grupos"
            }
        ],
        coordinates: {
            lat: -34.6319777,
            lng: -58.4757213
        },
        dataError: false,
        email: userEmail,
        emailSuccess: true,
        expired: false,
        globalStatistics: {
            numberOf_ADejarCarta: 1,
            numberOf_Contesto: 1000,
            numberOf_FreePhones: 3000,
            numberOf_NoAbonado: 500,
            numberOf_NoContesto: 800,
            numberOf_NoLlamar: 100,
            numberOfHouseholds: 5401
        },
        gmailKeys: {
            access_token: "abc",
            expiry_date: 11111111111,
            id_token: 'abc123',
            refresh_token: 'aabbcc'
        },
        household: {
            address: "Concordia 21 1 2",
            block: "1",
            callingState: "No predicado",
            dateOfLastCall: 1661190010295,
            notSubscribed: false,
            householdId: 1,
            isAssigned: false,
            phoneNumber: "54-11-4613-0867",
            doorBell: "1 2",
            street: "Concordia",
            streetNumber: 21
        },
        hthTerritory: {
            map: {
                centerCoords: {
                    lat: -34.63088475094777,
                    lng: -58.47324188830458
                },
                lastEditor: userEmail,
                markers: [],
                polygons: [
                    {
                        block: "1",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.6304776580043,
                            lng: -58.474124535421154
                        },
                        coordsPoint2: {
                            lat: -34.631218766130246,
                            lng: -58.47434904391251
                        },
                        coordsPoint3: {
                            lat: -34.63074553684708,
                            lng: -58.475149819321636
                        },
                        doNotCalls: [
                            {
                                creatorId: 1,
                                date: "2022-07-11",
                                doorBell: "2A",
                                id: 1657570428011,
                                streetNumber: 2349,
                                deleted: false
                            },
                            {
                                creatorId: 1,
                                date: "2022-07-11",
                                doorBell: "3B",
                                id: 1657570751929,
                                streetNumber: 2350,
                                deleted: false
                            },
                            {
                                creatorId: 1,
                                date: "2022-07-11",
                                doorBell: "",
                                id: 1657572430332,
                                streetNumber: 2351,
                                deleted: false
                            },
                            {
                                creatorId: 1,
                                date: "2022-07-11",
                                doorBell: "C",
                                id: 1657572670460,
                                streetNumber: 2348,
                                deleted: false
                            },
                            {
                                creatorId: 1,
                                date: "2022-07-12",
                                doorBell: "1D",
                                id: 1657644187635,
                                streetNumber: 2350,
                                deleted: false
                            },
                            {
                                creatorId: 1,
                                date: "2022-07-12",
                                doorBell: "",
                                id: 1657675116946,
                                streetNumber: 2301,
                                deleted: false
                            }
                        ],
                        face: "A",
                        id: 1657563696007,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: false,
                            reopeningDates: [1669900946000]
                        },
                        observations: [
                            {
                                creatorId: 1,
                                date: "2022-07-12",
                                id: 1657675250321,
                                text: "Observación editada",
                                deleted: false
                            },
                            {
                                creatorId: 1,
                                date: "2022-08-06",
                                id: 1659835150715,
                                text: "Observación 2: queda observado de prueba, queda observado de prueba, queda observado de prueba",
                                deleted: false
                            }
                        ],
                        street: "Yerbal"
                    },
                    {
                        block: "1",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.6304921387505,
                            lng: -58.474119670542095
                        },
                        coordsPoint2: {
                            lat: -34.63174442188175,
                            lng: -58.473549378761355
                        },
                        coordsPoint3: {
                            lat: -34.63122262836885,
                            lng: -58.474343099956926
                        },
                        doNotCalls: [],
                        face: "B",
                        id: 1657659482046,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: true,
                            reopeningDates: [1669900946000]
                        },
                        observations: [
                            {
                                creatorId: 1,
                                date: "2022-08-17",
                                id: 1660752010256,
                                text: "Obs manz 1 cara 2",
                                deleted: false
                            }
                        ],
                        street: "Cuenca"
                    },
                    {
                        block: "1",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.63122845386888,
                            lng: -58.4743457366586
                        },
                        coordsPoint2: {
                            lat: -34.63173752507019,
                            lng: -58.473545928983995
                        },
                        coordsPoint3: {
                            lat: -34.63201960654559,
                            lng: -58.47456916607343
                        },
                        doNotCalls: [
                            {
                                creatorId: 1,
                                date: "2022-07-14",
                                doorBell: "1° C",
                                id: 1657805998721,
                                streetNumber: 2310,
                                deleted: false
                            }
                        ],
                        face: "C",
                        id: 1657659646637,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: false,
                            reopeningDates: [1669900946000]
                        },
                        observations: [
                            {
                                creatorId: 1,
                                date: "2022-07-14",
                                id: 1657805967853,
                                text: "Observación Manzana 1 cara C: una observación",
                                deleted: false
                            }
                        ],
                        street: "Av Rivadavia"
                    },
                    {
                        block: "1",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.632014299458405,
                            lng: -58.474567394274125
                        },
                        coordsPoint2: {
                            lat: -34.631223658607745,
                            lng: -58.47435159745405
                        },
                        coordsPoint3: {
                            lat: -34.63075742993098,
                            lng: -58.47514797152022
                        },
                        doNotCalls: [],
                        face: "D",
                        id: 1657735692516,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: false,
                            reopeningDates: [1669900946000]
                        },
                        observations: [
                            {
                                creatorId: 1,
                                date: "2022-07-16",
                                id: 1657995658398,
                                text: "Observación corta",
                                deleted: false
                            },
                            {
                                creatorId: 1,
                                date: "2022-07-16",
                                id: 1657997472488,
                                text: "Observación corta ccc",
                                deleted: false
                            },
                            {
                                creatorId: 1,
                                date: "2022-07-16",
                                id: 1657997741120,
                                text: "Observación corta ddd",
                                deleted: false
                            }
                        ],
                        street: "Campana 2"
                    },
                    {
                        block: "2",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.630204915700354,
                            lng: -58.473028680697446
                        },
                        coordsPoint2: {
                            lat: -34.63097213296905,
                            lng: -58.473238476259276
                        },
                        coordsPoint3: {
                            lat: -34.63045762798701,
                            lng: -58.474046081362346
                        },
                        doNotCalls: [],
                        face: "A",
                        id: 1657766647124,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: false,
                            reopeningDates: [1669900946000]
                        },
                        observations: [],
                        street: "Yerbal"
                    },
                    {
                        block: "2",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.630205790055356,
                            lng: -58.473025148083366
                        },
                        coordsPoint2: {
                            lat: -34.630968198873006,
                            lng: -58.47322909985364
                        },
                        coordsPoint3: {
                            lat: -34.631424999709175,
                            lng: -58.472447193653515
                        },
                        doNotCalls: [],
                        face: "B",
                        id: 1657766688331,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: true,
                            reopeningDates: [1669900946000]
                        },
                        observations: [],
                        street: "Helguera"
                    },
                    {
                        block: "2",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.63096789381602,
                            lng: -58.47324566225329
                        },
                        coordsPoint2: {
                            lat: -34.63140970205187,
                            lng: -58.47247310452848
                        },
                        coordsPoint3: {
                            lat: -34.631700267343504,
                            lng: -58.47349132464968
                        },
                        doNotCalls: [],
                        face: "C",
                        id: 1657808465215,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: false,
                            reopeningDates: [1669900946000]
                        },
                        observations: [],
                        street: "Av Rivadavia"
                    },
                    {
                        block: "2",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.63046105805857,
                            lng: -58.474055929853705
                        },
                        coordsPoint2: {
                            lat: -34.6309720517209,
                            lng: -58.47324974051218
                        },
                        coordsPoint3: {
                            lat: -34.63170999722204,
                            lng: -58.473500038718505
                        },
                        doNotCalls: [],
                        face: "D",
                        id: 1657812818508,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: false,
                            reopeningDates: [1669900946000]
                        },
                        observations: [],
                        street: "Av Rivadavia"
                    },
                    {
                        block: "3",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.630183519872006,
                            lng: -58.472938005691645
                        },
                        coordsPoint2: {
                            lat: -34.62990669955477,
                            lng: -58.47182089656976
                        },
                        coordsPoint3: {
                            lat: -34.63063194128851,
                            lng: -58.47203827580757
                        },
                        doNotCalls: [],
                        face: "A",
                        id: 1657813113307,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: true,
                            reopeningDates: [1669900946000]
                        },
                        observations: [],
                        street: "Yerbal"
                    },
                    {
                        block: "3",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        doNotCalls: [],
                        coordsPoint1: {
                            lat: -34.629890981054835,
                            lng: -58.47182041565869
                        },
                        coordsPoint2: {
                            lat: -34.63108362924742,
                            lng: -58.47127456095124
                        },
                        coordsPoint3: {
                            lat: -34.630628431895325,
                            lng: -58.472041775457676
                        },
                        face: "B",
                        id: 1657824975187,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: false,
                            reopeningDates: [1669900946000]
                        },
                        observations: [],
                        street: "Argerich"
                    },
                    {
                        block: "3",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.6306289361724,
                            lng: -58.47204842526862
                        },
                        coordsPoint2: {
                            lat: -34.63108458215116,
                            lng: -58.47127586754381
                        },
                        coordsPoint3: {
                            lat: -34.631388985052894,
                            lng: -58.47236695616786
                        },
                        doNotCalls: [],
                        face: "C",
                        id: 1657828465443,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: false,
                            reopeningDates: [1669900946000]
                        },
                        observations: [],
                        street: "Av Rivadavia"
                    },
                    {
                        block: "3",
                        buildings: [
                            {
                                creatorId: 1,
                                dateOfLastSharing: 0,
                                hasCharacters: true,
                                hasContinuousNumbers: false,
                                hasLowLevel: false,
                                households: [
                                    {
                                        "dateOfLastCall": 0,
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335840,
                                        "isChecked": false,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335841,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 1
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335842,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335843,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "C",
                                        "doorNumber": 3,
                                        "id": 1661442335844,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 2
                                    },
                                    {
                                        "doorName": "A",
                                        "doorNumber": 1,
                                        "id": 1661442335845,
                                        "isChecked": false,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    },
                                    {
                                        "doorName": "B",
                                        "doorNumber": 2,
                                        "id": 1661442335846,
                                        "isChecked": true,
                                        "dateOfLastCall": 0,
                                        "level": 3
                                    }
                                ],
                                numberOfLevels: 3,
                                numberPerLevel: 3,
                                streetNumber: 2302
                            }
                        ],
                        coordsPoint1: {
                            lat: -34.6301890979069,
                            lng: -58.472934729029824
                        },
                        coordsPoint2: {
                            lat: -34.630629249302814,
                            lng: -58.47204987995917
                        },
                        coordsPoint3: {
                            lat: -34.631391833771744,
                            lng: -58.47236879216847
                        },
                        doNotCalls: [
                            {
                                creatorId: 1,
                                date: "2022-07-16",
                                doorBell: "P",
                                id: 1657998485660,
                                streetNumber: 1120,
                                deleted: false
                            }
                        ],
                        face: "D",
                        id: 1657828650330,
                        completionData: {
                            completionDates: [1669900846000],
                            isFinished: false,
                            reopeningDates: [1669900946000]
                        },
                        observations: [
                            {
                                creatorId: 1,
                                date: "2022-07-16",
                                id: 1657998465413,
                                text: "Observación corta",
                                deleted: false
                            },
                            {
                                creatorId: 1,
                                date: "2022-07-16",
                                id: 1657998506332,
                                text: "Observación larga: observación de prueba, observación de prueba, observación de prueba, observación de prueba, observación de prueba",
                                deleted: false
                            }
                        ],
                        street: "Helguera"
                    }
                ],
                zoom: 17.764626416998578
            },
            territoryNumber: '1'
        },
        isDisabled: false,
        localStatistics: [{
                numberOf_ADejarCarta: 1,
                numberOf_Contesto: 1000,
                numberOf_FreePhones: 3000,
                numberOf_NoAbonado: 500,
                numberOf_NoContesto: 800,
                numberOf_NoLlamar: 100,
                numberOfHouseholds: 5401,
                isFinished: false,
                stateOfTerritory: { isFinished: false, resetDates: [] },
                territoryNumber: '1'
            }],
        modifiedCount: 1,
        newPassword: "Abc123456",
        newToken: isAdmin ? tokenTestAdmin : tokenTestUser,
        recaptchaFails: false,
        streets: ["Concordia"],
        telephonicTerritory: {
            mapId: '1VKEvlr_MS6WpCp1gzwjmI7Uhl2mNO40f',
            households: [{
                    address: "Concordia 21 1 2",
                    block: "1",
                    callingState: "No predicado",
                    dateOfLastCall: 1661190010295,
                    notSubscribed: false,
                    householdId: 1,
                    isAssigned: false,
                    phoneNumber: "54-11-4613-0867",
                    doorBell: "1 2",
                    street: "Concordia",
                    streetNumber: 21
                },
                {
                    address: "Concordia 25 1 2",
                    block: "1",
                    callingState: 'No predicado',
                    dateOfLastCall: 1661190010295,
                    notSubscribed: true,
                    householdId: 2,
                    isAssigned: false,
                    phoneNumber: "54-11-4613-0868",
                    doorBell: "1 2",
                    street: "Concordia",
                    streetNumber: 25
                },
                {
                    address: "Concordia 29 4 2",
                    block: "1",
                    callingState: "No predicado",
                    dateOfLastCall: 1661190010295,
                    notSubscribed: false,
                    householdId: 3,
                    isAssigned: true,
                    phoneNumber: "54-11-4613-0869",
                    doorBell: "4 2",
                    street: "Concordia",
                    streetNumber: 29
                },
                {
                    address: "Concordia 29 4 3",
                    block: "1",
                    callingState: "Contestó",
                    dateOfLastCall: 1661190010295,
                    notSubscribed: false,
                    householdId: 4,
                    isAssigned: false,
                    phoneNumber: "54-11-4613-0870",
                    doorBell: "4 3",
                    street: "Concordia",
                    streetNumber: 29
                }],
            stateOfTerritory: {
                isFinished: false,
                resetDates: [
                    {
                        date: 1660695848008,
                        option: 1
                    },
                    {
                        date: 1660695853807,
                        option: 2
                    },
                    {
                        date: 1660695858327,
                        option: 4
                    }
                ]
            },
            territoryNumber: '1'
        },
        url: 'gmail@gmail.com',
        used: false,
        user: {
            email: userEmail,
            group: 1,
            hthAssignments: [1],
            id: 1,
            isActive: true,
            phoneAssignments: [1],
            recoveryOptions: [],
            role: isAdmin ? 1 : 0,
            tokenId: 1
        },
        userExists: true,
        users: [{
                email: userEmail,
                group: 1,
                hthAssignments: [1],
                id: 1,
                isActive: true,
                phoneAssignments: [1],
                recoveryOptions: [],
                role: isAdmin ? 1 : 0,
                tokenId: 1
            }],
        wrongPassword: false,
        forecast: {
            "cod": "200",
            "message": 0,
            "cnt": 40,
            "list": [
                {
                    "dt": 1661612400,
                    "main": {
                        "temp": 16.17,
                        "feels_like": 15.57,
                        "temp_min": 16.17,
                        "temp_max": 17.69,
                        "pressure": 1012,
                        "sea_level": 1012,
                        "grnd_level": 1011,
                        "humidity": 66,
                        "temp_kf": -1.52
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01d"
                        }
                    ],
                    "clouds": {
                        "all": 0
                    },
                    "wind": {
                        "speed": 6.02,
                        "deg": 208,
                        "gust": 9.02
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2022-08-27 15:00:00"
                },
                {
                    "dt": 1661623200,
                    "main": {
                        "temp": 16.46,
                        "feels_like": 15.7,
                        "temp_min": 16.46,
                        "temp_max": 17.04,
                        "pressure": 1013,
                        "sea_level": 1013,
                        "grnd_level": 1012,
                        "humidity": 59,
                        "temp_kf": -0.58
                    },
                    "weather": [
                        {
                            "id": 802,
                            "main": "Clouds",
                            "description": "scattered clouds",
                            "icon": "03d"
                        }
                    ],
                    "clouds": {
                        "all": 25
                    },
                    "wind": {
                        "speed": 6.88,
                        "deg": 206,
                        "gust": 9.94
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2022-08-27 18:00:00"
                },
                {
                    "dt": 1661634000,
                    "main": {
                        "temp": 15.11,
                        "feels_like": 14.06,
                        "temp_min": 14.58,
                        "temp_max": 15.11,
                        "pressure": 1017,
                        "sea_level": 1017,
                        "grnd_level": 1016,
                        "humidity": 53,
                        "temp_kf": 0.53
                    },
                    "weather": [
                        {
                            "id": 803,
                            "main": "Clouds",
                            "description": "broken clouds",
                            "icon": "04d"
                        }
                    ],
                    "clouds": {
                        "all": 67
                    },
                    "wind": {
                        "speed": 7.05,
                        "deg": 198,
                        "gust": 10.75
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2022-08-27 21:00:00"
                },
                {
                    "dt": 1661644800,
                    "main": {
                        "temp": 11.12,
                        "feels_like": 9.41,
                        "temp_min": 11.12,
                        "temp_max": 11.12,
                        "pressure": 1024,
                        "sea_level": 1024,
                        "grnd_level": 1021,
                        "humidity": 43,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 803,
                            "main": "Clouds",
                            "description": "broken clouds",
                            "icon": "04n"
                        }
                    ],
                    "clouds": {
                        "all": 82
                    },
                    "wind": {
                        "speed": 8.14,
                        "deg": 175,
                        "gust": 11.51
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2022-08-28 00:00:00"
                },
                {
                    "dt": 1661655600,
                    "main": {
                        "temp": 8.64,
                        "feels_like": 5.21,
                        "temp_min": 8.64,
                        "temp_max": 8.64,
                        "pressure": 1028,
                        "sea_level": 1028,
                        "grnd_level": 1024,
                        "humidity": 48,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01n"
                        }
                    ],
                    "clouds": {
                        "all": 0
                    },
                    "wind": {
                        "speed": 6.95,
                        "deg": 169,
                        "gust": 11.97
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2022-08-28 03:00:00"
                },
                {
                    "dt": 1661666400,
                    "main": {
                        "temp": 7.29,
                        "feels_like": 4.18,
                        "temp_min": 7.29,
                        "temp_max": 7.29,
                        "pressure": 1030,
                        "sea_level": 1030,
                        "grnd_level": 1026,
                        "humidity": 54,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01n"
                        }
                    ],
                    "clouds": {
                        "all": 0
                    },
                    "wind": {
                        "speed": 5.04,
                        "deg": 175,
                        "gust": 9.25
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2022-08-28 06:00:00"
                },
                {
                    "dt": 1661677200,
                    "main": {
                        "temp": 6.15,
                        "feels_like": 2.94,
                        "temp_min": 6.15,
                        "temp_max": 6.15,
                        "pressure": 1031,
                        "sea_level": 1031,
                        "grnd_level": 1028,
                        "humidity": 59,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01n"
                        }
                    ],
                    "clouds": {
                        "all": 0
                    },
                    "wind": {
                        "speed": 4.65,
                        "deg": 190,
                        "gust": 8.97
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2022-08-28 09:00:00"
                },
                {
                    "dt": 1661688000,
                    "main": {
                        "temp": 6.55,
                        "feels_like": 3.31,
                        "temp_min": 6.55,
                        "temp_max": 6.55,
                        "pressure": 1034,
                        "sea_level": 1034,
                        "grnd_level": 1031,
                        "humidity": 55,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01d"
                        }
                    ],
                    "clouds": {
                        "all": 0
                    },
                    "wind": {
                        "speed": 4.92,
                        "deg": 195,
                        "gust": 8.61
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2022-08-28 12:00:00"
                },
                {
                    "dt": 1661698800,
                    "main": {
                        "temp": 9.64,
                        "feels_like": 7.34,
                        "temp_min": 9.64,
                        "temp_max": 9.64,
                        "pressure": 1035,
                        "sea_level": 1035,
                        "grnd_level": 1032,
                        "humidity": 39,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01d"
                        }
                    ],
                    "clouds": {
                        "all": 1
                    },
                    "wind": {
                        "speed": 4.5,
                        "deg": 186,
                        "gust": 6.01
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2022-08-28 15:00:00"
                },
                {
                    "dt": 1661709600,
                    "main": {
                        "temp": 11.56,
                        "feels_like": 9.79,
                        "temp_min": 11.56,
                        "temp_max": 11.56,
                        "pressure": 1034,
                        "sea_level": 1034,
                        "grnd_level": 1030,
                        "humidity": 39,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01d"
                        }
                    ],
                    "clouds": {
                        "all": 1
                    },
                    "wind": {
                        "speed": 3.44,
                        "deg": 173,
                        "gust": 4.83
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2022-08-28 18:00:00"
                },
                {
                    "dt": 1661720400,
                    "main": {
                        "temp": 11.37,
                        "feels_like": 9.69,
                        "temp_min": 11.37,
                        "temp_max": 11.37,
                        "pressure": 1033,
                        "sea_level": 1033,
                        "grnd_level": 1030,
                        "humidity": 43,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01d"
                        }
                    ],
                    "clouds": {
                        "all": 0
                    },
                    "wind": {
                        "speed": 3.44,
                        "deg": 170,
                        "gust": 4.25
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2022-08-28 21:00:00"
                },
                {
                    "dt": 1661731200,
                    "main": {
                        "temp": 9.81,
                        "feels_like": 8.53,
                        "temp_min": 9.81,
                        "temp_max": 9.81,
                        "pressure": 1034,
                        "sea_level": 1034,
                        "grnd_level": 1031,
                        "humidity": 52,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01n"
                        }
                    ],
                    "clouds": {
                        "all": 0
                    },
                    "wind": {
                        "speed": 2.6,
                        "deg": 152,
                        "gust": 3.14
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2022-08-29 00:00:00"
                }
            ],
            "city": {
                "id": 3435910,
                "name": "Buenos Aires",
                "coord": {
                    "lat": -34.6132,
                    "lon": -58.3772
                },
                "country": "AR",
                "population": 0,
                "timezone": -10800,
                "sunrise": 1661595550,
                "sunset": 1661635881
            }
        },
        weather: {
            "coord": {
                "lon": -58.3772,
                "lat": -34.6132
            },
            "weather": [
                {
                    "id": 800,
                    "main": "Clear",
                    "description": "clear sky",
                    "icon": "01d"
                }
            ],
            "base": "stations",
            "main": {
                "temp": 16.33,
                "feels_like": 15.64,
                "temp_min": 14.94,
                "temp_max": 16.85,
                "pressure": 1012,
                "humidity": 62
            },
            "visibility": 10000,
            "wind": {
                "speed": 4.12,
                "deg": 210
            },
            "clouds": {
                "all": 0
            },
            "dt": 1661607848,
            "sys": {
                "type": 1,
                "id": 8224,
                "country": "AR",
                "sunrise": 1661595550,
                "sunset": 1661635881
            },
            "timezone": -10800,
            "id": 3435910,
            "name": "Buenos Aires",
            "cod": 200
        }
    };
};
exports.getMockedUserResponse = getMockedUserResponse;
