[![N|Solid](https://i.ibb.co/NKxx9NQ/beech320.jpg)](https://github.com/bombkiml)

# Beech API framework

[![beech-api release](https://img.shields.io/github/v/release/bombkiml/beech-api)](https://github.com/bombkiml/beech-api/releases/)
[![PyPI license](https://shields.io/pypi/l/ansicolortags.svg)](https://github.com/bombkiml/beech-api/blob/master/README.md)

## What is Beech API ?

`Beech API` is a Node.js framework it's help you with very easy create API project under [Node.js](https://nodejs.org)

## Why Beech API ?

`Beech API` is a Very easy for using, very feather framework, easy to installation, easy to implementation, and high security.

## Tutorial

`Beech API` tutorial on [Youtube](https://www.youtube.com/channel/UCjBMmUfV6yF1dQkqXnCjn1g)

- [EP.0 Why Beech API ?, basic usage (old version)](https://youtu.be/gEw1Ay_WQR4)
- [EP.1 Setup enveronment & create project (new version 3.x.x)](https://youtu.be/Z7qaOJQ0a8g)
- EP.2 Beech API with CRUD (MySQL) `is comming soon..`
- EP.3 Beech API using security with Passport-JWT token
- EP.4 Beech API Unit testing

## Powered by Node.js & Express.js

![N|Solid](https://i.ibb.co/CQqYZkK/node-epressjs.jpg)

## Environment

- [`Node.js`](https://nodejs.org) >= 10.13.0+ (recommended)
- `npm` >= 6.4.1+ or `yarn` >= 1.22.4+

## Installation

Beech API requires Node.js version 8.9 or above (10.13.0+ recommended). You can manage multiple versions of Node on the same machine with [nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows). So, Let's go to install `beech api`

```sh
$ npm install beech-api -g
```

After installation, you will have access to the `beech-app` binary in your command line.
You can check you have the right version with this command:

```sh
$ beech-app --version
```

## Creating a project

create a new project run:

```sh
$ beech-app create hello-world
```

:grey_question: **Note:** The Beech API it's start server at [http://127.0.0.1:9000](http://127.0.0.1:9000) you can change new a port in `app.config.js` file.

:grey_question: **Note:** The Beech API will be generate ``app_secret`` key in ``app.config.js`` file, You can manual generate by use command ``$ beech key:generate``

## Part of generate file

After installation, you will have access to the `beech` binary in your command line.
The `beech` command has a number of options and you can explore them all by running:

```sh
$ beech --help
```

The `beech` command line available:

```
Usage:
  $ beech [options] [arguments] <special>

Options:
  ?|-h, --help                    Display this help message.
  -v, --version                   Display this application version.

The following commands are available:

  $ beech make <endpoint>         Create a new endpoints and unit test file,
                                  You might using <special> `--require=Model1,Model2,..`
                                  for require model file(s) in generate processing.
  $ beech make <model> --model    Create a new models file.
  $ beech make <helper> --helper  Create a new Helpers file.
  $ beech passport init           Initialize authentication with passport-jwt.
  $ beech add-on init             Initialize add-on file.
```

## Endpoints

The `endpoints` keep the endpoints basic request files currently support `GET`, `POST`, `PUT`, `PATCH` and `DELETE`.

So, you might create new endpoints with constant `endpoint` object variable in `src/endpoints/` folder and file neme must be end with `-endpoints.js`

``sh
$ beech make endpointName
``

**Example:** Fruits endpoints.

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

    ...

  }
```

:grey_question: **Note:** Inside the endpoints file must be export `init()` function for initialize the the endpoints.

## Models

The `models` keep the files of function(s) for retriving, inserting, updating and deleting with SQL data. for understanding you might make model name same your table name in `src/models` folder.

``sh
$ beech make modelName --model
``

**Example:** Fruits model.

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

The `helpers` keep the files of functions for process specific something in the project. So, you might create the `helpers` in path `src/helpers` folder.

``sh
$ beech make modelName --model
``

**Example:** Text editor helper.

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

## Authentication (passport-jwt)

Passport is authentication middleware for Node. It is designed to serve a singular purpose: authenticate requests. When writing modules, encapsulation is a virtue, so Passport delegates all other functionality to the application. This separation of concerns keeps code clean and maintainable, and makes Passport extremely easy to integrate into an application.

Passport-jwt initiation :

```
$ beech passport init
```

After passport initialized the `passport.config.js` it's appeared

```js
module.exports = {
  // allow using passport-jwt
  jwt_allow: true,

  // custom authenticaiton endpoint name, default `/authentication`
  auth_endpoint: "",

  // your jwt secret key
  secret: "your_jwt_secret",

  // token expiry time (seconds), default 86400 sec. it's expired in 24 hr.
  token_expired: 86400,

  model: {
    // your mysql connection name inside `app.config.js` file (users table storage)
    name: "default_db",

    // table name of users store, default table `users`
    table: "",

    // secret user store field for authenticate, default field `username` and `password`
    username_field: "",
    password_field: "",

    // show fields, default show fields ["id", "name", "email"]
    fields: []
  },

  // allow using with app_secret requset (Every request need app_secret parameter)
  app_secret_allow: false

  ...

};
```

Simple ``users`` table:
```
==============================================================
|  id  |  username | password |     name     |     email     |
--------------------------------------------------------------
|  1   |  bombkiml |  secret  | bombkiml NC. | bomb@bomb.com |
|  2   |  johnson  |  secret  | johnson BA.  | john@bomb.com |
```

You can easy management `users` data with Beech helper just define below:
```js
  const Beech = require("beech-api").User;
```

- Store users with ``store()``
```js
  // store users
  var data = {
    username: "bombkiml",
    password: "secret",
    name: "bombkiml nc.",
    email: "bomb@bomb.com"
  }

  Beech.store(data, (err) => {
    if (err) throw err;
  });
```

- Update users with ``update()``
```js
  // update users
  var data = {
    password: "new_secret",
    name: "bombkiml NC.",
    email: "bombkiml@bomb.com"
  }

  Beech.update(data, id, (err) => {
    if (err) throw err;
  });
```

## Beech with Official Strategy

Latest supported with ``Google`` and ``Facebook`` Strategy.


### Google Strategy


The Google OAuth 2.0 authentication strategy authenticates users using a Google account and OAuth 2.0 tokens. The strategy requires a verify callback, which accepts these credentials and calls done providing a user, as well as options specifying a client ID, client secret, and callback URL.

Before your application can make use of Sign In With Google, you must register your app with Google. This can be done in the [APIs & Services](https://console.cloud.google.com/apis) page of the [Google Cloud Platform console.](https://console.cloud.google.com/) Once registered, your app will be issued a client ID and secret which will be used in the strategy configuration.

Go to open file ``passport.config.js`` and go to ``google strategy`` then turn allow Google Strategy is ``allow: true`` something like this.

```js
  // passport.config.js

  ...

  strategy: {

    google: {

      // Allow using google strategy
      allow: true,

      // Local user profile fields, default fields name: `name`, `email`, `photos`, `locate`
      local_profile_fields: {
        google_id: "google_id", // Google ID field, default field name: `google_id`
        name: "name",
        email: "email",
        photos: "profile_url",
        locate: "" // If you not store set to null
      },
      // Google development Credentials OAuth 2.0 Client IDs
      client_id: "GOOGLE_CLIENT_ID",
      client_secret: "GOOGLE_CLIENT_SECRET",
      // Callback endpoint default `/google/callback`
      callbackURL: "",
      // Failure redirect to your route
      failureRedirect: "/login"
    }
  }

  ...
    
```

The above code is a configures and registers the Google Strategy.

- ``allow`` : Turn on/off the Google Strategy config type of ``boolean`` switch by ``true/false``.
- ``google_id`` : Local Google ID field for store Google ID in my local database default field is ``google_id``.
- ``local_profile_fields`` : Local Profile fields for store Google user details.
- ``client_id`` and ``client_secret`` : The options to the Google Strategy constructor must include a ``clientID`` and ``clientSecret``, the values of which are set to the client ID and secret that were obtained when registering your application.
- ``callbackURL`` : When registering your application. A callbackURL must also be included. Google will redirect users to this location after they have authenticated.
- ``failureRedirect`` : When registering your application somthing failure it's redirect to that.

Place a button on the application's login page, prompting the user to sign in with Google.

```html
<a href="/authentication/google" class="button">Sign in with Google</a>
```

:grey_question: **Note:** The URL "``/authentication``" will be follow by ``auth_endpoint`` when you custom it.


### Facebook Strategy


Facebook Login allows users to sign in using their Facebook account. Support for Faceboook Login is provided by the ``passport-facebook`` package.

Before your application can make use of Facebook Login, you must register your app with Facebook. This can be done in the [App dashboard](https://developers.facebook.com/apps) at [Facebook for Developers.](https://developers.facebook.com/) Once registered, your app will be issued an app ID and secret which will be used in the strategy configuration.

Go to open file ``passport.config.js`` and go to ``facebook strategy`` then turn allow Facebook Strategy is ``allow: true`` something like this.

```js
  // passport.config.js

  ...

  strategy: {

    facebook: {

      // Allow using facebook strategy
      allow: true,

      // Local user profile fields, default fields name: `name`, `email`, `photos`, `locate`
      local_profile_fields: {
        facebook_id: "facebook_id", // Facebook ID field, default field name: `facebook_id`
        name: "name",
        email: "email",
        photos: "profile_url",
        locate: "" // If you not store set to null
      },
      // Facebook development Credentials OAuth 2.0
      app_id: "FACEBOOK_APP_ID",
      app_secret: "FACEBOOK_APP_SECRET",
      // Allow Permissions facebook profile fields: see more (https://developers.facebook.com/docs/graph-api/reference/v13.0/user#readperms)
      profileFieldsAllow: [ 'id', 'displayName', 'name', 'photos', 'email', 'location' ],
      // Callback endpoint default `/facebook/callback`
      callbackURL: "",
      // Failure redirect to your route
      failureRedirect: "/login"
    }
  }

  ...

```

The above code is a configures and registers the Facebook Strategy.

- ``allow`` : Turn on/off the Facebook Strategy config type of ``boolean`` switch by ``true/false``.
- ``facebook_id`` : Local Facebook ID field for store Facebook ID in my local database default field is ``facebook_id``.
- ``local_profile_fields`` : Local Profile fields for store Facebook user details.
- ``app_id`` and ``app_secret`` : The options to the Facebook Strategy must include an app ID and secret. you must register your app with Facebook. This can be done in the [App dashboard](https://developers.facebook.com/apps) at [Facebook for Developers.](https://developers.facebook.com/) Once registered, your app will be issued an ``app ID`` and ``secret`` which will be used in the strategy configuration.
- ``profileFieldsAllow`` : Permissions with Facebook Login. You must allow Permissions facebook profile fields: see more (https://developers.facebook.com/docs/graph-api/reference/v13.0/user#readperms)
- ``callbackURL`` : When registering your application. A callbackURL must also be included. Facebook will redirect users to this location after they have authenticated.
- ``failureRedirect`` : When registering your application somthing failure it's redirect to that.

Place a button on the application's login page, prompting the user to sign in with Facebook.

```html
<a href="/authentication/facebook" class="button">Log In With Facebook</a>
```

:grey_question: **Note:** The URL "``/authentication``" will be follow by ``auth_endpoint`` when you custom it.



## Databases managements

### # Migrations & Seeder

Just like you use Git / SVN to manage changes in your source code, you can use migrations to keep track of changes to the database. With migrations you can transfer your existing database into another state and vice versa: Those state transitions are saved in migration files, which describe how to get to the new state and how to revert the changes in order to get back to the old state.

You will need [Sequelize CLI.](https://github.com/sequelize/cli) The CLI ships support for [migrations](https://sequelize.org/v5/manual/migrations.html) and project.

### # Usage

To create an empty project you will need to execute `init` command

```sh
$ npx sequelize-cli init
```

This will create following folders inside `databases` folder.

- `config`, contains config file, which tells CLI how to connect with database.
- `models`, contains all models for your project.
- `migrations`, contains all migration files.
- `seeders`, contains all seed files.

### # Configuration

Before continuing further we will need to tell CLI how to connect to database. To do that let's open default config file `databases/config/database.json` It looks something like this:

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

:grey_question: **Note:** The database connect default port 3306 if you another port you can add object ``port`` in config.

:grey_question: **Note:** If your database doesn't exists yet, you can just call `npx sequelize-cli db:create` command. With proper access it will create that database for you.

### # Creating first Migrations

Create `model` use `model:generate` command. This command requires two options.

- `--name`, Name of the model
- `--attributes`, List of model attributes

Let's create a model name example `User`. See more about of [Datatypes](https://sequelize.org/v5/manual/data-types.html)

```sh
$ npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string,birhday:date
```

### # Migrations Up and Down

Until this step, we haven't inserted anything into the database. We have just created required model and migration files for our first model User.

- **Migrate Up** : you can create that table in database you need to run db:migrate command.

  ```sh
  $ npx sequelize-cli db:migrate
  ```

- **Migrate Down** : you can use `db:migrate:undo`, this command will revert most recent migration.
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

- **Seed Up** : you can execute that seed file and you will have a user inserted into `User` table.

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

So, When you make the new endpoints it's automatic create test file end with `.spec.js` in `__test__` folder with constant `baseUrl` variable and `axios` package.

Example endpoints testing

```js
// fruits-endpoints.spec.js

const endpoint = baseUrl.concat("/fruits/fruits");

describe("Test endpoint : " + endpoint, () => {
  it("Truthy!", () => {
    expect("/fruits/fruits").toBeTruthy();
  });

  it("Respond with basic GET status code 200", (done) => {
    axios.get(endpoint).then((res) => {
      expect(200).toEqual(res.data.code);
      done();
    });
  });
});
```


## Implementation
  
### # Implement with [PM2](https://pm2.keymetrics.io/)
[PM2](https://pm2.keymetrics.io/) is a daemon process manager that will help you manage and keep your application online. Getting started with PM2 is straightforward, it is offered as a simple and intuitive CLI, installable via [NPM](https://www.npmjs.com/).

```sh
# Start service as standalone
$ pm2 start ./node_modules/beech-api/packages/cli/beech --name <serviceName>

# OR

# Start service as cluster mode
$ pm2 start ./node_modules/beech-api/packages/cli/beech --name <serviceName> -i <instances>
```

### # Implement with [Docker](https://www.docker.com)

[Docker](https://www.docker.com) is an open platform for developing, shipping, and running applications. Docker enables you to separate your applications from your infrastructure so you can deliver software quickly.

- **Create Dockerfile**

Docker builds images automatically by reading the instructions from a Dockerfile -- a text file that contains all commands, in order, needed to build a given image. A Dockerfile adheres to a specific format and set of instructions which you can find at [Dockerfile reference](https://docs.docker.com/engine/reference/builder/).

```js
// Dockerfile

FROM node:12.18-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/api
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules .
COPY . .
EXPOSE 9000
CMD ["node", "./node_modules/beech-api/packages/cli/beech"]
```

- **Docker build image**

The docker build command builds an image from a Dockerfile and a context. The build’s context is the set of files at a specified location ```PATH``` or ```URL```. The PATH is a directory on your local filesystem. The URL is a Git repository location.

```sh
$ docker build -t <imageName> .
```

:grey_question: **Note:** You can specify a repository and tag at which to save the new image : ``` $ docker build -t <imageName>:<tags> . ```

- **Run docker**

  After create ``image`` you can run docker engine following :

  - **Docker Container (Standalone)**
  ```sh
  $ docker run -d -p 9000:9000 --name <containerName> <imageName>
  ```

  - **Create Docker Swarm (Cluster)**
  ```sh
  # Initiate swarm
  $ docker swarm init
  
  # Run docker service
  $ docker service create --replicas <instances> --name <containerName> --publish 9000:9000 <imageName>
  ```


## Bonus

Free `helpers` you can make [LINE Notify](https://github.com/Yuhsak/line-api#readme) by using [line-api](https://notify-bot.line.me/en/) package with create the helper function following.

Installation the package:

```
$ npm install line-api
```

Create file `Line.js` in `src/helpers` folder and copy code below:

```js
// Line.js

const Line = require("line-api");

module.exports = {

  notify(message, token) {
    const notify = new Line.Notify({
      token: token
    });
    notify
      .send({
        message: message
      })
      .then(console.log);
  }

};
```

Enjoy.

## Development

Want to contribute or join for great job!, You can contact to me via

- GitHub: [bombkiml/beech-api - issues](https://github.com/bombkiml/beech-api/issues)
- E-mail: nattapat.jquery@gmail.com
- Facebook: [https://www.facebook.com/bombkiml](https://www.facebook.com/bombkiml)

## License

The Beech API framework is open-sourced software licensed under the [MIT license.](https://opensource.org/licenses/MIT)
