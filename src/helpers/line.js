const line = require('line-api')

exports.notify = (message, token) => {    
    const notify = new line.Notify({
        token: token
    })
    notify.send({
        message: message
    })
    .then(console.log)
}
