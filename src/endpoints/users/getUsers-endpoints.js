const Users = require('../../models/users')

exports.init = () => {
    app.get('/users/getUsers', (req, res) => {
        let data = {};
        Users.getUsers(req.query.limit, req.query.offset).then(
            (users) => {
                data.results = users
                res.status(200).json(data)
            }
        )
    })
}