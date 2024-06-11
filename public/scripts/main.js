const ws = new WebSocket(`wss://${location.host}`);
const expiredObject = {};
const offlineServers = [];

const HBStatus = {
    UNDEFINED: 'undefined',
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

/**
 * @typedef {Object} Server
 * @property {string} cn
 * @property {string} name
 * @property {string} objectGUID
 * @property {string} operatingSystem
 * @property {Date|null} timestamp
 * @property {boolean|null} heartbeat
 * @property {string} _id
 */

ws.addEventListener('message', (e) => {
    /**
     * @type {Server[]}
     */
    const serverObjs = JSON.parse(e.data);
    watcherInactiveServer();

    serverObjs.forEach(server => {
        const allDivs = searchAllDivs(server.name) || addElements(server);
        if (!allDivs) {
            console.log(`Для данного ${server.name} нет доступного контейнера для создания уведомления`);
            return;
        }
        addClassElements(allDivs, server.heartbeat, server.name);
        updateTextEl(allDivs, server);

        if (server.heartbeat === HBStatus.INACTIVE && !expiredObject[server._id]) {
            console.log(`Обнаружен устаревший объект: ${server.name}`);
            flickerDivs(allDivs, server);
            const offlineTimerToStr = getOfflineTimer(server.timestamp);
            updateOfflineTextOnDiv(server.name, offlineTimerToStr);
            offlineServers.push(server);
        } else if (expiredObject[server._id]) {
            clearInterval(expiredObject[server._id]);
            delete expiredObject[server._id];
            delete offlineServers.find(serverOffline => server.name === serverOffline.name);
        }
    })
})