const Users = require('../../models/users');
const Products = require('../../models/products');

exports.init = () => {
	app.get('/users/getUserById', (req, res) => {
		
		let data = {};

		if(!req.query.id) {

			data.code = 400;
			data.message = 'Not get allow!';
			res.status(400).json(data);

		} else {

			Users.test1().then(
				() => Users.test2().then(
					() => Products.getProducts().then(
						() => {
                            //----- call back getProducts -------//
                            console.log('get all product.'),
                            Users.findAll().then(
                                () => Users.getUsers().then(
                                        (rows) => {
                                            //----- call back getUsers -------//
                                            console.log(rows),
                                            console.log('get all users.'),
                                            Users.getReportUsers(rows).then(
                                                (id) => {
                                                    let data = {}
                                                    data.code = 200
                                                    data.result = id
                                                    res.status(200).json(data)
                                                }
                                            ).catch((err) => {
                                                throw err
                                            })
                                            //----- end call back getUsers -------//
                                        }
                                ).catch((err) => {
                                    throw err;
                                })
                            ).catch((err) => {
                                throw err;
                            })
                            //----- end call back getProducts -------//
                        }
					).catch((err) => {
						throw err;
					})
				).catch((err) => {
					throw err;
				})			
			).catch((err) => {
				throw err;	
			})
			
		}
	})
}