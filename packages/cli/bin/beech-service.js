#!/usr/bin/env node
const logUpdate = require("log-update");
const notifier = require("node-notifier");
const path = require("path");
const {exec, execSync} = require('child_process');

class Beech {
  constructor() {
    this.embed(process.argv)
      .then(() => this.init()
        .then(status => console.log(status))
        .catch(err => {
          throw err;
        })
      );
  }

  init() {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.option == "serve") {
          // start service //  ./node_modules/beech-api/packages/cli/beech          
          /* this.cmd.get('node ./node_modules/beech-api/packages/cli/beech', (err, data) => {
            if (err) { throw err }
            console.log(data);
            resolve(data);
            //this.successfully();
          }); */


          /* exec("npx supervisor ./cli/core/index.js", async (error, stdout, stderr) => {
            // command output is in stdout
            console.log(error, stdout, stderr);
          }); */



          //exec("node ./cli/core/index.js", (err, stdout, stderr) => {
          /* exec("npx nodemon -q ./cli/core/index.js", (err, stdout, stderr) => {
            if (err) {
              // node couldn't execute the command
              logUpdate(err.message);
              reject(err);
            } else if (stderr) {
              logUpdate(stderr.message);
              reject(stderr);
            }
            // the *entire* stdout and stderr (buffered)
            logUpdate(`stdout: ${stdout}`);
          }); */

          let shoutOut = this.cmd.run("npx run node ./cli/core/index.js");
          console.log(shoutOut);

          let dataLine = "";
          shoutOut.stdout.on('data', (data) => {
            dataLine += data;
            logUpdate(dataLine);
          });


          /* notifier.notify({
            title: 'Beech API',
            subtitle: 'Beech service getting started.',
            message: "Service getting started.",
            sound: 'Funk',
            wait: false,
            icon: path.join(__dirname, "/../../public/icon/beech_128.png"),
            contentImage: path.join(__dirname, "../../public/icon/beech_128.png"),
          }); */


          /* (`node -v`, (err, data, stderr) => {
                console.log('examples dir now contains the example file along with : ',data, stderr)
            }
        ); */

        } else if (!this.option || this.option == "-h" || this.option == "?" || this.option == "--help") {
          // help for see avaliable command
          this.help()
            .then(help => resolve(help))
            .catch(err => reject(err));
        } else {
          resolve("\n[101m Faltal [0m commnad it's not available.");
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /* successfully() {
    clear();
    console.log("[94mBeech CLI v" + require(__dirname + "/../../../package.json").version);
    console.log('\n[102m[90m Passed [0m[0m The project has been successfully created.\n\n  [37m$[0m [36mcd ' + this.argument + '[0m\n  [37m$[0m [36mnpm start[0m or [36myarn start[0m');
  } */

  help() {
    return new Promise((resolve, reject) => {
      try {
        this.fs.readFile(__dirname + "/../core/generator/_service", "utf8", (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  embed(argv) {
    return new Promise((resolve, reject) => {
      try {
        this.fs = require("fs");
        this.cmd = require('node-cmd');
        this.argv = argv;
        this.option = argv[ 2 ];
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }
}

new Beech();