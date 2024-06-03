import ldap, { Client } from 'ldapjs';
import {ldapConfig} from "./config.js";


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
 * @param {Client} client
 * @param {LdapConfig} settings
 * @returns {Promise<LDAPObject[]>}
 */
async function searchObj(client, settings) {

    return new Promise((resolve, reject) => {
        client.search(settings.ou, settings.opts, (err, res) => {
            if (err) {
                reject(err);
            }
            function convertObjectGUID(buffer) {
                const hex = buffer.toString('hex');
                const guid = [
                    hex.slice(6, 8), hex.slice(4, 6), hex.slice(2, 4), hex.slice(0, 2),
                    hex.slice(10, 12), hex.slice(8, 10),
                    hex.slice(14, 16), hex.slice(12, 14),
                    hex.slice(16, 18), hex.slice(18, 20),
                    hex.slice(20, 32)
                ].join('');
                return [
                    guid.slice(0, 8),
                    guid.slice(8, 12),
                    guid.slice(12, 16),
                    guid.slice(16, 20),
                    guid.slice(20, 32)
                ].join('-');
            }
            let searchObj = [];

            res.on('searchEntry', (entry) => {
                const attributes = entry.attributes;
                let obj = {};

                attributes.forEach(attr => {
                    let attrName = attr.type;
                    let value = attr.values[0];
                    if (attrName === 'objectGUID') {
                        value = convertObjectGUID(attr.buffers[0]);
                    }

                    obj = {...obj, ...{[attrName]: value}};
                })
                obj.timestamp = null;
                obj.heartbeat = null;
                searchObj.push(obj);
            })

            res.on('end', () => {
                client.unbind( err => reject(err) );
                resolve(searchObj);
            })
        })
    })
}

/**
 * @typedef {Object} Options
 * @property {string} filter
 * @property {string} scope
 * @property {string[]} attributes
 */

/**
 * @typedef {Object} Cred
 * @property {string} login
 * @property {string} password
 */

/**
 * @typedef {ldapConfig} LdapConfig
 * @property {string} url
 * @property {string} ou
 * @property {Cred} cred
 * @property {Options} opts
 */

/**
 *
 * @param {Client} client
 * @param {LdapConfig} settings
 * @returns {Promise<unknown>}
 */
function bindLdap(client, settings) {
    return new Promise((resolve, reject) => {
        /**
         * @method
         * @name bind
         * @memberOf Client
         * @param {string} login
         * @param {string} password
         * @param {function(Error):void} callback
         */
        client.bind(settings.cred.login, settings.cred.password, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        })
    })
}

/**
 * @param {string} url
 * @returns {Promise<Client>}
 */
function createLdapClient(url) {
    return new Promise((resolve, reject) => {
        /**
         * @type {Client}
         */
        const client = ldap.createClient({url: [url]});
        client.on('connectError', (err) => {
            reject(err);
        });

        client.on('error', (err) => {
            reject(err);
        })

        client.on('connect', () => {
            resolve(client);
        });
    })
}

/**
 *
 * @param {LdapConfig} settings
 * @returns {Promise<LDAPObject[]>}
 */
async function getLDAPObj(settings) {
    const client = await createLdapClient(settings.url);
    try {
        await bindLdap(client, ldapConfig);
    } catch (err) {
        console.error('Ошибка выполнения метода bind LDAP', err.message);
    }
    try {
        return await searchObj(client, settings);
    } catch (err) {
        console.error('Ошибка выполнения поиска объектов LDAP', err.message);
        process.exit(1);
    }
}

// getLDAPObj(ldapConfig).then(res => { console.log(res) });


export { getLDAPObj };
















