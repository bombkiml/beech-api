  [![N|Solid](https://i.ibb.co/NKxx9NQ/beech320.jpg)](https://github.com/bombkiml)
# Beech API framework
[![beech-api release](https://img.shields.io/github/v/release/bombkiml/beech-api.svg)](https://github.com/bombkiml/beech-api/releases/)
[![PyPI license](https://img.shields.io/pypi/l/ansicolortags.svg)](https://github.com/bombkiml/beech-api/blob/master/README.md)
## What is Beech API ?
  ``Beech API`` is a Node.js framework it's help you with very easy create API project under [Node.js](https://nodejs.org)

## Why Beech API ?
  ``Beech API`` is a Very easy for using, very feather framework, easy to installation, easy to implementation, and high security.

## Powered by Node.js & Express.js
  ![N|Solid](https://i.ibb.co/CQqYZkK/node-epressjs.jpg)

## Environment
  - [``Node.js``](https://nodejs.org) >= 8.11.0+ (recommended)
  - ``npm`` >= 8.9 or ``yarn`` >= 1.22

## Installation
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

## Creating a project
  create a new project run:
  
  ```sh
  $ beech-app create hello-world
  ```

:grey_question: Tips: The Beech API it's start server at [http://127.0.0.1:9000](http://127.0.0.1:9000) you can change new a port in ``app.config.js`` file. |
------------ |

## Part of generate file
  After installation, you will have access to the ``beech`` binary in your command line.
  The ``beech`` command has a number of options and you can explore them all by running:
  
  ```sh
  $ beech --help
  ```
    
  The ``beech`` command line available:
  
  ```
  Usage:
    $ beech [options] [arguments] <special>

  Options:
    ?|-h, --help                    Display this help message
    -v, --version                   Display this application version

  The following commands are available:

    $ beech make <endpoint>         Create a new endpoints and unit test file,
                                    You might using <special> `--require=Model1,Model2,..`
                                    for require model file(s) in generate processing
    $ beech make <model> --model    Create a new models file
  ```  

## Endpoints
  The ``endpoints`` keep the endpoints basic request files currently support ``GET``, ``POST``, ``PUT``, ``PATCH`` and ``DELETE``. 
  
  So, you might create new endpoints with constant ``endpoint`` object variable in ``src/endpoints/`` folder and file neme must be end with ``-endpoints.js``
  
  ```js
    // fruits-endpoints.js
    
    exports.init = () => {
    
      /@GET/
      endpoint.get('/fruits', (req, res) => {
        ...      
      });
      
      /@POST/
      endpoint.post('/fruits', (req, res) => {
        ...      
      });

    }
  ```
  
:grey_question: Tips: Inside the endpoints file must be export ``init()`` function for initialize the the endpoints. |
------------ |

## Models
  The ``models`` keep the files of function(s) for retriving, inserting, updating and deleting with SQL data. for understanding you might make model name same your table name in ``src/models`` folder.
  
  ```js
    // Fruits.js
    
    module.exports = {

      // Example basic function get data
      getData() {
        return { ... }
      },
      
      // Example basic function get data from MySQL (must be return promise)
      getFruits() {
        return new Promise((resolve, reject) => {
          try {          
            // call mysql `default_db` connection
            mysql.default_db.query("SELECT * FROM fruits", (err, results) => {
              if (err) { reject(err) }
              resolve(results);
            });            
          } catch (error) {
            reject(error);
          }
        });
      }
      
    };
  ```

## Helpers
  The ``helpers`` keep the files of functions for process specific something in the project. So, you might create the ``helpers`` in path ``src/helpers`` folder.
  
  Example text editor helper:
  
  ```js
    // TextEditor.js
    
    module.exports = {
      
      textUpperCase(text) {
        return text.toUpperCase();
      },
      textTrim(text) {
        return text.trim();
      },
      ...
      
    };
  ```

## Bonus
  Free ``helpers``you can make [LINE Notify](https://github.com/Yuhsak/line-api#readme) by using [line-api](https://notify-bot.line.me/en/) package with create the helper function following.
  
  Installation the package:
  
  ```
  $ npm install line-api
  ```
  
  Create file ``Line.js`` in ``src/helpers`` folder and copy code below:
  
  ```js
  // Line.js
  
  const Line = require('line-api');

  module.exports = {
    notify(message, token) {    
      const notify = new Line.Notify({
        token: token
      });
      notify.send({
        message: message
      })
      .then(console.log)
    }
  };
  ```
  
  Enjoy.

## Databases managements
  ### # Migrations & Seeder
   Just like you use Git / SVN to manage changes in your source code, you can use migrations to keep track of changes to the database. With migrations you can transfer your existing database into another state and vice versa: Those state transitions are saved in migration files, which describe how to get to the new state and how to revert the changes in order to get back to the old state.

   You will need [Sequelize CLI.](https://github.com/sequelize/cli) The CLI ships support for [migrations](https://sequelize.org/v5/manual/migrations.html) and project.

  ### # Usage 
   To create an empty project you will need to execute ```init``` command
  ```sh
  $ npx sequelize-cli init
  ```

   This will create following folders inside ``databases`` folder.

   - ``config``, contains config file, which tells CLI how to connect with database.
   - ``models``, contains all models for your project.
   - ``migrations``, contains all migration files.
   - ``seeders``, contains all seed files.

  ### # Configuration
   Before continuing further we will need to tell CLI how to connect to database. To do that let's open default config file ``databases/config/database.json`` It looks something like this:
   
  ```
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
  **Note:** If your database doesn't exists yet, you can just call ``npx sequelize-cli db:create`` command. With proper access it will create that database for you.
  
  ### # Creating first Migrations
   Create ``model`` use ``model:generate`` command. This command requires two options.
   
   - ``name``, Name of the model
   - ``attributes``, List of model attributes
   
   Let's create a model named example ``User``.
   
  ```sh
  $ npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
  ```
  
  ### # Migrations Up and Down
   Until this step, we haven't inserted anything into the database. We have just created required model and migration files for our first model User.
   - **Migrate Up** : you can create that table in database you need to run db:migrate command.
      ```sh  
      $ npx sequelize-cli db:migrate
      ```

   - **Migrate Down** : you can use ``db:migrate:undo``, this command will revert most recent migration.
      ```sh  
      $ npx sequelize-cli db:migrate:undo
      ```

  ### # Creating First Seeder
   To manage all data migrations you can use seeders. Seed files are some change in data that can be used to populate database table with sample data or test data. 
   
   Let's create a seed file which will add a demo user to our User table.
  ```sh
  $ npx sequelize-cli seed:generate --name user
  ```
  
  ### # Seeder Up and Down
   In last step you have create a seed file. It's still not committed to database. To do that we need to run a simple command.
   - **Seed Up** : you can execute that seed file and you will have a user inserted into ``User`` table.
      ```sh
      $ npx sequelize-cli db:seed:all
      ```
  
   - **Seed Down** : seeders can be undone if they are using any storage. There are two commands available for that:
   
      If you wish to undo most recent seed
      ```sh
      $ npx sequelize-cli db:seed:undo
      ```
      If you wish to undo a specific seed
      ```
      $ npx sequelize-cli db:seed:undo --seed <seederName>
      ```
      If you wish to undo all seeds
      ```sh
      $ npx sequelize-cli db:seed:undo:all
      ```

## Testing
  Test using [Jest](https://jestjs.io/en/) for testing the project. Jest is a delightful JavaScript Testing Framework with a focus on simplicity. Learn more [Jest docs](https://jestjs.io/docs/en/getting-started.html)
  
  So, When you make the new endpoints it's automatic create test file end with ``.spec.js`` in ``__test__`` folder with constant ``baseUrl`` variable and ``axios`` package.
  
  Example endpoints testing
  
  ```js
    // fruits-endpoints.spec.js
    
    const endpoint = baseUrl.concat('/fruits/fruits');
    
    describe('Test endpoint : ' + endpoint, () => {
      it('Truthy!', () => {
        expect('/fruits/fruits').toBeTruthy();
      });

      it("Respond with basic GET status code 200", (done) => {
        axios.get(endpoint)
          .then((res) => {
            expect(200).toEqual(res.data.code);
            done();
          })
      });
    });    
    
  ```

## Development
Want to contribute or join for great job!, You can contact to me via
  - GitHub: [bombkiml/beech-api - issues](https://github.com/bombkiml/beech-api/issues)
  - E-mail: nattapat.jquery@gmail.com 
  - Facebook: [https://www.facebook.com/bombkiml](https://www.facebook.com/bombkiml)

## License
The Beech API framework is open-sourced software licensed under the [MIT license.](https://opensource.org/licenses/MIT)
