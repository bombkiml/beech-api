module.exports = {
  requests: (req, res, next) => {
    console.log(res.statusCode);
    console.log(req.url, req.method);
    return res.status(404).json({
      code: 404,
      status: "404_NOT_FOUND",
      error: "Passport config file not found.",
    });
    next();
  },
};
