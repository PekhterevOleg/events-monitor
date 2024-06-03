// import Datastore from 'nedb';
// import { join } from 'path';

// const db = new Datastore({ filename: join(process.cwd(), 'LdapObjDB.db'), autoload: true });


const ldapConfig = {
    url: 'ldap://achimgaz.local',
    ou: 'DC=Achimgaz,DC=local',
    // ou: 'OU=CentrOffice,OU=Servers,OU=Achimgaz,DC=Achimgaz,DC=local',
    cred: {
        login: 'o.pekhterev@achimgaz.ru',
        password: 'p9s7y1SW@#$%'
    },
    opts: {
        filter: '(&(objectClass=computer)(operatingSystem=Windows Server 2016*)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))',
        scope: 'sub',
        attributes: ['name', 'objectGUID', 'operatingSystem', 'cn']
    }
}

export { ldapConfig };