/**
 * Server start using by Express
 * 
 */
exports.expressStart = () => {
	return new Promise((resolve, reject) => {
		try {
			app.use((err, req, res, next) => {
				res.status(err.status || 500);
				var data = {};
				data.code = 500;
				data.message = err.message;
				res.json(data);
			});
			const ExpressServer = _http.createServer(app).listen(_config.main_config.app_port, _config.main_config.app_host, () => {
				console.log('Express server started: <http://' + ExpressServer.address().address +':'+ ExpressServer.address().port +'>');
                resolve(true)
			});
		} catch (error) {
			reject(error)
		}
	});
}