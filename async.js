import {format} from "date-fns";

const date = format(new Date(Date.now() - 5 * 60 * 1000), 'yyyy-MM-dd hh:mm:ss');
console.log(new Date(date + 'Z'))
// console.log(
//     format(new Date(), 'yyyy-MM-dd hh:mm:ss')
// )

//

// async function test() {
//     return 1;
// }
//
// test().then(res => {
//     console.log(res)
// })

// let obj = {}
//
// let user = {
//     name: 'john'
// }
//
// let user2 = {
//     cn: 'mike'
// }
//
// obj = {...user};
// obj = {...obj, ...user2};
//
// console.log(obj)




// import { db } from "./config.js";
// import { format } from 'date-fns';
//
// let f = "yyyy-MM-dd'T'HH:mm:ss";
// let num = 35 * 60 * 1000;
// console.log(new Date(format(new Date() - num, f) + 'Z'));
//
// let obj = {
//     srvName: 'a-12-004',
//     cn: 'a-12-004',
//     timestamp: new Date('2024-05-21 11:00Z')
// }
//
// db.remove({}, {multi:true}, (err) => {
//     if (err) {
//         console.error(err.message);
//     }
// })
//
// db.insert(obj, (err) => {
//     if (err) {
//         console.error(err.message);
//     }
// })
//
// let date = new Date(new Date(new Date(Date.now()).toLocaleString('sv-SE') + 'Z') - 5 * 60 * 1000);
// db.find({timestamp: {$lte: date }},(err, docs) => {
//     console.log(docs)
// })




// const comp = [{
//     srvName: 'a-12-004',
//     cn: 'a-12-004',
//     timestamp: new Date(),
//     objectGUID: '32534653463',
//     operatingSystem: 'Windws server 2016'
// }]
//
// let new_obj = {};
//
// comp.forEach(obj => {
//     let srvName = obj.srvName;
//     new_obj[srvName] = {};
//     Object.keys(obj).forEach(key => {
//         if (key !== 'srvName') {
//             new_obj[srvName][key] = obj[key];
//         }
//     })
// })

// let z = comp.map(obj => {
//     let srvName = obj.srvName;
//     let _obj = {};
//     _obj[srvName] = obj
//     return _obj
// })



// function test() {
//    return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             console.log('Внутри TimeOut')
//             reject(new Error('Pizdec'));
//         }, 2000)
//     })
// }
//
// async function test1() {
//     try {
//         await test();
//         console.log('Внешняя функция выполнена')
//     } catch (err) {
//         console.error(err.message);
//     }
// }
//
// test1()





// import Datastore from 'nedb';
// import { join } from 'path';
//
// const db = new Datastore({ filename: join(process.cwd(), 'datafile.db'), autoload: true });
//
// const obj = {
//     'a-12-004': {
//         cn: 'a-12-004',
//         guid: '1232423523',
//         timestamp: new Date(),
//         params: ['par1', 'par2', 4, 56],
//         users: {
//             name: 'john',
//             age: 42
//         }
//     },
//     'a-56-024': {
//         cn: 'a-56-024',
//         guid: 'sfs4543534',
//         timestamp: new Date(),
//         params: ['Zim1', 'Zim43', 4, 56],
//         users: {
//             name: 'Mikle',
//             age: 56
//         }
//     }
// }
//
// const newObj = Object.keys(obj).map(key => ({
//     key,
//     ...obj[key]
// }));
//
// db.remove({}, {multi: true});
//
// db.insert(newObj, (err) => {
//     if (err) {
//         console.log(err);
//     }
// })
//
//
// db.find({'params': 'Zim43'}, (err, docs) => {
//     console.log(docs);
// })

// db.find({'users.age': { $gt: 45 }}, (err, docs) => {
//     console.log(docs);
// })



// db.find({}, (err, doc) => {
//     console.log(doc);
// })







