/**
 * MySQL connection
 * 
 */
exports.defaultMysqlConnection = () => {
    return new Promise((resolve, reject) => {
        try {
            // Check flag connecting
            if(!_config.default_mysql_config.isConnect) {
                resolve(true)
                return
            }            
            let mysql_connect = _mysql.createConnection({
                host     : _config.default_mysql_config.host,
                user     : _config.default_mysql_config.user,
                password : _config.default_mysql_config.password,
                database : _config.default_mysql_config.database,
                port     : _config.default_mysql_config.port
            });

            mysql_connect.connect((err) => {
                if(!err) {
                    console.log('Database "default" is connected: ['+ mysql_connect.config.database +']:['+ mysql_connect.config.port+']')
                    resolve(mysql_connect)
                } else {
                    console.log('Database "default" is connect failed.')
                    throw err
                }
            });
        } catch (error) {
            reject(error)
        }
    })
}

exports.reportMysqlConnection = () => {
    return new Promise((resolve, reject) => {
        try {
            // Check flag connecting
            if(!_config.report_mysql_config.isConnect) {
                resolve(true)
                return
            }
            let mysql_connect = _mysql.createConnection({
                host     : _config.report_mysql_config.host,
                user     : _config.report_mysql_config.user,
                password : _config.report_mysql_config.password,
                database : _config.report_mysql_config.database,
                port     : _config.report_mysql_config.port
            });

            mysql_connect.connect((err) => {
                if(!err) {
                    console.log('Database "report" is connected: ['+ mysql_connect.config.database +']:['+ mysql_connect.config.port+']')
                    resolve(mysql_connect)
                } else {
                    console.log('Database "report" is connect failed.')
                    throw err
                }
            });
            
        } catch (error) {
            reject(error)
        }
    })
}