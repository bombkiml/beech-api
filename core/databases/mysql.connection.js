/**
 * Default connection
 * 
 */
exports.defaultConnection = () => {
    return new Promise((resolve, reject) => {
        try {
            // Check flag connecting
            if(!_config.defaultSqlConfig.isConnect) {
                resolve(true)
                return
            } else {
                let connection = _mysql.createConnection({
                    host     : _config.defaultSqlConfig.host,
                    user     : _config.defaultSqlConfig.username,
                    password : _config.defaultSqlConfig.password,
                    database : _config.defaultSqlConfig.database,
                    charset  : _config.defaultSqlConfig.charset,
                    port     : _config.defaultSqlConfig.port
                })
                connection.connect((err) => {
                    if (!err) {
                        connection.query("SET NAMES UTF8")
                        db = connection
                        console.log('Database `'+ _config.defaultSqlConfig.name +'` is connected: ['+ connection.config.database +':'+ connection.config.port+']')
                        resolve(connection)
                    } else {
                        console.log('Database `'+ _config.defaultSqlConfig.name +'` is connect failed.')
                        throw err
                    }
                })
            }            
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Second connection
 * 
 */
exports.secondConnection = () => {
    return new Promise((resolve, reject) => {
        try {
            // Check flag connecting
            if(!_config.secondSqlConfig.isConnect) {
                resolve(true)
                return
            } else {
                let connection = _mysql.createConnection({
                    host     : _config.secondSqlConfig.host,
                    user     : _config.secondSqlConfig.username,
                    password : _config.secondSqlConfig.password,
                    database : _config.secondSqlConfig.database,
                    charset  : _config.secondSqlConfig.charset,
                    port     : _config.defaultSqlConfig.port
                })
                connection.connect((err) => {
                    if (!err) {
                        connection.query("SET NAMES UTF8")
                        db2 = connection
                        console.log('Database `'+ _config.secondSqlConfig.name +'` is connected: ['+ connection.config.database +':'+ connection.config.port+']')
                        resolve(connection)
                    } else {
                        console.log('Database `'+ _config.secondSqlConfig.name +'` is connect failed.')
                        throw err
                    }
                })
            }            
        } catch (error) {
            reject(error)
        }
    })
}
