const walk = require("walk");
const appRoot = require("app-root-path");
const fs = require("fs");

function walkModel(cb) {
  try {
    let jsfiles = [];
    let walker = walk.walk(appRoot + "/src/models", { followLinks: false });
    // Walk file on push
    walker.on("file", (root, stat, next) => {
      jsfiles.push(root + "/" + stat.name);
      next();
    });
    // Walking
    walker.on("end", () => {
      let preProject = [];
      if(jsfiles.length) {
        jsfiles.forEach((file, k) => {
          let schemaPath = "@/models" + file.split("models")[1].replace(/\\/g, "/");
          let endpoint = file
            .split("models")[1]
            .replace(/\\/g, "/")
            .replace(/_/g, "-")
            .toLowerCase()
            .slice(0, -3);
          preProject.push([schemaPath, endpoint]);
          if (jsfiles.length == k + 1) {
            cb(null, preProject);
          }
        });
      } else {
        // model not found.
        cb(null, preProject);
      }
    });
  } catch (error) {
    cb(error, null);
  }
}

function filterProject(Projects, reqUrl, req, res, cb) {
  try {
    let pj = Projects.shift();
    let regx = new RegExp(pj[1] + "?[^\/].?[a-zA-Z0-9].*$", 'g');
    let regxMatch = reqUrl.match(regx);
    let regxMatchLength = (regxMatch) ? regxMatch.length: 0;
    if (pj[1] == reqUrl) {
      return checkOffset(Object.values(require(pj[0]))[0], req, res, (thenChecked) => {
        if(thenChecked) {
          return cb(null, Object.values(require(pj[0]))[0]);
        }
      });
    } else if(regxMatchLength) {
      return checkOffset(Object.values(require(pj[0]))[0], req, res, (thenChecked) => {
        if(thenChecked) {
          return cb(null, Object.values(require(pj[0]))[0]);
        }
      });
    }
    // Finally recursive filterProject function
    if (Projects.length > 0) {
      filterProject(Projects, reqUrl, req, res, cb);
    } else {
      // not match
      return notfound(res);
    }
  } catch (error) {
    cb(error, null);
  }
}

function checkOffset(Project, req, res, cb) {
  if (!Project) {
    return notfound(res);
  }
  // check offset is Ingeter as well as Zero number
  let offset = req.params.offset || undefined;
  let limit = req.params.limit || undefined;
  let offsetRegxMatch = (offset !== undefined) ? offset.match(/^[0-9]+$/) : undefined;
  let limitRegxMatch = (limit !== undefined) ? limit.match(/^[0-9]+$/) : undefined;
  console.log(offsetRegxMatch, limitRegxMatch);
  if (offsetRegxMatch && limitRegxMatch) {
    cb(true);
  } else {
    if(offset === undefined) {
      cb(true);
    } else {
      return notfound(res);
    }
  }
}

function notfound(res) {
  return res.status(404).json({
    code: 404,
    status: "404_NOT_FOUND",
    message: "The Endpoint not found!.",
  });
}

function errMessage(err, res) {
  let errTurnOffDbDefine = JSON.stringify(err.toString()).match(/'define'/);
  let errTurnOffDbOption = JSON.stringify(err.toString()).match(/'options'/);
  if(errTurnOffDbDefine || errTurnOffDbOption) {
    // @return
    return res.status(500).json({
      code: 500,
      status: "ERR_INTERNAL_SERVER",
      message: "Database connection name is CLOSED.",
    });
  } else {
    // @return
    return res.status(500).json({
      code: 500,
      status: "ERR_INTERNAL_SERVER",
      message: err.toString(),
    });
  }
}

