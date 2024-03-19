const Base = (Pj = []) => {
  Pj.map((Project) => {
    let endpointName = Object.values(Project)[4];
    endpoint.get(`/${endpointName}/:limit?/:offset?`, Credentials, async (req, res) => {
      const results = await Project.findAll({ offset: (parseInt(req.params.offset) || 0), limit: (parseInt(req.params.limit) || 100) });
      await res.json({
        code: 200,
        status: "SUCCESS",
        results,
        length: results.length,
      });
    });
    endpoint.post(`/${endpointName}`, Credentials, (req, res) => {
      Project.create(req.body)
        .then((created) => {
          // @return
          res.status(201).json({
            code: 201,
            status: "CREATE_SUCCESS",
            createdId: created.id,
          });
        })
        .catch((err) => {
          // @return
          res.status(501).json({
            code: 501,
            status: "CREATE_FAILED",
            error: err,
          });
        });
    });
    endpoint.patch(`/${endpointName}/:id`, Credentials, (req, res) => {
      Project.update(req.body, {
        where: {
          id: req.params.id,
        },
      })
        .then((updated) => {
          // @return
          res.status(200).json({
            code: 200,
            status: "UPDATE_SUCCESS",
            result: {
              updateId: req.params.id,
              affectedRows: updated[0],
            },
          });
        })
        .catch((err) => {
          // @return
          res.status(501).json({
            code: 501,
            status: "UPDATE_FAILED",
            error: err,
          });
        });
    });
    endpoint.delete(`/${endpointName}/:id`, Credentials, (req, res) => {
      Project.destroy({
        where: {
          id: req.params.id,
        },
      })
        .then((deleted) => {
          if(deleted) {
            // @return
            res.status(200).json({
              code: 200,
              status: "DELETE_SUCCESS",
              result: {
                deleteId: req.params.id,
                affectedRows: deleted,
              },
            });
          } else {
            res.status(406).json({
              code: 406,
              status: "NOT_ACCEPTABLE",
              result: {
                deleteId: req.params.id,
                affectedRows: deleted,
              },
            });
          }
        })
        .catch((err) => {
          // @return
          res.status(501).json({
            code: 501,
            status: "DELETE_FAILED",
            error: err,
          });
        });
    });
  });
};

module.exports = { Base };
