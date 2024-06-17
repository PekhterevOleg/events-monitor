import express from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

import path from 'path';

import {getLDAPObj} from "./fldap.js";
import * as moduleDB from "./database.js";
import {ldapConfig, HBStatus} from "./config.js";
import {getObjFromDB} from "./database.js";
import {getCurrentFileAndDir, getSSLOptions, getShiftedDate, shutdown} from "./utils.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

async function main() {

    const db = moduleDB.createOrReturnDBLdapObj();
    const __dirname = getCurrentFileAndDir().__dirname;

    if (await moduleDB.isEmptyDB(db)) {
        const ldapObjs = await getLDAPObj(ldapConfig);
        try {
            await moduleDB.writeLDAPObjToDB(db, ldapObjs);
        } catch (err) {
            console.error(err.message);
            process.exit(1);
        }
    }

    app.post('/data', async (req, res) => {
        let {serverName, timestamp} = req.body;
        const query = {};
        serverName = serverName.toLocaleUpperCase();
        query.cn = serverName;
        console.log(`Получен hearbeat от ${serverName}: ${timestamp}`);

        const update = {
            $set: {
                timestamp: new Date(timestamp),
                heartbeat: HBStatus.ACTIVE
            },
            $unset: {send: true} //удаляем поле из объекта neDB если имеются
        };

        await moduleDB.updateObjToDB(db, query, update);
        const objFromDb = await moduleDB.getObjFromDB(db, query);
        console.log(`Отправка объектов всем подключенным клиентов: ${objFromDb}`);
        broadcastData(objFromDb);
        res.sendStatus(200);
    });

    app.post("/telegram", async (req, res) => {
        let { serverName, type, status } = req.body;
        serverName = serverName.toUpperCase();
        const name = serverName;
        const query = {cn: serverName};
        const [{ _id }] = await moduleDB.getObjFromDB(db, query);

        broadcastData([{name, serverName, type, status, _id}]);
        res.sendStatus(200);
    })

    app.get('/status', (req, res) => {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log(`Client requested /status: ${clientIp}`);
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const options = getSSLOptions(__dirname);
    const server = https.createServer(options, app);
    const wss = new WebSocketServer({server});

    wss.on('connection', async (ws, req) => {
        const ldapObj = await moduleDB.getObjFromDB(db);
        ws.send(JSON.stringify(ldapObj));
    });

    function broadcastData(data) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    setInterval(async () => {
        const expMin = 5 * 60 * 1000;
        const expDate = getShiftedDate(expMin);

        console.log(`Выполнятеся callback таймера обнаружения устаревших объектов < ${expMin} milliseconds`);

        let query = {
            timestamp: {$ne: null, $lte: expDate},
            send: {$exists: false}
        };
        const findObjExp = await moduleDB.getObjFromDB(db, query);
        if (findObjExp.length) {
            const srvNames = findObjExp.map(obj => obj.name);
            console.log(`Найдены устаревшие объекты: ${srvNames}`);
            await moduleDB.updateObjToDB(db, query, {$set: {heartbeat: HBStatus.INACTIVE}});
            broadcastData(await getObjFromDB(db, {name: {$in: srvNames}}));
            await moduleDB.updateObjToDB(db, {name: {$in: srvNames}}, {$set: {send: true}})
        }
    }, 5 * 60 * 1000)


    server.listen(PORT, '0.0.0.0', () => {
        console.log(`[${new Date()}] Server is running on http://0.0.0.0:${PORT}`);
    });

    process.on('SIGTERM', () => shutdown(server, db));
    process.on('SIGINT', () => shutdown(server, db));
}

main();