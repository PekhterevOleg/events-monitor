import Datastore from 'nedb';
import { join } from "path";

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
 * @param {string} [nameDB='LdapObjDB.db']
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