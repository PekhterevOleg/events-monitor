import {fileURLToPath} from "url";
import path from "path";
import fs from "fs";

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

/**
 *
 * @returns {{__dirname: string, __filename: string}}
 */
function getCurrentFileAndDir() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    return { __filename, __dirname };
}

/**
 *
 * @param {string} dirName
 * @returns {{cert: Buffer, key: Buffer}}
 */
function getSSLOptions(dirName) {
    const key = fs.readFileSync(path.join(dirName, 'certs', 'svcmon.key'));
    const cert = fs.readFileSync(path.join(dirName, 'certs', 'svcmon.crt'));

    return { key, cert };
}

export {
    getShiftedDate,
    getCurrentFileAndDir,
    getSSLOptions
};