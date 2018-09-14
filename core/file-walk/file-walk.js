/**
 * file walk autoload all file
 * 
 */
exports.fileWalk = (files) => {
	return new Promise((resolve, reject) => {
		try {
           let route;        
            files.forEach((val, index) => {
                route = require('../.' + val.replace('.js', ''))
                route.init()
            })
		} catch (error) {
			reject(error)
		}
	});
}