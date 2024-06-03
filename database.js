import { ldapConfig } from './config.js';
import { getLDAPObj } from "./fldap.js";
import Datastore from 'nedb';
import { join } from "path";
import {format} from "date-fns";

/**
 * @typedef {Object} LDAPObject
 * @property {string} cn
 * @property {string} name
 * @property {string} objectGUID
 * @property {Date|undefined} timestamp
 * @property {Boolean|undefined} heartbeat
 */

/**
 *
 * @param {Datastore} db
 * @param {LDAPObject[]} ldapObjs
 * @returns {Promise<void>}
 */
async function writeLDAPObjToDB(db, ldapObjs) {
    return new Promise((resolve, reject) => {
        db.insert(ldapObjs, (err, docs) => {
            if (err) {
                reject(err);
            }
            else if (docs.length !== ldapObjs.length) {
                reject(new Error('Длины массивов объектов для записи и записанных документов не совпадают'));
            }
            resolve();
        })
    })
}

/**
 *
 * @param {Datastore} db
 * @param {Object} [query={}]
 * @returns {Promise<Boolean>}
 */
function isEmptyDB(db, query={}) {
    return new Promise((resolve, reject) => {
        db.find(query, (err, docs) => {
            err? reject(err): resolve(!docs.length);
        })
    })
}

/**
 *
 * @param {string} nameDB
 * @returns {Datastore}
 */
function createOrReturnDBLdapObj(nameDB='LdapObjDB.db') {

    /**
     * @type {Object}
     * @property {string} filename
     * @property {boolean} autoload
     */
    const options = {
        filename: join(process.cwd(), nameDB),
        autoload: true
    };

    return new Datastore(options);
}

/**
 *
 * @param {Datastore} db
 * @param {Object} query
 * @returns {Promise<Object[]>}
 */
function getObjFromDB(db, query={}) {
    return new Promise((resolve, reject) => {
        db.find(query, (err, docs) => {
           err? reject(err): resolve(docs);
        })
    })
}

/**
 *
 * @param {Datastore} db
 * @param {Object} query
 * @param {Object} update
 * @returns {Promise<void>}
 */
function updateObjToDB(db, query, update) {
    return new Promise((resolve, reject) => {
        db.update(query, update, {multi: false}, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
            // getObjFromDB(db, query)
            //     .then(docs => resolve(docs))
            //     .catch(err => reject(err));
        })
    })
}

export {
    isEmptyDB,
    getObjFromDB,
    writeLDAPObjToDB,
    createOrReturnDBLdapObj,
    updateObjToDB
};

async function testingGetObjDB(query) {
    const db = createOrReturnDBLdapObj();
    return await getObjFromDB(db, query);
}

async function testingUpdateDBObj() {
    const db = createOrReturnDBLdapObj();
    const query = {cn: 'srv-co-vdb01'};
    const date = new Date();
    const expDate = new Date((date.getTime() - date.getTimezoneOffset() * 60000)-5*60*1000);
    const update = {$set: {timestamp: expDate}};
    return await updateAndReturnObjToDB(db, query, update)
}

async function testingReturnDBLdapObj() {
    const db = createOrReturnDBLdapObj();

    if (await isEmptyDB(db)) {
        const ldpObj = await getLDAPObj(ldapConfig);
        try {
            await writeLDAPObjToDB(db, ldpObj);
        } catch (err) {
            console.error(err.message);
            process.exit(1);
        }
    }

    return await getObjFromDB(db);
}

// testingGetObjDB({_id: '1w2BJonCxLEAKY1Z'}).then(docs => {console.log(docs)})

// const date = new Date();
// const localD = new Date((date.getTime() - date.getTimezoneOffset() * 60000)-5*60*1000);
//
// testingGetObjDB({timestamp: {$ne: null, $lte: localD}}).then(docs => {console.log(docs)})

// testingGetObjDB({timestamp: {$ne: null}}).then(docs => {
//     console.log(docs)
// })

// testingUpdateDBObj().then(docs => {
//     console.log(docs);
// });

// testingReturnDBLdapObj();


// const db = createOrReturnDBLdapObj();
// const query = {name: 'SRV-CO-VVEEAM03', timestamp: null};
// const update = {timestamp: new Date()}
// updateAndReturnObjToDB(db, query, update).then(docs => console.log(docs));
//
// testingGetObjDB({name: 'srv-co-vadfs01', timestamp: null}).then(docs => console.log(docs))