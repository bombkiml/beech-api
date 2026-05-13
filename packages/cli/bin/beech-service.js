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
          // Show comiling msg
          const frames = ['\n[36m[-] Compiling[0m', '\n[36m[\\] Compiling.[0m', '\n[36m[|] Compiling..[0m', '\n[36m[/] Compiling...[0m'];
          let i = 0;
          var refreshCompileIntervalId = setInterval(() => {
            const frame = frames[i = ++i % frames.length];
            logUpdate(`${frame}`);
          }, 300);
          // option logic for silent notify
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
              this.serviceDevStart(this.argument, (err, run) => {
                if(!err && run) {
                  // Check turn on noti
                  if (turnNoti) {
                    this.notiCompile();
                  }
                  // Delay for new replace Compiling msg to Running
                  setTimeout(() => {
                    clearInterval(refreshCompileIntervalId);
                    logUpdate("\n[36m[OK] Running...[0m");
                  }, 1500);
                } else {
                  setTimeout(() => {
                    clearInterval(refreshCompileIntervalId);
                    logUpdate("\n[101m[ERR] Failed... [0m", err);
                    reject();
                  }, 1000);
                }
              });
            }).on('error', (err) => {
              clearInterval(refreshCompileIntervalId);
              console.log("\n[101m Faltal [0m", err);
              reject();
            })
          } else {
            clearInterval(refreshCompileIntervalId);
            resolve("\n[101m Faltal [0m The app.conifg.js file is not found.");
          }
        } else if (!this.option || this.option == "-h" || this.option == "?" || this.option == "--help") {
          // help for see avaliable command
          this.help()
            .then(help => resolve(help))
            .catch(err => reject(err));
        } else if (this.option == "build") {
          this.runBuild()
            .then(() => resolve("\n[32m[OK] Build completed successfully. [0m"))
            .catch(err => reject(`\n[101m[ERR] Build failed [0m: ${err}`));
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

  serviceDevStart(argument, cb) {



//TODO run app ubuntu shout not show



    let promise = null;
    try {
      const spawnData = new Promise((resolve) => {
        // check Dev. run service
        if(argument == "-D" || argument == "--dev") {
          console.log("\n[101m  Starting Beech service in Development mode  [0m");
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
        // Check process error
        childProcess[0].stderr.on('data', (data) => {
          // Check Error from std Allow for Mysql version error
          if(data.toString().slice(0, 8) != "Ignoring" && data.toString().match(/\[SEQUELIZE0006\]/g) != "[SEQUELIZE0006]") {
            if(data.toString().slice(0, 13) == "node:internal") {
              cb(data.toString(), false);
            } else {
              console.log(data.toString());
            }
          }
        });
        // Callback first
        cb(null, true);
      });
    } catch (error) {
      cb(error, false);
    }
  }

  async runBuild() {
    const esbuild = require("esbuild");
    const { glob } = require("glob");
    const JavaScriptObfuscator = require("javascript-obfuscator");
    const fs = require("fs");
    const path = require("path");
    const appRoot = require("app-root-path");
    const _config_ = require(appRoot + "/app.config");
    const beechTxtPath = path.join("./node_modules/beech-api/packages/cli/entry");
    console.log("\n[33m[Obf] Starting Beech Secure Build... [0m\n");
    try {
      const projectFiles = glob.sync("{src/**/*.js,*.config.js}", {
        ignore: ["node_modules/**", "dist/**", "cli/**"],
        posix: true
      });
      // Check file exists to build
      if (fs.existsSync(beechTxtPath)) {
        projectFiles.push(beechTxtPath);
      } else {
        console.log("[101m[!] Warning: Beech entry not found at: [0m", beechTxtPath);
      }
      if (projectFiles.length === 0) {
        console.log("[101m[!] No files found to build. [0m");
        return true;
      }
      const MY_BUILD_SEED = _config_.main_config.app_key;
      for (const file of projectFiles) {
        let codeToObfuscate = "";
        let fileName = file;
        if (file === beechTxtPath) {
          codeToObfuscate = fs.readFileSync(file, "utf8");
          fileName = "server.js";
        } else {
          // Log file being processed
          console.log(`[36m[+] dist/${file} [0m`);
          const result = await esbuild.build({
            entryPoints: [file],
            bundle: false,
            minify: true,
            platform: "node",
            format: "cjs",
            write: false,
          });
          codeToObfuscate = result.outputFiles[0].text;
          fileName = file;
        }
        const obfuscatedResult = JavaScriptObfuscator.obfuscate(codeToObfuscate, {
          compact: true,
          seed: MY_BUILD_SEED,
          identifierNamesGenerator: 'hexadecimal',
          renameGlobals: false,
          stringArray: true,
          stringArrayEncoding: ['base64'],
          stringArrayThreshold: 0.8,
          unicodeEscapeSequence: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          numbersToExpressions: false,
          splitStrings: false,
          selfDefending: false,
          simplify: true,
        });
        const outPath = path.join("dist", fileName);
        const outDir = path.dirname(outPath);
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(outPath, obfuscatedResult.getObfuscatedCode());
      }
      // Copy package.json
      if (fs.existsSync("./package.json")) {
        fs.copyFileSync("./package.json", "./dist/package.json");
      }
      return true;
    } catch (error) {
      console.log("\n[101m[ERR] Build Error [0m", error.message);
      throw error;
    }
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
