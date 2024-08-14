[![N|Solid](https://i.ibb.co/NKxx9NQ/beech320.jpg)](https://github.com/bombkiml)

# Beech API framework

[![beech-api release](https://img.shields.io/github/v/release/bombkiml/beech-api)](https://github.com/bombkiml/beech-api/releases/)
[![PyPI license](https://shields.io/pypi/l/ansicolortags.svg)](https://github.com/bombkiml/beech-api/blob/master/README.md)

# What is Beech API ?

`Beech API` is a Node.js framework it's help you with very easy create API project under [Node.js](https://nodejs.org)

# Why Beech API ?

`Beech API` is a Very easy for using, very feather framework, easy to installation, easy to implementation, and high security.

## Powered by Node.js & Express.js

![N|Solid](https://i.ibb.co/CQqYZkK/node-epressjs.jpg)

# Environment

- [`Node.js`](https://nodejs.org) >= 14.19.0+ (recommended)

# Installation

Beech API requires Node.js version 14.19.0 or above. You can manage multiple versions of Node on the same machine with [nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows). So, Let's go to install `beech-api`

```sh
# NPM
$ npm install beech-api --global

# Yarn
$ yarn global add beech-api
```

Installation demo:

[Demo](https://i.ibb.co/hySFxy3/install-beech720-1.gif)
![Alt Text](https://i.ibb.co/hySFxy3/install-beech720-1.gif)

After installation, you will have access to the `beech-app` binary in your command line.
You can check you have the right version with this command:

```sh
$ beech-app --version
```

# Creating a project

Create a new project run:

```sh
$ beech-app create hello-world
```
Run your project:
```sh
$ cd hello-world

$ npm start
# OR
$ yarn start
```

❓ **Note:** The Beech API it's start server at [http://localhost:9000](http://localhost:9000) you can change new a port in `app.config.js` file.


# Upgrade to latest version
The Beech API upgrade to latest version command avariable :

```sh
// Project upgrade
$ beech-app update

// Global upgrade
$ beech-app update -g, --global
```

# Beech CLI tool available
After installation, you will have access to the `beech` binary in your command line.
The `beech` command has a number of options and you can explore them all by running:

```sh
$ beech --help
```

The `beech` command line available:

```
Usage:
  $ beech [options] [arguments] [special]

Options:
  ?, -h, --help                       Display this help message.
  -v, --version                       Display the application version.

The following commands are available:

  $ beech make <endpoint>             Create a new Endpoints and unit test file,
                                      You might using [special] `-R, --require`
                                      for choose Model(s) used to endpoint file.
  $ beech make <model> -M, --model    Create a new Models file.
  $ beech make <helper> --helper      Create a new Helpers file.
  $ beech passport init               Initialize authentication with passport-jwt.
  $ beech skd init                    Initialize Job Scheduler file.
  $ beech key:generate, key:gen       Re-Generate application key (Dangerous!).
  $ beech hash:<text>                 Hash text for Access to Database connection.
```
❓ **Note:** Every to create new project will be generated new ``app_key`` in ``app.config.js`` file, If you can re-generate. Can use command ``$ beech key:generate`` or ``$ beech key:gen``

# Database connection

You might connection to Database with `database_config` object in `app.config.js` file. Anything can support to multiple Database connections.

The connection base on `pool_base` in `global.config.js` file.

- `basic` = Support only Raw Query with Only MySQL.
- `sequelize` = Support PDO, Raw Query with various Database Engine.

In case Access to Database must to Hash the `username` and `password` with Beech CLI like this.

```sh
// Hash database username
$ beech hash:root
Output: m42BVxQ6Q4kLdRX7xS_Hm7WbQiNqShJDvw9SLCgI431oafWBtQJoJDnoCL

// Hash database password
$ beech hash:password
Output: FjgcgJPylkV7EeQJjea_EeifPwaHVO9onD3ATk3YYAyvjtMGu3dcDS0ejA

```
Example:

📂 app.config.js
```js
// basic & sequelize (needed Hash)

...

database_config: [
  {
    dialect: "mysql",
    name: "mysql_my_store_db",
    host: "localhost",
    username: "m42BVxQ6Q4kLdRX7xS_Hm7WbQiNqShJDvw9SLCgI431oafWBtQJoJDnoCL",
    password: "FjgcgJPylkV7EeQJjea_EeifPwaHVO9onD3ATk3YYAyvjtMGu3dcDS0ejA",
    database: "my_store_db",
    port: "3306",
    is_connect: true, // boolean, Turn ON/OFF to connect
  },

  ...

],

...
```
❓ **Caution! :**  Every re-new generate `app_key`. Must to new Hash your Access and change to ALL Database connections.

# Part of generate file

## # Generate Endpoints

The `endpoints` keep the endpoints basic request files currently support `GET`, `POST`, `PUT`, `PATCH` and `DELETE`.

So, you might create new endpoints with constant `endpoint` object variable in `src/endpoints/` folder and file neme must be end with `-endpoints.js`

```sh
$ beech make endpointName
```
You might using [special] `-R, --require` for choose Model(s) used for that endpoint.

### Example ***(Basic)*** : Fruit endpoints.

📂 fruit-endpoints.js
```js
exports.init = () => {

  // GET method
  endpoint.get("/fruit", Credentials, (req, res) => {
    // @response
    res.json({
      code: 200,
      status: "SUCCESS",
      message: "GET /fruit request.",
    });
  });


  // POST method
  endpoint.post("/fruit", Credentials, (req, res) => {
    // @response
    res.json({
      code: 200,
      status: "SUCCESS",
      message: "POST request at /fruit",
      result: {
        id: req.body.id,
        name: req.body.name,
      },
    });
  });


  // PUT method
  endpoint.put("/fruit/:id", Credentials, (req, res) => {
    // @response
    res.json({
      code: 200,
      status: "SUCCESS",
      message: "PUT request at /fruit/" + req.params.id,
    });
  });


  // DELETE method
  endpoint.delete("/fruit/:id", Credentials, (req, res) => {
    // @response
    res.json({
      code: 200,
      status: "SUCCESS",
      message: "DELETE request at /fruit/" + req.params.id,
    });
  });

  ...

}
```

### Example ***(Sequelize)*** : Fruit endpoints. 

📂 fruit-endpoints.js
```js
  // Require Model schema, Function & Others
  const { Fruit } = require("@/models/Fruit");

  exports.init = () => {

    // GET method
    endpoint.get('/fruit', async (req, res) => {
      // example call Fruit model for get data
      res.json({
        code: 200,
        status: "SUCCESS",
        results: await Fruit.findAll();
      });
    });

    ...

  }
```


## # Generate Models ###

The `models` keep the files of function(s) data managemnets for Retriving, Creating, Updating and Destroying (CRUD). for understanding you might make model name same your table name inside `src/models` folder.

```sh
$ beech make modelName --model
```

### Example ***(Basic)*** : Fruit model.

📂 Fruit.js
```js
module.exports = {

  // Example basic function get data
  getData() {

    return {
      id: 1,
      name: "John Doe",
    }

  },

  // Example basic function get data from MySQL table
  getFruit() {

    // calling Pool connection name by `mysql.default_db`
    mysql.default_db.query("SELECT * FROM fruit", (err, results) => {

      if (err) { throw err }
      return results;

    });

  }

};
```

### Example ***(Sequelize)*** : Fruit model.

  You can asign more DataTypes, Learn more : [Sequelize docs](https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types)

📂Fruit.js
```js
const { Schema } = require("beech-api");

// Define table Schema with `Schema(sql.default_db)` connection name
const Fruit = Schema(sql.default_db).define("fruit", {
  fruit_id: {
    field: "id", // Rename PK field to fruit_id Ref: `id` field in fruit table
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fruitName: DataTypes.STRING,
  fruitQty: DataTypes.INTEGER,
  fruitPrice: {
    type: DataTypes.INTEGER,
    allowNull: false, // Allow null feilds
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
});

Users.options = {
  // Allowment magic generate default endpoint (CRUD)
  defaultEndpoint: true, // boolean DEFAULT: true  👈 // It's like magic creating The endpoints for you (CRUD) ✨
  limitRows: 100, // Limit rows default
};

// Example Finder by id (ORM), Learn more: https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
function exampleFindOneFruitById(id) {
  return Fruit.findOne({ where: { id: id } });
}

// Example Raw Query, Learn more: https://sequelize.org/docs/v6/core-concepts/raw-queries/
function exampleGetAllFruit(id) {
  return Fruit.query("SELECT * FROM fruit");
}

// Example Raw Query with Model Instances. This allows you to easily map a query to a predefined model
function exampleGetAllFruitWithModelInstance(id) {
  return Fruit.query("SELECT * FROM fruit", {
    model: Fruit, // When JOIN table needed register that table [Fruit, ...]
    mapToModel: true // pass true here if you have any mapped fields
  });
}

...

// Export Schema, Function, ...
module.exports = {
  Fruit,
  exampleFindFruitById,
  exampleGetAllFruit,
  exampleGetAllFruitWithModelInstance,
  ...
};
```
#### That's cool! It's like magic creating The endpoints for you (CRUD) ✨

Now! you can request to `/fruit` with methods GET, POST, PATCH and DELETE like this.

| Efficacy |  Method  |        Endpoint        |    Body    |
|:---------|:---------|:-----------------------|:-----------|
|  Create  |  POST    | /fruit                |     { }    |
|  Read    |  GET     | /fruit                |     No     |
|  Read    |  GET     | /fruit/:id            |     No     |
|  Read    |  GET     | /fruit/:limit/:offset |     No     |
|  Update  |  PATCH   | /fruit/:id            |     { }    |
|  Delete  |  DELETE  | /fruit/:id            |     No     |
|


## # Generate Helpers ###

The `helpers` keep the files of functions for process specific something in the project. So, you might create the `helpers` in path `src/helpers` folder.

```sh
$ beech make helperName --helper
```

***Example:*** Text editor helper.

📂 TextEditor.js
```js
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

# Authentication (passport-jwt)

Passport is authentication middleware for Node. It is designed to serve a singular purpose: authenticate requests. When writing modules, encapsulation is a virtue, so Passport delegates all other functionality to the application. This separation of concerns keeps code clean and maintainable, and makes Passport extremely easy to integrate into an application.

### Passport-jwt Initialization

```sh
$ beech passport init
```

After passport initialized the `passport.config.js` it's appeared

📂 passport.config.js
```js
module.exports = {
  // Allowment using passport-jwt
  jwt_allow: true,

  // custom authenticaiton endpoint name, default `/authentication`
  auth_endpoint: "",

  // your jwt secret key
  secret: "your_jwt_secret",

  // token expiry time (seconds), default 86400 sec. it's expired in 24 hr.
  token_expired: 86400,

  model: {
    // Main sql connection name. You must make sure connection name like inside `app.config.js` file and choose one connection name.
    name: "default_db",

    // table name of users store, default table `users`
    table: "",

    // secret user store field for authenticate, default field `username` and `password`
    username_field: "",
    password_field: "",

    // JWT playload data, You can add it. Example: ["name", "email", ...]
    fields: [],

    // Other fields add for authentication.
    guard: {
      // Basic guard field, Example: ["pin", "hint", "2fa"]
      guard_field: [],

      // Advanced guard jwt request (needed some logical from front-end)
      advanced_guard: {
        allow: false,
        entity: "", // default entity `timing`
        secret: "top_secret",
        time_expired: {
          minutes: 1, // should length [0-60]
          seconds: 0, // should length [0-60]
        },
      },
    },
  },

  // Allowment using request with app_key entity (Every request must be using the app_key entity in headers)
  app_key_allow: false

  ...

};
```

**Authentication structure :** Simple ``users`` table:
```
==============================================================
|  id  |  username | password |     name     |     email     |
--------------------------------------------------------------
|  1   |  bombkiml |  secret  | bombkiml NC. | bomb@bomb.com |
|  2   |  johnson  |  secret  | johnson BA.  | john@bomb.com |
```

When you config passport with ```users``` table already. You will got Auth endpoint in available.
```js
POST:  "/authentication"               // Request token
POST:  "/authentication/create"        // Create new Auth data
PATCH: "/authentication/update/:id"    // Update old Auth data (needed id)
```

***XHR Example :***

```js
// Request with body for gether Token
POST: "/authentication"
{
  username: "bombkiml",
  password: "secret"
}


// Request with body for Create Auth data
POST: "/authentication/create"
{
  username: "add_new_username",
  password: "add_new_secret",
  name: "add_new_my_name",
  email: "add_new_email"
}


// Request with body for Update Auth data
PATCH: "/authentication/update/1"
Bearer Authorization: your_token
{
  username: "update_bombkiml",
  password: "update_secret",
  name: "update_my_name",
  email: "my_update_email@bomb.com"
}
```

# Beech Two Factor (2FA)
You can easy using 2 Factor authenticate with ```guard_field``` inside ```passport.config.js``` file and add your Guard field ex: ```2fa``` field for Authenticate Conditions.

## # Usage guard (2FA, Other)

📂 passport.config.js
```js
module.exports = {
  ...

  guard: {
    // Other fields add for authenticate, exmaple ["pin", "hint", "2fa"]
    guard_field: ["2fa"], 👈 // your feild guard.

    ...
  },

  ...

}
```

## # Beech Advanced Guard (Recommended After 2FA)
After 2FA login you can add Advance Guard for Protection your Authentication endpoint with Timing. You can allowment timing in object ```advance_guard``` inside ```passport.config.js``` file. So let's go add your Advance Guard Configuration.

📂 passport.config.js
```js
module.exports = {
  ...

  guard: {
    ...

    // Advanced authentication jwt request (needed some logical from front-end)
    advanced_guard: {
      allow: false, 👈 // advanced guard allowment.
      entity: "", // default entity `timing`
      secret: "your_advance_guard_secret",
      time_expired: {
        minutes: 1, // should length [0-60]
        seconds: 0, // should length [0-60]
      },
    },
  },

  ...

}

```

<b>After configure</b>, You must add some logic in your front-end like this.

Before add logic, We needed [```beech-auth0```](https://github.com/bombkiml/beech-auth0) and [```moment.js```](https://momentjs.com) Policy.

```sh
# NPM
$ npm install --save beech-auth0 moment

# Yarn
$ yarn add beech-auth0 moment
```
Now! you can add some logic.
```js
const { Auth0 } = require("beech-auth0");
const moment = require("moment");

let unix_time = moment().unix();

Auth0(unix_time, 'your_advance_guard_secret', (error, hashTiming) => {
  
  // Your XHR request for /authentication
  POST: "/authentication"
  {
    username: "bombkiml",
    password: "secret",
    timing: hashTiming, 👈 // Assign advance guard entity with callback hashTiming.
  }

});

```

## # Beech User auth managements ###
You can easy management `users` data with Beech, Only ```Store, Update``` NO ```Delete```, Anything you can make DELETE endpoint by yourself

```js
const { Store, Update } = require("beech-api");
```

- ***Store*** users data with ``Store()``
```js
// prepare data for store users
var data = {
  username: "bombkiml",
  password: "secret",
  name: "bombkiml nc.",
  email: "bomb@bomb.com"
}

Store(data, (err, stored) => {
  if (err) throw err;
  
  // response affected data
  console.log(stored.insertId, stored.affectedRows);

});
```

- ***Update*** users data with ``Update()``
```js
// prepare data for update users
var data = {
  password: "new_secret",
  name: "bombkiml NC.",
  email: "bombkiml@bomb.com"
}

Update(data, id, (err, updated) => {
  if (err) throw err;

  // response affected data
  console.log(updated.updateId, updated.affectedRows);

});
```

# Beech with Official Strategy

Latest supported with ``Google`` and ``Facebook`` Strategy.


## # Google Strategy


The Google OAuth 2.0 authentication strategy authenticates users using a Google account and OAuth 2.0 tokens. The strategy requires a verify callback, which accepts these credentials and calls done providing a user, as well as options specifying a client ID, client secret, and callback URL.

Before your application can make use of Sign In With Google, you must register your app with Google. This can be done in the [APIs & Services](https://console.cloud.google.com/apis) page of the [Google Cloud Platform console.](https://console.cloud.google.com/) Once registered, your app will be issued a client ID and secret which will be used in the strategy configuration.

Go to open file ``passport.config.js`` and go to ``google strategy`` then turn allow Google Strategy is ``allow: true`` something like this.

📂 passport.config.js
```js
...

strategy: {

  google: {

    // Allowment using google strategy
    allow: true,

    // Authen profile store fields available: `google_id`, `name`, `email`, `photos`, `locate`
    local_profile_fields: {
      google_id: "google_id", // Google ID field, default field name: `google_id`
      name: "your_name_field",
      email: "your_email_field",
      photos: "your_profile_url_field",
      locate: "" // If you not store set to null or remove it.
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

❓ **Note:** The URL "``/authentication``" will be follow by ``auth_endpoint`` when you custom it.


## # Facebook Strategy


Facebook Login allows users to sign in using their Facebook account. Support for Faceboook Login is provided by the ``passport-facebook`` package.

Before your application can make use of Facebook Login, you must register your app with Facebook. This can be done in the [App dashboard](https://developers.facebook.com/apps) at [Facebook for Developers.](https://developers.facebook.com/) Once registered, your app will be issued an app ID and secret which will be used in the strategy configuration.

Go to open file ``passport.config.js`` and go to ``facebook strategy`` then turn allow Facebook Strategy is ``allow: true`` something like this.

📂 passport.config.js
```js
...

strategy: {

  facebook: {

    // Allowment using facebook strategy
    allow: true,

    // Authen profile store fields available: `facebook_id`, `name`, `email`, `photos`, `locate`
    local_profile_fields: {
      facebook_id: "facebook_id", // Facebook ID field, default field name: `facebook_id`
      name: "your_name_field",
      email: "your_email_field",
      photos: "your_profile_url_field",
      locate: "" // If you not store set to null or remove it.
    },
    // Facebook development Credentials OAuth 2.0
    app_id: "FACEBOOK_APP_ID",
    app_secret: "FACEBOOK_APP_SECRET",

    // You can allow Permissions facebook profile fields. Learn more (https://developers.facebook.com/docs/graph-api/reference/v13.0/user#readperms)
    // **Update 2024, Now! Facebook requests permission for show Email. Learn more (https://developers.facebook.com/docs/permissions)
    profileFieldsAllow: [ 'id', 'displayName', 'name', 'photos', 'email', 'location' ], // Default allowed

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

❓ **Note:** The URL "``/authentication``" will be follow by ``auth_endpoint`` when you custom it.

# CORS Origin & Server Configuration
The origin array to the callback can be any value allowed for the origin option of the middleware. Certain CORS requests are considered `complex` and require an initial OPTIONS request (called the `pre-flight request`). You can allowed CORS origin inside file `beech.config.js`

📂 beech.config.js
```js
module.exports = {
  defineConfig: {
    // Base public path when served in development or production.
    base: process.env.NODE_ENV === "production"
          ? "/my-api/" // For Production
          : "/", // For Development

    server: {
      // Client request allow origin whitelist
      origin: ["http://example.com", "http://my-webapp:8080", "https://cat.io"],
      originSensitive: false, // Sensitive with contrasts wording

      // API Request rate limit
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
        // store: ... , // Redis, Memcached, etc.
        // See more: https://www.npmjs.com/package/express-rate-limit#Configuration
      },

      // API Duplicate Request
      duplicateRequest: {
        expiration: 500, // Can't duplicate request for 5 milliseconds each IP requests per `window`
      },
    },
  },
}
```

❓ **Note:** When you must to allowed all Origin. You can assign `*` or `[]` null value to `origin` variable.

## # Custom Endpoint Specific Rate Limit
When you need assign specific request Endpoint with [express-rate-limit](https://www.npmjs.com/package/express-rate-limit), You can managemnet with Beech object ```rateLimit``` for your custom Rate Limit like this.

```js
const { rateLimit } = require("beech-api").Express;

// Specific of your rate limit
const specificRateLimit1 = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 20,
  // more...
});

// Your Endpoints...
endpoint.get("/banana", specificRateLimit1, (req, res) => {
  ...
});

...
```

## # Custom Endpoint Specific Slow Down
**DON'T DO IT.** &nbsp; Because it's annoying to users.

When you need assign specific request Endpoint with [express-slow-down](https://www.npmjs.com/package/express-slow-down), You can managemnet with Beech object ```slowDown``` for your custom Slow Down like this.

```js
const { slowDown } = require("beech-api").Express;

// Specific of your slow down
const specificSlowDown1 = slowDown({
  windowMs: 15 * 60 * 1000,      // 15 minutes
  delayAfter: 5,                 // Allow 5 requests per 15 minutes.
  delayMs: (hits) => hits * 100, // Add 100 ms of delay to every request after the 5th one.
  // more...
  
  /**
   * So:
   *
   * - requests 1-5 are not delayed.
   * - request 6 is delayed by 600ms
   * - request 7 is delayed by 700ms
   * - request 8 is delayed by 800ms
   *
   * and so on. After 15 minutes, the delay is reset to 0.
   */
});

// Your Endpoints...
endpoint.get("/banana", specificSlowDown1, (req, res) => {
  ...
});

...
```

## # Custom Endpoint Specific Duplicate Request
This middleware to Limit each IP duplicated requests per window.

When you need assign specific request Endpoint with duplicate request use [express-duplicate-request](https://github.com/bombkiml/express-duplicate-request), You can managemnet with Beech object ```duplicateRequest``` for your custom Duplicate Request like this.

```js
const { duplicateRequest } = require("beech-api").Express;

// Specific of your duplicate request
const specificDup1 = duplicateRequest({
  expiration: 500, // Can't duplicate request for 5 milliseconds, Should 0 to disabled
  // more...
});

// Your Endpoints...
endpoint.get("/banana", specificDup1, (req, res) => {
  ...
});

...
```



# Databases managements

## # Migrations & Seeder

Just like you use Git / SVN to manage changes in your source code, you can use migrations to keep track of changes to the database. With migrations you can transfer your existing database into another state and vice versa: Those state transitions are saved in migration files, which describe how to get to the new state and how to revert the changes in order to get back to the old state.

You will need [Sequelize CLI.](https://github.com/sequelize/cli) The CLI ships support for [migrations](https://sequelize.org/v5/manual/migrations.html) and project.

## # Usage

To create an empty project you will need to execute `init` command

```sh
$ npx sequelize-cli init
```

This will create following folders inside `databases` folder.

- `config`, contains config file, which tells CLI how to connect with database.
- `models`, contains all models for your project.
- `migrations`, contains all migration files.
- `seeders`, contains all seed files.

## # Configuration

Before continuing further we will need to tell CLI how to connect to database. To do that let's open default config file `databases/config/database.json` It looks something like this:

```json
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

❓ **Note:** The database connect default port 3306 if you another port you can add object ``port`` in config.

❓ **Note:** If your database doesn't exists yet, you can just call `npx sequelize-cli db:create` command. With proper access it will create that database for you.

## # Creating first Migrations

Create `model` use `model:generate` command. This command requires two options.

- `--name`, Name of the model
- `--attributes`, List of model attributes

Let's create a model name example `User`. See more about of [Datatypes](https://sequelize.org/v5/manual/data-types.html)

```sh
$ npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string,birhday:date
```

## # Migrations Up and Down

Until this step, we haven't inserted anything into the database. We have just created required model and migration files for our first model User.

- **Migrate Up** : you can create that table in database you need to run db:migrate command.

  ```sh
  $ npx sequelize-cli db:migrate
  ```

- **Migrate Down** : you can use `db:migrate:undo`, this command will revert most recent migration.
  ```sh
  $ npx sequelize-cli db:migrate:undo
  ```

## # Creating First Seeder

To manage all data migrations you can use seeders. Seed files are some change in data that can be used to populate database table with sample data or test data.

Let's create a seed file which will add a demo user to our User table.

```sh
$ npx sequelize-cli seed:generate --name user
```

## # Seeder Up and Down

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

# Testing

Test using [Jest](https://jestjs.io/en/) for testing the project. Jest is a delightful JavaScript Testing Framework with a focus on simplicity. Learn more [Jest docs](https://jestjs.io/docs/en/getting-started.html)

So, When you make the new endpoints it's automatic create test file end with `.spec.js` in `__test__` folder with constant `baseUrl` variable and `axios` package.

Example endpoints testing :

📂 fruit-endpoints.spec.js
```js
const endpoint = baseUrl.concat("/fruit");

describe("Test endpoint : " + endpoint, () => {
  it("Truthy!", () => {
    expect("/fruit").toBeTruthy();
  });

  it("Respond with basic GET status code 200", (done) => {
    axios.get(endpoint).then((res) => {
      expect(200).toEqual(res.data.code);
      done();
    });
  });
});
```


# Implementation
  
## # Implement with [PM2](https://pm2.keymetrics.io/)
[PM2](https://pm2.keymetrics.io/) is a daemon process manager that will help you manage and keep your application online. Getting started with PM2 is straightforward, it is offered as a simple and intuitive CLI, installable via [NPM](https://www.npmjs.com/).

```sh
# Start service as standalone
$ pm2 start ./node_modules/beech-api/packages/cli/beech --name <serviceName>

# OR

# Start service as cluster mode
$ pm2 start ./node_modules/beech-api/packages/cli/beech --name <serviceName> -i <instances>
```

## # Implement with [Docker](https://www.docker.com)

[Docker](https://www.docker.com) is an open platform for developing, shipping, and running applications. Docker enables you to separate your applications from your infrastructure so you can deliver software quickly.

- ### **Create Dockerfile**

Docker builds images automatically by reading the instructions from a Dockerfile -- a text file that contains all commands, in order, needed to build a given image. A Dockerfile adheres to a specific format and set of instructions which you can find at [Dockerfile reference](https://docs.docker.com/engine/reference/builder/).

📂 Dockerfile
```js
FROM node:14.19-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/api
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production --silent && mv node_modules .
COPY . .
EXPOSE 9000
CMD ["node", "./node_modules/beech-api/packages/cli/beech"]
```

- ### **Docker build image**

The docker build command builds an image from a Dockerfile and a context. The build’s context is the set of files at a specified location ```PATH``` or ```URL```. The PATH is a directory on your local filesystem. The URL is a Git repository location.

```sh
$ docker build -t <imageName> .
```

❓ **Note:** You can specify a repository and tag at which to save the new image : ``` $ docker build -t <imageName>:<tags> . ```

- ### **Run docker**

  After create ``image`` you can run docker engine following :

  - ### **Docker Container (Standalone)**
  ```sh
  $ docker run -d -p 9000:9000 --name <containerName> <imageName>
  ```

  - ### **Create Docker Swarm (Cluster)**
  ```sh
  # Initiate swarm
  $ docker swarm init
  
  # Run docker service
  $ docker service create --replicas <instances> --name <containerName> --publish 9000:9000 <imageName>
  ```


# Bonus

Free `helpers` you can make [LINE Notify](https://github.com/Yuhsak/line-api#readme) by using [line-api](https://notify-bot.line.me/en/) package with create the helper function following.

Installation the package:

```
$ npm install line-api
```

Create file `Line.js` in `src/helpers` folder and copy code below:

📂 Line.js
```js
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

# Development

Want to contribute or join for great job!, You can contact to me via

- GitHub: [bombkiml/beech-api - issues](https://github.com/bombkiml/beech-api/issues)
- E-mail: nattapat.jquery@gmail.com
- Facebook: [https://www.facebook.com/bombkiml](https://www.facebook.com/bombkiml)

# License

The Beech API framework is open-sourced software licensed under the [MIT license.](https://opensource.org/licenses/MIT)
