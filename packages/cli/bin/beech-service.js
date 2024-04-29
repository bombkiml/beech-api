#!/usr/bin/env node
const logUpdate = require("log-update");
const notifier = require("node-notifier");
const path = require("path");
const express = require("express");
const _app_ = express();

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
          let turnNoti = true;
          if (this.argument == "--silent" || this.argument == "-S") {
            turnNoti = false;
          }
          // check project config file exists ?
          if (this.fs.existsSync(this.configFile)) {
            let testServ = require("http").createServer(_app_);
            testServ.listen(this._config_.main_config.app_port, async () => {
              await testServ.close();
              // Start real service.
              await this.serviceDevStart(this.argument);
              // check turn on nofi
              if (turnNoti) {
                this.notiCompile();
              }
            }).on('error', (err) => {
              console.log("\n[101m Faltal [0m", err);
            })
          } else {
            resolve("\n[101m Faltal [0m The app.conifg.js file is not found.");
          }
        } else if (!this.option || this.option == "-h" || this.option == "?" || this.option == "--help") {
          // help for see avaliable command
          this.help()
            .then(help => resolve(help))
            .catch(err => reject(err));
        } else if (this.option == "build") {
          resolve("\n[101m Notic. [0m The commnad it's not supported, Please wait for next version.");
        } else {
          // help for see avaliable command
          this.help()
            .then(help => resolve(help))
            .catch(err => reject(err));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  serviceDevStart(argument) {
    logUpdate("[36mCompiling...[0m");
    let promise = null;
    // check Dev. run service
    const spawnData = new Promise((resolve) => {
      if(argument == "-D" || argument == "--dev") {
        promise = this.spawn('npx', ['nodemon', '-q', './cli/beech']); // For Dev.
      } else {
        promise = this.spawn('npx', ['nodemon', '-q', './node_modules/beech-api/packages/cli/beech']); // For Prd.
      }
      resolve(promise.childProcess);
    });
    Promise.all([spawnData]).then((childProcess) => {
      childProcess[0].stdout.on('data', (data) => {
        console.log(data.toString().slice(0, -1));
      });
      childProcess[0].stderr.on('data', (data) => {
        if(data.toString().slice(0, 8) != "Ignoring" && data.toString().match(/\[SEQUELIZE0006\]/g) != "[SEQUELIZE0006]") {
          console.log(data.toString());
        }
      });
    });
  }

  notiCompile() {
    notifier.notify({
      title: 'Beech API',
      subtitle: 'Beech service getting started.',
      message: "Service getting started.",
      sound: 'Funk',
      wait: false,
      icon: path.join(__dirname, "/../../public/icon/beech_128.png"),
      contentImage: path.join(__dirname, "../../public/icon/beech_128.png"),
    });
  }

  help() {
    return new Promise((resolve, reject) => {
      try {
        this.fs.readFile(__dirname + "/../core/generator/_help_service", "utf8", (err, data) => {
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
        this.spawn = require('child-process-promise').spawn;
        this.argv = argv;
        this.option = argv[ 2 ]; // serve|build
        this.argument = argv[ 3 ]; // --silent -S | --dev -D
        this.configFile = path.resolve("./app.config.js");
        this._config_ = require(this.configFile);
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }
}

new Beech();
