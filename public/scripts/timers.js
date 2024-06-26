/**
 *
 * @param {HTMLDivElement[]} divs
 * @param srvObj
 */
function flickerDivs(divs, srvObj) {
    expiredObject[srvObj._id] = setInterval(() => {
        divs.forEach(div => {
            div.classList.contains('circle') || div.classList.contains('circle-telegram')
                ? div.classList.toggle('circle-error-lighter')
                : div.classList.toggle('color-error-lighter')
        })
    }, 1000);
}

function watcherInactiveServer() {
    setInterval(() => {
        offlineServers.forEach(server => {
            const offlineTimerText = getOfflineTimer(server.timestamp);
            updateOfflineTextOnDiv(server.name, offlineTimerText);
        })
    }, 5 * 60 * 1000)
}

function flickerDivTelegram(div, srvObj) {
    offlineTelegram[srvObj._id] = setInterval(() => {
        div.classList.toggle('circle-error-lighter');
    }, 1000)
}
