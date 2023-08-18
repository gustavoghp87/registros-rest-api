export type typeLogsPackage = {
    congregation: number
    logs: typeLogObj[]
    type: typeLogType
}

export type typeLogObj = {
    logText: string
    timestamp: number
}

export type typeAllLogsObj = {
    campaignLogs: typeLogsPackage
    errorLogs: typeLogsPackage
    houseToHouseAdminLogs: typeLogsPackage
    houseToHouseLogs: typeLogsPackage
    loginLogs: typeLogsPackage
    telephonicStateLogs: typeLogsPackage
    telephonicLogs: typeLogsPackage
    userLogs: typeLogsPackage
}

export type typeLogType =
    'CampaignLogs' |
    'ErrorLogs' |
    'HouseToHouseAdminLogs' |
    'HouseToHouseLogs' |
    'LoginLogs' |
    'TelephonicStateLogs' |
    'TelephonicLogs' |
    'UserLogs'
;
