const dotenv = require('dotenv');
dotenv.config();
const con = require('../config/db');
const configvar = require('../config/configvar');
const prefix = configvar['dbprefix'];
const { handleDisconnect } = require('../config/db');


module.exports.reconnect = function () {
    con.destroy();
    handleDisconnect();
};
// let resultData = await queryService.getAllData('users');
// Above text is an example of below function how to call below function
module.exports.getAllData = async function (tableName) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT * FROM ??";
        con.query(sql, [prefix + tableName], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
// let resultData = await queryService.getAllDataOrderBy('users', 'id ASC/DESC');
// Above text is an example of below function how to call below function
module.exports.getAllDataOrderBy = async function (tableName, orderBy = '') {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT * FROM ??";
        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }
        con.query(sql, [prefix + tableName], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
// let conditions = { status: 'Enable', role: 'user' };
// let resultData = await queryService.getDataByConditions('users', conditions);
// Above text is an example of below function how to call below function
module.exports.getDataByConditions = async function (tableName, conditions) {
    return new Promise(function (resolve, reject) {
        let keys = Object.keys(conditions);
        let values = Object.values(conditions);

        let whereClause = keys.map(key => `${key} = ?`).join(' AND ');

        let sql = `SELECT * FROM ?? WHERE ${whereClause}`;
        con.query(sql, [prefix + tableName, ...values], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
// let conditions = { status: 'Enable', role: 'user' };
// let resultData = await queryService.getDataByConditionsOrderBy('users', conditions, 'id ASC/DESC');
// Above text is an example of below function how to call below function
// module.exports.getDataByConditionsOrderBy = async function (tableName, conditions, orderBy = '') {
//     return new Promise(function (resolve, reject) {
//         let keys = Object.keys(conditions);
//         let values = Object.values(conditions);

//         let whereClause = keys.map(key => `${key} = ?`).join(' AND ');

//         let sql = `SELECT * FROM ?? WHERE ${whereClause}`;
        
//         if (orderBy) {
//             sql += ` ORDER BY ${orderBy}`;
//         } 
//         con.query(sql, [prefix + tableName, ...values], function (err, result) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// };
module.exports.getDataByConditionsOrderBy = async function (tableName, conditions, orderBy = '') {
    return new Promise(function (resolve, reject) {
        let keys = Object.keys(conditions);
        let values = [];

        // Modify WHERE clause to handle null values
        let whereClause = keys.map(key => {
            if (conditions[key] === null) {
                return `${key} IS NULL`;
            } else {
                values.push(conditions[key]);
                return `${key} = ?`;
            }
        }).join(' AND ');

        let sql = `SELECT * FROM ?? WHERE ${whereClause}`;
        
        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }

        con.query(sql, [prefix + tableName, ...values], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// let insertData = { name: 'John Doe', email: 'john@example.com' };
// let resultData = await queryService.insertData('users', insertData);
// Above text is an example of below function how to call below function
module.exports.insertData = async function (tableName, data) {
    return new Promise(function (resolve, reject) {
        let sql = "INSERT INTO ?? SET ?";
        con.query(sql, [prefix + tableName, data], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
// let updateData = { name: 'Jane Doe', email: 'jane@example.com' };
// let conditions = { status: 'Enable', role: 'user' };
// let resultData = await queryService.updateData('users', updateData, conditions);
// Above text is an example of below function how to call below function
module.exports.updateData = async function (tableName, newData, conditions) {
    return new Promise(function (resolve, reject) {
        let keys = Object.keys(conditions);
        let values = Object.values(conditions);

        let whereClause = keys.map(key => `${key} = ?`).join(' AND ');

        let sql = `UPDATE ?? SET ? WHERE ${whereClause}`;
        con.query(sql, [prefix + tableName, newData, ...values], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
// let deleteData = { name: 'Jane Doe', email: 'jane@example.com' };
// let conditions = { status: 'Enable', role: 'user' };
// let resultData = await queryService.deleteDataSoft('users', deleteData, conditions);
// Above text is an example of below function how to call below function
module.exports.deleteDataSoft = async function (tableName, newData, conditions) {
    return new Promise(function (resolve, reject) {
        let keys = Object.keys(conditions);
        let values = Object.values(conditions);

        let whereClause = keys.map(key => `${key} = ?`).join(' AND ');

        let sql = `UPDATE ?? SET ? WHERE ${whereClause}`;
        con.query(sql, [prefix + tableName, newData, ...values], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
// let conditions = { status: 'Enable', role: 'user' };
// let resultData = await queryService.deleteDataHard('users', conditions);
// Above text is an example of below function how to call below function
module.exports.deleteDataHard = async function (tableName, conditions) {
    return new Promise(function (resolve, reject) {
        let keys = Object.keys(conditions);
        let values = Object.values(conditions);

        let whereClause = keys.map(key => `${key} = ?`).join(' AND ');

        let sql = `DELETE FROM ?? WHERE ${whereClause}`;
        con.query(sql, [prefix + tableName, ...values], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
// let conditions = { [`${prefix+'property'}.p_id`]: 1, [`${prefix+'property'}.status`]: 'Enable' };
// let columns = `${prefix+'property'}.*, ${prefix+'property_features'}.*, ${prefix+'property_amenities'}.*, ${prefix+'property_features'}.ceiling_height as pf_ceiling_height`;
// let joinConditions = [
//     { type: 'LEFT', table: `${prefix+'property_features'}`, on: `${prefix+'property_features'}.p_id = ${prefix+'property'}.p_id` },
//     { type: 'LEFT', table: `${prefix+'property_amenities'}`, on: `${prefix+'property_amenities'}.p_id = ${prefix+'property'}.p_id` },
// ];
// let resultData = await queryService.getDataByConditionsNdJoin('property', conditions, columns, joinConditions);
// Above text is an example of below function how to call below function
module.exports.getDataByConditionsNdJoin = async function (tableName, conditions, columns = '*', joinConditions) {
    return new Promise(function (resolve, reject) {
        let keys = Object.keys(conditions);
        let values = Object.values(conditions);

        let whereClause = keys.map(key => `${key} = ?`).join(' AND ');

        let joinClause = '';
        if (joinConditions) {
            joinClause = joinConditions.map(condition => `${condition.type} JOIN ${condition.table} ON ${condition.on}`).join(' ');
        }

        let sql = `SELECT ${columns} FROM ?? ${joinClause} WHERE ${whereClause}`;
        con.query(sql, [prefix + tableName, ...values], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
// let conditions = { [`${prefix+'property'}.p_id`]: 1, [`${prefix+'property'}.status`]: 'Enable' };
// let columns = `${prefix+'property'}.*, ${prefix+'property_features'}.*, ${prefix+'property_amenities'}.*, ${prefix+'property_features'}.ceiling_height as pf_ceiling_height`;
// let joinConditions = [
//     { type: 'LEFT', table: `${prefix+'property_features'}`, on: `${prefix+'property_features'}.p_id = ${prefix+'property'}.p_id` },
//     { type: 'LEFT', table: `${prefix+'property_amenities'}`, on: `${prefix+'property_amenities'}.p_id = ${prefix+'property'}.p_id` },
// ];
// let resultData = await queryService.getDataByConditionsOrderByNdJoin('property', conditions, columns, joinConditions, `${prefix+'transaction'}.id ASC/DESC`);
// Above text is an example of below function how to call below function
module.exports.getDataByConditionsOrderByNdJoin = async function (tableName, conditions, columns = '*', joinConditions, orderBy = '') {
    return new Promise(function (resolve, reject) {
        let keys = Object.keys(conditions);
        let values = Object.values(conditions);

        let whereClause = keys.map(key => `${key} = ?`).join(' AND ');

        let joinClause = '';
        if (joinConditions) {
            joinClause = joinConditions.map(condition => `${condition.type} JOIN ${condition.table} ON ${condition.on}`).join(' ');
        }

        let orderByClause = '';
        if (orderBy) {
            orderByClause = `ORDER BY ${orderBy}`;
        }

        let sql = `SELECT ${columns} FROM ?? ${joinClause} WHERE ${whereClause} ${orderByClause}`;
        con.query(sql, [prefix + tableName, ...values], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
// let columns = `${prefix+'property'}.*, ${prefix+'property_features'}.*, ${prefix+'property_amenities'}.*, ${prefix+'property_features'}.ceiling_height as pf_ceiling_height`;
// let joinConditions = [
//     { type: 'LEFT', table: `${prefix+'property_features'}`, on: `${prefix+'property_features'}.p_id = ${prefix+'property'}.p_id` },
//     { type: 'LEFT', table: `${prefix+'property_amenities'}`, on: `${prefix+'property_amenities'}.p_id = ${prefix+'property'}.p_id` },
// ];
// let resultData = await queryService.getDataByConditionsOrderByNdJoin('property', conditions, columns, joinConditions, `${prefix+'transaction'}.id ASC/DESC`);
// Above text is an example of below function how to call below function
module.exports.getAllDataOrderByNdJoin = async function (tableName, columns = '*', joinConditions, orderBy = '') {
    return new Promise(function (resolve, reject) {
        let joinClause = '';
        if (joinConditions) {
            joinClause = joinConditions.map(condition => `${condition.type} JOIN ${condition.table} ON ${condition.on}`).join(' ');
        }

        let orderByClause = '';
        if (orderBy) {
            orderByClause = `ORDER BY ${orderBy}`;
        }

        let sql = `SELECT ${columns} FROM ?? ${joinClause} ${orderByClause}`;
        con.query(sql, [prefix + tableName], function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};