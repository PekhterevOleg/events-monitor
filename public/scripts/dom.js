/**
 * @param {Server} server
 * @returns {HTMLDivElement[]}
 */
function addElements(server) {
    const elements = [];

    const heartbeatTimestamp = server.timestamp? shortTimestamp(server.timestamp): 'Inactive';
    let hbStatus = 'Online'
    if (server.heartbeat !== HBStatus.ACTIVE) {
        hbStatus = 'Offline'
    }

    const elementsText = {
        0: server.name,
        1: heartbeatTimestamp,
        2: hbStatus,
        3: 'Missing'
    }

    const gen = containerGen.next();

    if (!gen.done) {
        const container = gen.value;
        const divCircle = createCircleDiv();
        divCircle.classList.add('circle');
        container.append(divCircle);
        elements.push(divCircle);

        for (let i = 0; i < 4; i++) {
            let div = document.createElement('div');
            div.textContent = elementsText[i];
            container.append(div);
            elements.push(div);
        }
        const divCircleTelegram = createCircleDiv();
        divCircleTelegram.classList.add('circle-telegram');
        divCircleTelegram.classList.add('circle-inactive');
        container.append(divCircleTelegram);
        elements.push(divCircleTelegram);
    }
    return elements.length? elements: null;
}

/**
 * @returns {HTMLDivElement}
 */
function createCircleDiv() {
    const circleEl = document.createElement('div');
    const subDivCircle = document.createElement('div');
    circleEl.append(subDivCircle);
    return circleEl;

}

/**
 *
 * @param {HTMLDivElement[]} elms
 * @param {boolean|null} heartbeat
 * @param {String} serverName
 * @returns {void}
 */
function addClassElements(elms, heartbeat, serverName) {
    const attr = {
        name: 'server-name',
        value: serverName
    };

    const circleActive = `circle circle-active`;
    const circleInActive = `circle circle-inactive`;
    const circleError = `circle circle-error`;
    const circleTelegramError = `circle-telegram circle-error`;

    const divActive = `item grid-sub-item color-active`;
    const divInActive = `item grid-sub-item color-inactive`;
    const divError = `item grid-sub-item color-error`;

    elms.forEach(divEl => {
        divEl.setAttribute(attr.name, attr.value);

        switch (heartbeat) {
            case HBStatus.UNDEFINED:
                if (isCircle(divEl)) {
                    removeClassOnElement(divEl);
                    applyClassOnElement(divEl, circleInActive);
                }
                else if (isCircleTelegram(divEl)) {
                    return;
                } else {
                    removeClassOnElement(divEl);
                    applyClassOnElement(divEl, divInActive);
                }
                break;
            case HBStatus.ACTIVE:
                if (isCircle(divEl)) {
                    removeClassOnElement(divEl);
                    applyClassOnElement(divEl, circleActive);
                }
                else if (isCircleTelegram(divEl)) {
                    return;
                }
                else {
                    removeClassOnElement(divEl);
                    applyClassOnElement(divEl, divActive);
                }
                break;
            case HBStatus.INACTIVE:
                if (isCircle(divEl)) {
                    removeClassOnElement(divEl);
                    applyClassOnElement(divEl,circleError);
                }
                else if (isCircleTelegram(divEl)) {
                    removeClassOnElement(divEl);
                    applyClassOnElement(divEl,circleTelegramError);
                }
                else {
                    removeClassOnElement(divEl);
                    applyClassOnElement(divEl, divError);
                }
                break;
        }
    })
}

/**
 * @param {HTMLDivElement} el
 * @param {string} strClass
 * @returns {void}
 */
function applyClassOnElement(el, strClass) {
    const classes = strClass.split(' ');
    el.classList.add(...classes);
}


/**
 *
 * @param {HTMLDivElement} el
 * @returns {Boolean}
 */
function isCircleTelegram(el) {
    return el.classList.contains('circle-telegram');
}


/**
 *
 * @param {HTMLDivElement} el
 * @returns {Boolean}
 */
function isCircle(el) {
    return el.classList.contains('circle');
}

/**
 * @param {HTMLDivElement} el
 * @returns {void}
 */
function removeClassOnElement(el) {
    Array.from(el.classList).forEach(cls => {el.classList.remove(cls)});
}

/**
 * @param {string} serverName
 * @returns {HTMLDivElement[]|null}
 */
function searchAllDivs(serverName) {
    const query = `[server-name="${serverName}"]`;
    const elms = document.querySelectorAll(query);
    return elms.length
        ? Array
            .from(elms)
            .map(element =>
                /** @type {HTMLDivElement} */
                (element)
            )
        : null
}

/**
 *
 * @param {Date} timestamp
 * @returns {string}
 */
function shortTimestamp(timestamp) {
    console.log(`func shortTimestamp value: ${timestamp}`)
    const dateStr = timestamp.toLocaleString();
    return dateStr.replace('T', ' ').slice(0,19);
}

/**
 *
 * @param {HTMLDivElement[]} elms
 * @param {Server} server
 */
function updateTextEl(elms, server) {
    const timestamp = server.timestamp? shortTimestamp(server.timestamp): 'Inactive';
    let hbStatus = 'Online';

    if (server.heartbeat !== HBStatus.ACTIVE) {
        hbStatus = 'Offline';
    }

    const elementsText = {
        1: server.name,
        2: timestamp,
        3: hbStatus,
        4: 'Missing'
    }

    elms.forEach((div, i) => {
        if (div.classList.contains('item')) {
            div.textContent = elementsText[i];
        }
    })
}

/**
 * @param {Date} timestamp
 * @returns {String}
 */
function getOfflineTimer(timestamp) {
    const milliseconds = _getTimeDifferenceInMilliseconds(timestamp);
    return _convertMillisecondsInOfflineTimer(milliseconds);

    /**
     * @param date
     * @returns {number}
     */
    function _getTimeDifferenceInMilliseconds(date) {
        const dateNow = new Date();
        date = new Date(date);
        const expLocalDate = new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        );

        return dateNow - expLocalDate;
    }

    /**
     * @param milliseconds
     * @returns {String}
     */
    function _convertMillisecondsInOfflineTimer(milliseconds) {
        const oneDay = 24 * 60 * 60* 1000;
        const oneHour = 60 * 60 * 1000;
        const oneMinute = 60 * 1000;

        let days = (Math.floor(milliseconds / oneDay)).toString();
        let hours = (Math.floor(milliseconds % oneDay / oneHour)).toString();
        let minutes = (Math.floor(milliseconds % oneHour / oneMinute)).toString();

        days = days.length < 2? '0' + days: days;
        hours = hours.length < 2? '0' + hours: hours;
        minutes = minutes.length < 2? '0' + minutes: minutes;

        return `${days}:${hours}:${minutes}`;
    }
}

/**
 * @param {String} serverName
 * @param {String} text
 * @returns {void}
 */
function updateOfflineTextOnDiv(serverName, text) {
    const allDivs = searchAllDivs(serverName);
    Array.from(allDivs).at(-2).textContent = text;
}