// Require something 

exports.init = () => {
  /**
   * Initiate basic request with GET, POST, PUT, PATCH, DELETE
   *
   * @return json data
   *
   */
  /@GET/
	endpoint.get('/xxx/xxx', (req, res) => {
		let data = {};
    data.code = 200;
    data.message = 'Got a GET request.';
    res.json(data);
	});

  /@POST/
  endpoint.post('/xxx/xxx', (req, res) => {
    /**
     * @param Integer id
     *
     * @return json
     */
    let id = req.body.id;
    // @return
    let data = {};
    data.code = 200;
    data.message = 'Got a POST request.';
    res.json(data);
  });

  /@PUT/
  endpoint.put('/xxx/xxx/:id', (req, res) => {
    /**
     * @param Integer id
     *
     * @return json
     */
    let id = req.params.id;
    // @return
    let data = {};
    data.code = 200;
    data.message = 'Got a PUT request at /xxx/xxx/' + id;
    res.json(data);
  });

  /@PATCH/
  endpoint.patch('/xxx/xxx/:id', (req, res) => {
    /**
     * @param Integer id
     *
     * @return json
     */
    let id = req.params.id;
    // @return
    let data = {};
    data.code = 200;
    data.message = 'Got a PATCH request at /xxx/xxx/' + id;
    res.json(data);
  });

  /@DELETE/
  endpoint.delete('/xxx/xxx/:id', (req, res) => {
    /**
     * @param Integer id
     *
     * @return json
     */
    let id = req.params.id;
    // @return
    let data = {};
    data.code = 200;
    data.message = 'Got a DELETE request at /xxx/xxx/' + id;
    res.json(data);
  });
}