// const newObj = Object.keys(obj).map(key => ({
//     key,
//     ...obj[key]
// }));
//
// db.remove({}, {multi: true}, (err) => {
//     if (err) {
//         console.log(err)
//     }
// });
//
// db.insert(newObj, err => {
//     if (err) {
//         console.log(err);
//     }
// });
//
// db.find({}, (err, docs) => console.log(docs));
//
// db.remove({}, {multi: true}, (err) => {
//     if (err) {
//         console.log(err)
//     }
// });

// // Очистка базы данных
// db.remove({}, { multi: true }, (err, numRemoved) => {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log('Database cleared, number of documents removed:', numRemoved);
//
//         // Добавление данных в базу данных
//         db.insert(dataToInsert, (err, newDocs) => {
//             if (err) {
//                 console.error(err);
//             } else {
//                 console.log('Inserted:', newDocs);
//
//                 // Получение данных из базы данных
//                 db.find({ key: 'a-12-004' }, (err, docs) => {
//                     if (err) {
//                         console.error(err);
//                     } else {
//                         console.log('Found:', docs);
//                     }
//                 });
//             }
//         });
//     }
// });


// db.remove({}, { multi:true });
//
// db.insert({key: 'a-12-004', ...obj['a-12-004']}, (err, newDoc) => {
//     if (err) {
//         throw new Error('Error add document');
//     }
//
//     // console.log(newDoc);
// })
//
//
// db.find({key: 'a-12-004'}, (err, docs) => {
//     console.log(docs);
// })








// const classSets = {
//     commonCssCls: {
//         circle: 'circle',
//         item: 'item',
//         'serv-attr': 'server-name'
//     },
//     active: {
//         circle: 'circle-active',
//         color: 'color-active',
//     },
//     inactive: {
//         circle: 'circle-inactive',
//         color: 'color-inactive',
//     }
// }
// let obj = classSets['active'];
// obj['commonCssCls'] = classSets.commonCssCls;
// console.log(obj)



// let z = [1, 2, 3, 4, 5];
//
// let c = [1, 2, 3];
//
//
// let a = z.filter(item => {
//     if (!c.includes(item)) {
//         return item;
//     }
// })
//
// console.log(a);

// if (freshLdapObjKeys.length > oldLdapObjKeys.length) {
//     new_obj = { 'add': {} };
//     for (let fkey of freshLdapObjKeys) {
//         for (let oldkey of oldLdapObjKeys) {
//             if (fkey === oldkey) {
//                 _newObj = false;
//             }
//         }
//         if (_newObj) {
//             new_obj['add'][fkey] = freshLdapObj[fkey];
//             new_obj['add'][fkey]['timestamp'] = undefined;
//         } else {
//             _newObj = true;
//         }
//     }
// }
// else {
//     new_obj = { 'del': {} };
//     for (let oldkey of oldLdapObjKeys) {
//         for (let fkey of freshLdapObjKeys) {
//             if (oldkey === fkey) {
//                 _newObj = false;
//             }
//         }
//         if (_newObj) {
//             new_obj['del'][oldkey] = oldLdapObjKeys[oldkey];
//         } else {
//             _newObj = true;
//         }
//     }
// }
// }


// let a = z.reduce((acc, item) => {
//
// }, [])



// let cusObj = [{
//     name: 'Serj',
//     'a-12-004': {}
// }]
//
// let serverName = 'a-12-004';
//
// let new_obj = cusObj.reduce((acc, obj) => {
//             let tmp_obj = {[serverName]: {}};
//             Object.keys(obj).forEach(k => {
//                     if (k !== serverName) {
//                         tmp_obj[serverName][k] = obj[k];
//                     }
//                 });
//             tmp_obj[serverName]['timestamp'] = new Date();
//             return tmp_obj;
// }, {});
//
// console.log(new_obj[serverName])
//
//
//
//
//
//
// setInterval(() => {
//     async function fu1() {
//         let res = await getLdapObj
//         rea.push({timestamp: new Date()})
//     }
//     fu1();
// }, 10 * 60 * 1000)