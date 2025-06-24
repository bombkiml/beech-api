const walk = require("walk");
const fs = require("fs");
const { checkRoleMiddlewareWithDefaultProject } = require("../../cli/core/middleware/express/jwtCheckAllow");

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

function filterProject(Projects, reqUrl, params = "", method = "", req, res, cb) {
  try {
    let pj = Projects.shift();
    let leaveParamsAlone = params.slice(0);
    let paramsItem = leaveParamsAlone.replace(/^\/|\/$/g, "").split('/');
    let leaveReqUrlAlone = reqUrl.slice(0);
    let newParams = params.split("/").filter((e) => (e !== 'undefined')).join("/");
    let urlWithoutParams = leaveReqUrlAlone.replace(newParams, '').split("?")[0].replace(/\/$/, "");
    // sub-way for PATCH method
    urlWithoutParams = (method == "PATCH" || method == "DELETE") ? urlWithoutParams.substring(0, urlWithoutParams.lastIndexOf('/')) : urlWithoutParams;
    // check match project by url
    if(pj[1] == urlWithoutParams) {
      return checkOffset(Object.values(require(pj[0]))[0], req, res, (thenChecked) => {
        if(thenChecked) {
          return cb(null, Object.values(require(pj[0]))[0], paramsItem);
        }
      });
    }
    // Finally recursive filterProject function
    if (Projects.length > 0) {
      filterProject(Projects, reqUrl, params, method, req, res, cb);
    } else {
      // not match
      return notfound(res);
    }
  } catch (error) {
    console.log(error);
    cb(error, null, []);
  }
}

