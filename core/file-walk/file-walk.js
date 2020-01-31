/**
 * file walk autoload all file
 * 
 */
exports.fileWalk = (files) => {
	return new Promise((resolve, reject) => {
		try {
      let route;
      files.forEach(val => {
        route = require('../.' + val.replace('.js', ''));
        route.init();
      });
      resolve(true);
		} catch (error) {
			reject(error);
		}
	});
}