function Base() {
  return new Promise((resolve, reject) => {
    try {
      walkModel((err, Projects) => {
        if (err) {
          reject(err);
        } else {
          const checkPassport = new Promise((resolve) => {
            const passport_config_file = appRoot + "/passport.config.js";
            let passport_config_auth = undefined;
            if (fs.existsSync(passport_config_file)) {
              const _passport_config_ = require(passport_config_file);
              resolve(_passport_config_.auth_endpoint || "/authentication");
            } else {
              // passport config not found
              resolve(passport_config_auth);
            }
          });
          // passport conifg promise
          checkPassport.then((authEndpoint) => {
            if(Projects.length) {
              // GET method with ALL data, default: limit rows 100
              endpoint.get("/:hash", Credentials, async (req, res, next) => {
                let leaveMeAlone = await Projects.slice(0);
                await filterProject(leaveMeAlone, req.originalUrl, req, res, async (err, Project) => {
                  if (!err) {
                    if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                      try {
                        const results = await Project.findAll({
                          offset: 0,
                          limit: (Project.options.limitRows) ? Project.options.limitRows : 100,
                        });
                        // @ return
                        await res.json({
                          code: 200,
                          status: "SUCCESS",
                          results,
                          length: results.length,
                        });
                      } catch (error) {
                        // @return
                        return errMessage(error, res);
                      }
                    } else {
                      next();
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });
              // GET method with id
              endpoint.get("/:hash/:id", Credentials, async (req, res, next) => {
                // allow official stetragy
                if(req.params.id == "google" || req.params.id == "facebook") {
                  return next();
                }
                // filter GET project
                let leaveMeAlone = await Projects.slice(0);
                await filterProject(leaveMeAlone, req.originalUrl, req, res, async (err, Project) => {
                  if (!err) {
                    if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                      try {
                        const results = await Project.findByPk(req.params.id);
                        // @ return
                        await res.json({
                          code: 200,
                          status: "SUCCESS",
                          results,
                        });
                      } catch (error) {
                        // @return
                        return errMessage(error, res);
                      }
                    } else {
                      next();
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });
              // GET method with :limit and :offset
              endpoint.get("/:hash/:limit/:offset", Credentials, async (req, res, next) => {
                // allow official stetragy
                if(req.params.limit == "facebook" || req.params.offset == "collback") {
                  return next();
                }
                // filter GET limit,offset project
                let leaveMeAlone = await Projects.slice(0);
                await filterProject(leaveMeAlone, req.originalUrl, req, res, async (err, Project) => {
                  if (!err) {
                    if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                      try {
                        const results = await Project.findAll({
                          offset: parseInt(req.params.offset) || 0,
                          limit: (parseInt(req.params.limit) === 0) ? 0 : parseInt(req.params.limit),
                        });
                        // @ return
                        await res.json({
                          code: 200,
                          status: "SUCCESS",
                          results,
                          length: results.length,
                        });
                      } catch (error) {
                        // @return
                        return errMessage(error, res);
                      }
                    } else {
                      next();
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });
              // POST method
              endpoint.post("/:hash", async (req, res, next) => {
                // Check auth request match send next
                if(authEndpoint !== undefined) {
                  if(req.params.hash == authEndpoint.replace(/^\/|\/$/g, "")) {
                    return next();
                  }
                }
                // When lost IF
                let leaveMeAlone = await Projects.slice(0);
                await filterProject(leaveMeAlone, req.originalUrl, req, res, async (err, Project) => {
                  if (!err) {
                    if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                      try {
                        await Project.create(req.body).then((created) => {
                          // @return
                          res.status(201).json({
                            code: 201,
                            status: "CREATE_SUCCESS",
                            createdId: (created.id) ? created.id : created[Project.primaryKeyAttributes[0]],
                          });
                        }).catch((err) => {
                          // @return
                          res.status(501).json({
                            code: 501,
                            status: "CREATE_FAILED",
                            error: err,
                          });
                        });
                      } catch (error) {
                        // @return
                        return errMessage(error, res);
                      }
                    } else {
                      next();
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });
              // PATCH method
              endpoint.patch("/:hash/:id", Credentials, async (req, res, next) => {
                let leaveMeAlone = await Projects.slice(0);
                await filterProject(leaveMeAlone, req.originalUrl, req, res, async (err, Project) => {
                  if (!err) {
                    if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                      try {
                        let updatePk = await {
                          [Project.primaryKeyAttributes[0]]: req.params.id
                        };
                        await Project.update(req.body, {
                          where: updatePk,
                        }).then((updated) => {
                          // @return
                          res.status(200).json({
                            code: 200,
                            status: "UPDATE_SUCCESS",
                            result: {
                              updateId: req.params.id,
                              affectedRows: updated[0],
                            },
                          });
                        }).catch((err) => {
                          // @return
                          res.status(501).json({
                            code: 501,
                            status: "UPDATE_FAILED",
                            error: err,
                          });
                        });
                      } catch (error) {
                        // @return
                        return errMessage(error, res);
                      }
                    } else {
                      next();
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });
              // DELETE method
              endpoint.delete("/:hash/:id", Credentials, async (req, res, next) => {
                let leaveMeAlone = await Projects.slice(0);
                await filterProject(leaveMeAlone, req.originalUrl, req, res, async (err, Project) => {
                  if (!err) {
                    if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                      try {
                        let deletePk = await {
                          [Project.primaryKeyAttributes[0]]: req.params.id
                        };
                        await Project.destroy({
                          where: deletePk,
                        }).then((deleted) => {
                          if (deleted) {
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
                        }).catch((err) => {
                          // @return
                          res.status(501).json({
                            code: 501,
                            status: "DELETE_FAILED",
                            error: err,
                          });
                        });
                      } catch (error) {
                        // @return
                        return errMessage(error, res);
                      }
                    } else {
                      next();
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });
            }
            // resolve it.
            resolve(true);
          }).catch((err) => {
            reject(err);
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { Base };
