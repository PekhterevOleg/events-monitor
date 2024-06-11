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
    let key;
    let cert;

    try {
        key = fs.readFileSync(path.join(dirName, 'certs', 'svcmon.key'));
        cert = fs.readFileSync(path.join(dirName, 'certs', 'svcmon.crt'));

    } catch (err) {
        console.error(`Ошибка чтения файлов SSL сертификатов: ${err.message}`);
        process.exit(1);
    }
    return { key, cert };
}

/**
 * @typedef {import('https').Server} HttpsServer
 */

/**
 * @typedef {import('nedb').Datastore} Datastore
 */

/**
 *
 * @param {HttpsServer} server
 * @param {Datastore} db
 */
function shutdown(server, db) {
    console.log('Получен сигнал на завершение работы приложения');
    server.close((err) => {
        if (err) {
            console.error(`Ошибка завершения работы сервера: ${err.message}`);
            process.exit(1);
        }
        console.log('Сервер успешно завершил работу');
        db.persistence.compactDatafile();
        console.log(`Быза данных NeDB сохранена в ${db.filename}`);
        process.exit(0);
    })
}

export {
    getShiftedDate,
    getCurrentFileAndDir,
    getSSLOptions,
    shutdown
};