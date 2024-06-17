const ws = new WebSocket(`wss://${location.host}`);
const expiredObject = {};
const offlineServers = [];
const offlineTelegram = {};

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

/**
 * @typedef {Object} TelergamObj
 * @property {string} type
 * @property {string} status
 * @property {string} _id
 */

ws.addEventListener('message', (e) => {
    /**
     * @type {Server[]|TelergamObj[]}
     */
    const serverObjs = JSON.parse(e.data);
    watcherInactiveServer();

    serverObjs.forEach(server => {
        if (server.type === 'telegramData') {
            const allDivs = searchAllDivs(server.name);
            /**
             * @type {HTMLDivElement}
             */
            let telegramCircle = allDivs.at(-1);
            if (server.status === 'Online') {
                if (!telegramCircle.classList.contains('circle-active')) {
                    removeClassOnElement(telegramCircle);
                    telegramCircle.classList.add('circle-telegram');
                    telegramCircle.classList.add('circle-active');
                }
                if (offlineTelegram[server._id]) {
                    clearInterval(offlineTelegram[server._id]);
                    delete offlineTelegram[server._id];
                }
            }
            else if (server.status === 'Offline') {
                if (!offlineTelegram[server._id]) {
                    flickerDivTelegram(telegramCircle, server);
                    removeClassOnElement(telegramCircle);
                    telegramCircle.classList.add('circle-telegram');
                    telegramCircle.classList.add('circle-error');
                }
            }
            return;
        }

        const allDivs = searchAllDivs(server.name) || addElements(server);
        if (!allDivs) {
            console.log(`Для данного ${server.name} нет доступного контейнера для создания уведомления`);
            return;
        }
        addClassElements(allDivs, server.heartbeat, server.name);
        updateTextEl(allDivs, server);

        if (server.heartbeat === HBStatus.INACTIVE && !expiredObject[server._id]) {
            console.log(`Обнаружен устаревший объект: ${server.name}`);
            clearInterval(offlineTelegram[server._id]);
            delete offlineTelegram[server._id];
            flickerDivs(allDivs, server);
            const offlineTimerToStr = getOfflineTimer(server.timestamp);
            updateOfflineTextOnDiv(server.name, offlineTimerToStr);
            offlineServers.push(server);
        } else if (expiredObject[server._id]) {
            clearInterval(expiredObject[server._id]);
            updateOfflineTextOnDiv(server.name, 'Missing');
            delete expiredObject[server._id];

            let telegramCircle = allDivs.at(-1);
            telegramCircle.classList.remove('circle-error');
            telegramCircle.classList.remove('circle-error-lighter');
            telegramCircle.classList.add('circle-inactive');

            let idxDeleteServer = offlineServers.findIndex(serverOffline => serverOffline.name === server.name);
            offlineServers.splice(idxDeleteServer,1);
        }
    })
})