import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import https from 'https';
import fs from 'fs';

import cors from 'cors';


import path from 'path';
import {format} from "date-fns";

import {getLDAPObj} from "./fldap.js";
import * as moduleDB from "./database.js";
import {ldapConfig} from "./config.js";
import {getObjFromDB} from "./database.js";
// import {getObjFromDB, updateAndReturnObjToDB} from "./database.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

async function main() {

    const db = moduleDB.createOrReturnDBLdapObj();

    if (await moduleDB.isEmptyDB(db)) {
        const ldapObj = await getLDAPObj(ldapConfig);
        try {
            await moduleDB.writeLDAPObjToDB(db, ldapObj);
        } catch (err) {
            console.error(err.message);
            process.exit(1);
        }
    }

    let i = 0;
    app.post('/data', async (req, res) => {
        const { serverName, timestamp } = req.body;

        // console.log(`[${++i}] - {serverName:${serverName}, timestamp:${timestamp}}`);

        const query = {cn: serverName};
        const update = {
            $set: {
                timestamp: new Date(timestamp),
                heartbeat: true
            },
            $unset: {send: true}
        };
        await moduleDB.updateObjToDB(db, query, update);
        const objFromDb = await moduleDB.getObjFromDB(db, query);
        // console.log(objFromDb);
        broadcastData(objFromDb);
        res.sendStatus(200);
    });

    app.get('/status', (req, res) => {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log(`Client IP: ${clientIp}`);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });


    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const options = {
        key: fs.readFileSync(path.join(__dirname, 'certs', 'svcmon.key')),
        cert: fs.readFileSync(path.join(__dirname, 'certs', 'svcmon.crt'))
    };

    const server = https.createServer(options, app);
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (ws, req) => {
        const ldapObj = await moduleDB.getObjFromDB(db);
        ws.send(JSON.stringify(ldapObj));
    });

    function broadcastData(ldapObj) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(ldapObj));
            }
        });
    }

    setInterval(async () => {
        const date = new Date();
        const expMin = 2 * 60 * 1000;

        const expDate = new Date((date.getTime() - date.getTimezoneOffset() * 60000)-expMin);

        let query = {
            timestamp: {$ne: null, $lte: expDate},
            send: {$exists: false}
        };
        const findObjExp = await moduleDB.getObjFromDB(db, query);
        console.log(`Enter setInterval, findObjExp.length: ${findObjExp.length}`);
        if (findObjExp.length) {
            const srvNames = findObjExp.map(obj => obj.name);
            await moduleDB.updateObjToDB(db, query, {$set: {heartbeat: false}});
            // let o = await getObjFromDB(db, {name: {$in: srvNames}});
            broadcastData(await getObjFromDB(db,
                {name: {$in: srvNames}}
            ));
            await moduleDB.updateObjToDB(db, {name: {$in: srvNames}}, {$set: {send: true}})
        }
    }, 2 * 60 * 1000)


    server.listen(PORT, () => {
        console.log(`[${new Date()}] Server is running on http://localhost:${PORT}`);
    });
}

main();