function filterProjectForByPass(Projects, reqUrl, req, res, cb) {
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
    // Finally recursive filterProjectForByPass function
    if (Projects.length > 0) {
      filterProjectForByPass(Projects, reqUrl, req, res, cb);
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

function whereCond(objectCond, cb) {
  if(typeof objectCond === 'object' && Object.keys(objectCond).length) {
    let keys = Object.keys(objectCond);
    let where = {};
    let orderBy = {};
    let groupBy = {};
    // Start Recursive for Check Where condition OR GroupBy OR OrderBy
    recursiveWhereCond(keys, objectCond, where, groupBy, orderBy, (err, cbWhere, cbGroupBy, cbOrderBy) => {
      cb(err, cbWhere, cbGroupBy, cbOrderBy);
    });
  } else {
    cb(null, {}, { group: { groupby: [] } }, { order: { orderby: [] } });
  }
}

async function recursiveWhereCond(keys, objectCond, where, groupBy, orderBy, cb) {
  if(keys.length > 0) {
    let k = keys.shift();
    // Check param key for Where condition OR GroupBy OR OrderBy
    if(k == 'orderby') {
      let oderByValueItemFromQueryString = objectCond[k].replace(/\w+/g, '"$&"').replace(/\[\s*\]/g, '[]');
      // Check Array syntax from Query String
      isValidArrayFormat(oderByValueItemFromQueryString, (err, isArray, strArr) => {
        if(err) {
          cb(["SyntaxError: Unexpected end of Array or String input", ` (${k})`], null, null, null);
        } else {
          let order = JSON.parse(strArr);
          orderBy[k] = order.length ? order : null;
          // Recursive re-call function
          recursiveWhereCond(keys, objectCond, where, groupBy, orderBy, cb);
        }
      });
    } else if(k == 'groupby') {
      let groupByValueItemFromQueryString = objectCond[k].replace(/\w+/g, '"$&"').replace(/\[\s*\]/g, '[]');
      // Check Array syntax from Query String
      isValidArrayFormat(groupByValueItemFromQueryString, (err, isArray, strArr) => {
        if(err) {
          cb(["SyntaxError: Unexpected end of Array or String input", ` (${k})`], null, null, null);
        } else {
          let group = JSON.parse(strArr);
          groupBy[k] = group.length ? group : null;
          // Recursive re-call function
          recursiveWhereCond(keys, objectCond, where, groupBy, orderBy, cb);
        }
      });
    } else {
      let fieldValueItemFromQueryString = objectCond[k].replace(/\w+/g, '"$&"').replace(/\[\s*\]/g, '[]');
      let valueItem = objectCond[k].replace(/[\[\]|\s']+/g, '').split(',');
      // Check Array syntax from Query String
      isValidArrayFormat(fieldValueItemFromQueryString, async (err) => {
        if(err) {
          cb(["SyntaxError: Unexpected end of Array or String input", ` (${k})`], null, null, null);
        } else {
          let onlyValueItem = await valueItem.slice(0);
          await onlyValueItem.shift();
          where[k] = await (valueItem[1])
                      ? {
                          [Op[valueItem[0]]]: (valueItem[1] == 'null')
                                              ? null  : (valueItem[1] == 'true')
                                              ? true  : (valueItem[1] == 'false')
                                              ? false : (valueItem[0] == 'between' || valueItem[0] == 'notBetween')
                                              ? [valueItem[1],valueItem[2]] :
                                                (
                                                  valueItem[0] == 'or'
                                                  || valueItem[0] == 'in'
                                                  || valueItem[0] == 'notIn'
                                                )
                                              ? onlyValueItem : valueItem[1]
                        }
                      : valueItem[0];
          // Recursive re-call function
          recursiveWhereCond(keys, objectCond, where, groupBy, orderBy, cb);
        }
      });
    }
  } else {
    cb(null, where, groupBy, orderBy);
  }
}

function isValidArrayFormat(str, cb) {
  try {
    const parsed = JSON.parse(str);
    cb(null, Array.isArray(parsed), str);
  } catch (err) {
    cb(err, false, null);
  }
}

async function findAll(Project, where, offset, group, order, limitRow, cb) {
  try {
    const results = await Project.findAll({
      where,
      group: (group.groupby) ? group.groupby : [],
      order: (order.orderby) ? [order.orderby] : [],
      offset: offset,
      limit: limitRow,
    });
    await cb(null, results)
  } catch (error) {
    cb(error, null);
  }
}

async function retrieving(authEndpoint, Projects, req, res, next) {
  let params = req.params;
  let hash = "/" + req.params.hash;
  // allow official stetragy
  if(hash == authEndpoint && (params[0] == "/facebook" || params[0] == "/facebook/callback" || params[0] == "/google" || params[0] == "/google/callback")) {
    return next();
  }
  // declare variable for check request with params
  let leaveMeAlone = await Projects.slice(0);
  let mergeDuoVar = [req.params.limit, req.params.offset].map((e) => (e || 'undefined')).join("/");
  let reqUrl = req.originalUrl.replace(_publicPath_, '/');
  let checkConditionIsQueryOrId = Object.keys(req.query).length
                                    ? req.query
                                    : 'undefined';
  /**
   * Function whereCond with callback property
   * 
   * @where Object|String
   * 
   */
  whereCond(checkConditionIsQueryOrId, async (err, where, groupBy, orderBy) => {
    if(err) {
      res.status(400).json({
        code: 400,
        status: "BAD_REQUEST",
        err: String(err),
      });
    } else {
      /**
       * Filter Project with callback property
       * 
       * @err String
       * @Project Require
       * @params Object [0=limit, 1=offset]
       * 
       */
      await filterProject(leaveMeAlone, reqUrl, "/".concat(mergeDuoVar), "", req, res, async (err, Project, params) => {
        if (!err) {
          if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
            try {
              // declare default limit offset
              let offset = 0;
              let limitRow = await (Project.options.limitRows) ? Project.options.limitRows : 100;
              // check assign limit, offset ?
              if ((params[0] && params[0]  != 'undefined') && ((params[1] && params[1] != 'undefined') || parseInt(params[1]) === 0)) {
                // Only case: /limit/offset
                limitRow = parseInt(params[0]);
                offset = parseInt(params[1]);
              }
              // findAll data
              await findAll(Project, where, offset, groupBy, orderBy, limitRow, (err, results) => {
                if(err) {
                  res.status(500).json({
                    code: 500,
                    status: "READ_CATCH",
                    err: String(err),
                  });
                } else {
                  // @ return findAll
                  res.json({
                    code: 200,
                    status: "SUCCESS",
                    results,
                    length: results.length,
                    limitRow,
                  });
                }
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
    }
  });
}

const byPassCheckRole = (Projects, method, passport_config) => {
  return async function (req, res, next) {
    if(passport_config[0] !== undefined) {
      if(req.params.hash == passport_config[0].replace(/^\/|\/$/g, "")) {
        return next();
      } else {
        if(passport_config[1].jwt_allow === true) {
          let leaveMeAlone = await Projects.slice(0);
          await filterProjectForByPass(leaveMeAlone, req.originalUrl.replace(_publicPath_, '/'), req, res, async (err, Project) => {
            if(!err) {
              if(Project.options.defaultEndpoint === undefined || Project.options.defaultEndpoint === true) {
                // Project is not use options
                return Credentials(req, res, () => {
                  return checkRoleMiddlewareWithDefaultProject(null)(req, res, next);
                });
              } else {
                // Method is set
                if(Project.options.defaultEndpoint[method]) {
                  if(Project.options.defaultEndpoint[method]["allow"] === undefined || Project.options.defaultEndpoint[method]["allow"] === true) {
                    if(Project.options.defaultEndpoint[method]["jwt"]?.allow === false) {
                      // by project jwt_allow is false
                      return checkRoleMiddlewareWithDefaultProject(null)(req, res, next);
                    } else {
                      return Credentials(req, res, () => {
                        return checkRoleMiddlewareWithDefaultProject(Project.options.defaultEndpoint[method].jwt?.broken_role)(req, res, next);
                      });
                    }
                  } else {
                    return notfound(res);
                  }
                } else {
                  // Method is not set
                  return Credentials(req, res, () => {
                    return checkRoleMiddlewareWithDefaultProject(null)(req, res, next);
                  });
                }
              }
            } else {
              return errMessage(err, res);
            }
          });
        } else {
          // global jwt_allow is false
          return next();
        }
      }
    }
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
              resolve([_passport_config_.auth_endpoint || "/authentication", _passport_config_]);
            } else {
              // passport config not found
              resolve([passport_config_auth, _passport_config_]);
            }
          });
          // passport conifg promise
          checkPassport.then((passport_config) => {
            if(Projects.length) {
              // GET method with /:limit/:offset
              endpoint.get("/:hash([a-zA-Z0-9-]+)*/:limit([0-9]+)/:offset([0-9]+)", (req, res, next) => byPassCheckRole(Projects, "GET", passport_config)(req, res, next), async (req, res, next) => {
                await retrieving(passport_config[0], Projects, req, res, next);
              });

              // GET method only hash/*
              endpoint.get("/:hash([a-zA-Z0-9-]+)*", (req, res, next) => byPassCheckRole(Projects, "GET", passport_config)(req, res, next), async (req, res, next) => {
                await retrieving(passport_config[0], Projects, req, res, next);
              });

              // POST method
              endpoint.post("/:hash*", (req, res, next) => byPassCheckRole(Projects, "POST", passport_config)(req, res, next), async (req, res, next) => {
                // Check auth request match send next
                if(passport_config[0] !== undefined) {
                  if(req.params.hash == passport_config[0].replace(/^\/|\/$/g, "")) {
                    return next();
                  }
                }
                // When lost IF
                let leaveMeAlone = await Projects.slice(0);
                let reqUrl = req.originalUrl.replace(_publicPath_, '/');
                await filterProject(leaveMeAlone, reqUrl, "", "", req, res, async (err, Project) => {
                  if (!err) {
                    try {
                      // Leave pool by project for check pool error
                      let pool = Project.sequelize;
                      // Store with body
                      await Project.create(req.body).then((created) => {
                        // @return
                        res.status(201).json({
                          code: 201,
                          status: "CREATE_SUCCESS",
                          createdId: (created.id) ? created.id : created[Project.primaryKeyAttributes[0]],
                        });
                      }).catch((error) => {
                        if(pool.options.logging) {
                          // @return with all error
                          res.status(501).json({
                            code: 501,
                            status: "CREATE_FAILED",
                            error: error,
                          });
                        } else {
                          if(error.sql) {
                            delete error.sql;
                            if(error.errors) {
                              delete error.errors;
                            }
                            if(error.parent) {
                              delete error.parent;
                            }
                            if(error.original) {
                              delete error.original.sql;
                              if(error.original.parameters) {
                                delete error.original.parameters;
                              }
                            }
                            if(error.parameters) {
                              delete error.parameters;
                            }
                            // @return with some error
                            res.status(501).json({
                              code: 501,
                              status: "CREATE_FAILED",
                              error: error,
                            });
                          } else {
                            // @return with some string error
                            res.status(501).json({
                              code: 501,
                              status: "CREATE_FAILED",
                              error: String(error),
                            });
                          }
                        }
                      });
                    } catch (error) {
                      // @return
                      return errMessage(error, res);
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });

              // PATCH method
              endpoint.patch("/:hash*/:id([a-zA-Z0-9-]+)", (req, res, next) => byPassCheckRole(Projects, "PATCH", passport_config)(req, res, next), async (req, res, next) => {
                let leaveMeAlone = await Projects.slice(0);
                let reqUrl = req.originalUrl.replace(_publicPath_, '/');
                await filterProject(leaveMeAlone, reqUrl, "", "PATCH", req, res, async (err, Project) => {
                  if (!err) {
                    try {
                      // Leave pool by project for check pool error
                      let pool = Project.sequelize;
                      // Assign update pk
                      let updatePk = { [Project.primaryKeyAttributes[0]]: req.params.id };
                      // Patch with body
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
                      }).catch((error) => {
                        if(pool.options.logging) {
                          // @return with all error
                          res.status(501).json({
                            code: 501,
                            status: "UPDATE_FAILED",
                            error: error,
                          });
                        } else {
                          if(error.sql) {
                            delete error.sql;
                            if(error.parent) {
                              delete error.parent;
                            }
                            if(error.original) {
                              delete error.original.sql;
                              if(error.original.parameters) {
                                delete error.original.parameters;
                              }
                            }
                            if(error.parameters) {
                              delete error.parameters;
                            }
                            if(error.errors) {
                              delete error.errors;
                            }
                            // @return with some error
                            res.status(501).json({
                              code: 501,
                              status: "UPDATE_FAILED",
                              error: error,
                            });
                          } else {
                            // @return with some string error
                            res.status(501).json({
                              code: 501,
                              status: "UPDATE_FAILED",
                              error: String(error),
                            });
                          }
                        }
                      });
                    } catch (error) {
                      // @return
                      return errMessage(error, res);
                    }
                  } else {
                    // @return
                    return errMessage(err, res);
                  }
                });
              });

              // DELETE method
              endpoint.delete("/:hash*/:id([a-zA-Z0-9-]+)", (req, res, next) => byPassCheckRole(Projects, "DELETE", passport_config)(req, res, next), async (req, res, next) => {
                let leaveMeAlone = await Projects.slice(0);
                await filterProject(leaveMeAlone, req.originalUrl.replace(_publicPath_, '/'), "", "DELETE", req, res, async (err, Project) => {
                  if (!err) {
                    try {
                      // Leave pool by project for check pool error
                      let pool = Project.sequelize;
                      // Assign delete pk
                      let deletePk = { [Project.primaryKeyAttributes[0]]: req.params.id };
                      // Delete with params
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
                      }).catch((error) => {
                        if(pool.options.logging) {
                          // @return with all error
                          res.status(501).json({
                            code: 501,
                            status: "DELETE_FAILED",
                            error: error,
                          });
                        } else {
                          if(error.sql) {
                            delete error.sql;
                            if(error.parent) {
                              delete error.parent;
                            }
                            if(error.original) {
                              delete error.original.sql;
                              if(error.original.parameters) {
                                delete error.original.parameters;
                              }
                            }
                            if(error.parameters) {
                              delete error.parameters;
                            }
                            if(error.errors) {
                              delete error.errors;
                            }
                            // @return with some error
                            res.status(501).json({
                              code: 501,
                              status: "DELETE_FAILED",
                              error: error,
                            });
                          } else {
                            // @return with some string error
                            res.status(501).json({
                              code: 501,
                              status: "DELETE_FAILED",
                              error: String(error),
                            });
                          }
                        }
                      });
                    } catch (error) {
                      // @return
                      return errMessage(error, res);
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
