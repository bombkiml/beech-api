module.exports = {
  // Allowment using jwt
  jwt_allow: true,

  // Custom authenticaiton endpoint, default `/authentication`
  auth_endpoint: "",

  // Assign your jwt secret key
  secret: "your_jwt_secret",

  // Set token expiry time (seconds), default expired in 24 hr.
  token_expired: 86400,

  model: {
    // Main sql connection name. You must make sure connection name like inside `app.config.js` file and choose one connection name.
    name: "default_db",
    // The user table name for store your authenticate, (default table `users`)
    table: "",
    // The fields for authenticate, default fields: (`username` and `password`)
    username_field: "",
    password_field: "",
    // JWT playload data
    fields: [],
    // Other fields add for authentication.
    guard: {
      // Basic guard field, Example: ["pin", "email", "2fa"]
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
  app_key_allow: true,

  // Official strategy
  strategy: {
    /**
     * The Client Id and Client Secret needed to authenticate with Google can be set up from the Google Developers Console (https://console.developers.google.com/)
     * You may also need to enable Google API in the developer console, otherwise user profile data may not be fetched.
     * Now Google supports authentication with oAuth 2.0.
     *
     */
    google: {
      // Allowment using google strategy
      allow: false,
      // Authen profile store fields available: `google_id`, `name`, `email`, `photos`, `locate`
      local_profile_fields: {
        google_id: "google_id", // Google ID field, default field name: `google_id`
      },
      // Google development Credentials OAuth 2.0 Client IDs
      client_id: "GOOGLE_CLIENT_ID",
      client_secret: "GOOGLE_CLIENT_SECRET",
      // Callback endpoint default `/google/callback`
      callbackURL: "",
      // Failure redirect to your route
      failureRedirect: "/login",
    },

    /**
     * The Facebook strategy allows users to log in to a web application using their Facebook account. Internally, Facebook authentication works using OAuth 2.0.
     * Support for Facebook is implemented by the passport-facebook (https://github.com/jaredhanson/passport-facebook) module.
     *
     * In order to use Facebook authentication, you must first create an app at Facebook Developers. (https://developers.facebook.com/apps) When created, an app is assigned an App ID and App Secret.
     * Your application must also implement a redirect URL, to which Facebook will redirect users after they have approved access for your application.
     *
     */
    facebook: {
      // Allowment using facebook strategy
      allow: false,
      // Authen profile store fields available: `facebook_id`, `name`, `email`, `photos`, `locate`
      local_profile_fields: {
        facebook_id: "facebook_id", // Facebook ID field, default field name: `facebook_id`
      },
      // Facebook development Credentials OAuth 2.0
      app_id: "FACEBOOK_APP_ID",
      app_secret: "FACEBOOK_APP_SECRET",
      // Callback endpoint default `/facebook/callback`
      callbackURL: "",
      // Failure redirect to your route
      failureRedirect: "/login",
    },
  },
};
