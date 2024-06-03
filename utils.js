/**
 * @type {Number} milliseconds
 * @returns {Date}
 */
function getShiftedDate(milliseconds) {
    const dateNow = new Date();
    const localTimeInMillis = dateNow.getTime() - dateNow.getTimezoneOffset() * 60000;

    return new Date(
        ( localTimeInMillis-milliseconds )
    );
}

export { getShiftedDate };