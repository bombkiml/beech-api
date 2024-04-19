/**
 * file walk autoload all file
 *
 */
exports.fileWalk = (files) => {
  return new Promise((resolve, reject) => {
    try {
      if (files.length) {
        let route;
        files.map((val, key) => {
          let endpointFile = val.replace(".js", "");
          try {
            route = require(endpointFile);
            if (route instanceof Error) {
              console.log(out.message);
              reject(error);
            }
            route.init();
            if (files.length == key + 1) {
              resolve(true);
            }
          } catch (error) {
            console.log(error);
            reject(error);
          }
        });
      } else {
        resolve(true);
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
