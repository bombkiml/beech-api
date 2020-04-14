  [![N|Solid](https://i.ibb.co/FzcMFd8/beech128x412.jpg)](https://github.com/bombkiml)
# Beech API framework
[![beech-api release](https://img.shields.io/github/v/release/bombkiml/beech-api.svg)](https://github.com/bombkiml/beech-api/releases/)
[![PyPI license](https://img.shields.io/pypi/l/ansicolortags.svg)](https://github.com/bombkiml/beech-api/blob/master/README.md)
### What is Beech API ?
  ``Beech API`` is a Node.js framework it's help you with very easy create API project under [Node.js](https://nodejs.org)
#
### Why Beech API ?
  ``Beech API`` is a Very easy for using, very feather framework, easy to installation, easy to implementation, and high security
#
### Powered by Node.js & Express.js
  ![N|Solid](https://i.ibb.co/CQqYZkK/node-epressjs.jpg)
#
### Environment
  - [``Node.js``](https://nodejs.org) >= 8.11.0+ (recommended)
  - ``npm`` >= 8.9 or ``yarn`` >= 1.22
#
### Installation
  Beech API requires Node.js version 8.9 or above (8.11.0+ recommended). You can manage multiple versions of Node on the same machine with [nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows). So, Let's go to install ``beech api``
  
  ```sh
  $ npm install beech-api -g
  # OR
  $ yarn global add beech-api
  ```
    
  After installation, you will have access to the ``beech-app`` binary in your command line.
    You can check you have the right version with this command:
    
  ```sh
  $ beech-app --version
  ```
#
### Creating a project
  create a new project run:
  
  ```sh
  $ beech-app create hello-world
  ```

  :grey_question: Tips: The Beech API it's start server at [http://127.0.0.1:9000](http://127.0.0.1:9000) you can change new a port in ``app.config.js`` file |
------------ |
#
### Part of generate file
  After installation, you will have access to the ``beech`` binary in your command line.
  The ``beech`` command has a number of options and you can explore them all by running:
  
  ```sh
  $ beech --help
  ```
    
  The ``beech`` command line available:
  
  ```sh
  Usage:
    $ beech [options] [arguments] <special>

  Options:
    ?|-h, --help                Display this help message
    -v, --version               Display this application version

  The following commands are available:

    $ beech make <endpoint>       Create a new endpoints and unit test file,
                                  You might using <special> `--require=Model1,Model2,..`
                                  for require model file(s) in generate processing
    $ beech make <model> --model  Create a new models file
  ```  
#
### Databases
  #### Migrations & Seeder
   Just like you use Git / SVN to manage changes in your source code, you can use migrations to keep track of changes to the database. With migrations you can transfer your existing database into another state and vice versa: Those state transitions are saved in migration files, which describe how to get to the new state and how to revert the changes in order to get back to the old state.

   You will need [Sequelize CLI.](https://github.com/sequelize/cli) The CLI ships support for migrations and project.

  #### Usage 
   To create an empty project you will need to execute ```init``` command
  ```sh
  $ npx sequelize-cli init
  ```

   This will create following folders

   - ``config``, contains config file, which tells CLI how to connect with database
   - ``models``, contains all models for your project
   - ``migrations``, contains all migration files
   - ``seeders``, contains all seed files

  #### Configuration
   Before continuing further we will need to tell CLI how to connect to database. To do that let's open default config file ``config/config.json`` It looks something like this
   
  ```sh
  {
    "development": {
      "username": "root",
      "password": null,
      "database": "database_development",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "test": {
      "username": "root",
      "password": null,
      "database": "database_test",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "production": {
      "username": "root",
      "password": null,
      "database": "database_production",
      "host": "127.0.0.1",
      "dialect": "mysql"
    }
  }
  ```
  The ``sequelize`` command line available:
  ```sh
  $ npx sequelize [command]

  Commands:
    sequelize db:migrate                        Run pending migrations
    sequelize db:migrate:schema:timestamps:add  Update migration table to have timestamps
    sequelize db:migrate:status                 List the status of all migrations
    sequelize db:migrate:undo                   Reverts a migration
    sequelize db:migrate:undo:all               Revert all migrations ran
    sequelize db:seed                           Run specified seeder
    sequelize db:seed:undo                      Deletes data from the database
    sequelize db:seed:all                       Run every seeder
    sequelize db:seed:undo:all                  Deletes data from the database
    sequelize db:create                         Create database specified by configuration
    sequelize db:drop                           Drop database specified by configuration
    sequelize init                              Initializes project
    sequelize init:config                       Initializes configuration
    sequelize init:migrations                   Initializes migrations
    sequelize init:models                       Initializes models
    sequelize init:seeders                      Initializes seeders
    sequelize migration:generate                Generates a new migration file       [aliases: migration:create]
    sequelize model:generate                    Generates a model and its migration  [aliases: model:create]
    sequelize seed:generate                     Generates a new seed file            [aliases: seed:create]

  Options:
    --version  Show version number              [boolean]
    --help     Show help                        [boolean]
  ```
   
#
### Development
Want to contribute or join for great job!, You can contact to me via
  - GitHub: [bombkiml/beech-api - issues](https://github.com/bombkiml/beech-api/issues)
  - E-mail: nattapat.jquery@gmail.com 
  - Facebook: [https://www.facebook.com/bombkiml](https://www.facebook.com/bombkiml)
#
### License
The Beech API framework is open-sourced software licensed under the [MIT license.](https://opensource.org/licenses/MIT)
