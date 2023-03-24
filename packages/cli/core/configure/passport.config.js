module.exports = {
  // Allow using jwt
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
    // Show JWT fields, default show fields: ["id", "name", "email"]
    fields: []
  },

  // Allow using with app_secret request (Every request must be using the app_secret parameter)
  app_secret_allow: false,

  // Official strategy
  strategy: {
    /**
     * The Client Id and Client Secret needed to authenticate with Google can be set up from the Google Developers Console (https://console.developers.google.com/)
     * You may also need to enable Google API in the developer console, otherwise user profile data may not be fetched. 
     * Now Google supports authentication with oAuth 2.0.
     * 
     */
    google: {
      // Allow using google strategy
      allow: false,
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
      // Allow using facebook strategy
      allow: false,
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
    },
  }
}