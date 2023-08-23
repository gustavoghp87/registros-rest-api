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
    configLogs: typeLogsPackage
    errorLogs: typeLogsPackage
    houseToHouseAdminLogs: typeLogsPackage
    houseToHouseLogs: typeLogsPackage
    loginLogs: typeLogsPackage
    telephonicLogs: typeLogsPackage
    telephonicStateLogs: typeLogsPackage
    userLogs: typeLogsPackage
}

export type typeLogType =
    'CampaignLogs' |
    'ConfigLogs' |
    'ErrorLogs' |
    'HouseToHouseAdminLogs' |
    'HouseToHouseLogs' |
    'LoginLogs' |
    'TelephonicLogs' |
    'TelephonicStateLogs' |
    'UserLogs'
;
