let data = [
    {"id": 1, "username": "goldroger", "name": "Gol D. Roger", "position": "Pirate King"},
    {"id": 2, "username": "mrzero", "name": "Sir Crocodile", "position": "Former-Shichibukai"},
    {"id": 3, "username": "luffy", "name": "Monkey D. Luffy", "position": "Captain" },
    {"id": 4, "username": "kuzan", "name": "Aokiji", "position": "Former Marine Admiral"},
    {"id": 5, "username": "shanks", "name": "'Red-Haired' Shanks", "position": "The 4 Emperors"}
];

exports.findAll = () => {
    return new Promise((resolve, reject) => {
        try {

            console.log(data);
            resolve(data)

        } catch (error) {
            reject(error)
        }
    });
};

exports.test1 = () => {
    return new Promise((resolve, reject) => {
        try {

            setTimeout(() => {
                console.log(1)
                resolve(true);
            }, 1000);
            
        } catch (error) {
            reject(error);
        }
    });
}

exports.test2 = () => {
    return new Promise((resolve, reject) => {
        try {

            console.log(2)
            resolve(true)
            
        } catch (error) {
            reject(error)
        }
    });
}

exports.findById = (id) => {
    return new Promise((resolve, reject) => {
        try {
            for (var i = 0; i < data.length; i++) {
                if (data[i].id == id) {
                    resolve(true)
                    return data[i]
                }
            }
        } catch (error) {
            reject(error)
        }
    });
};

exports.getUsers = (limit = null, offset = null) => {
    return new Promise((resolve, reject) => {
        try {
            let sql = "SELECT * FROM na_users";
            if(limit) {
                sql += " LIMIT "+ limit;
            }
            if(limit && offset) {
                sql += " OFFSET "+ offset;
            }
            DB.query(sql, (err, rows, fields) => {
                console.log(rows)
                resolve(rows)            
            });
        } catch (error) {
            reject(error)
        }
    });
}

exports.getReportUsers = (rows) => {
    return new Promise((resolve, reject) => {
        try {
            let data = []
            let length = rows.length
            rows.forEach((val, key) => {
                let sql = "select id from na_users where id = ?";
                reportDB.query(sql, [val.id], (err, row, fields) => {
                    data.push(row)
                    if(length == key+1) {
                        console.log(data)
                        resolve(data)
                    }
                })                
            })
        } catch (error) {
            reject(error)
        }
    });
}