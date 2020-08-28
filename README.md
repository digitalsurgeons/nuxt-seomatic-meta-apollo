<h1 align="center">nuxt-seomatic-meta-apollo &nbsp; <a href="https://www.npmjs.com/package/nuxt-seomatic-meta"><img src="https://img.shields.io/npm/v/nuxt-seomatic-meta.svg" alt="NPM"></a></h1>

<p align="center">
  <img width="80%" src="https://i.imgur.com/BFG9Nn2.png" alt="Icon">
</p>

Forked from <a href="https://github.com/ben-rogerson/nuxt-seomatic-meta">Ben Rogerson's nuxt-seomatic-meta</a>.

If you're using Nuxt.js with Craft CMS headless then there's a good chance you'll be aiming for some decent SEO. A custom solution would take too much time, so a great alternative is to request the SEO data from [SEOmatic](https://plugins.craftcms.com/seomatic) via GraphQL.

This module grabs the SEOmatic data and converts it to a format that Nuxt.js expects in it's [head property](https://nuxtjs.org/api/configuration-head/).

## Getting started

Before starting, I'll assume you've installed [Craft (>=3.3)](https://github.com/craftcms/cms/blob/develop/CHANGELOG-v3.md#330---2019-08-27), [SEOmatic (>=3.2.28)](https://github.com/nystudio107/craft-seomatic/releases/tag/3.2.28) and enabled [Crafts GraphQL API](https://docs.craftcms.com/v3/graphql.html#getting-started).

⚠️ Note: Within `Craft > GraphQL > Schemas`, be sure to adjust the scope to the right entries in the GraphQL schema - I find it easy to forget that.

1. Install `nuxt-seomatic-meta-apollo` via yarn or npm:

   ```sh
   yarn add nuxt-seomatic-meta-apollo
   # or: npm install nuxt-seomatic-meta-apollo
   ```

2. Add the seomatic-meta and apollo plugins to your modules section in `nuxt.config.js`:

   ```js
   /*
    ** Nuxt.js modules
    */
   modules: [
     'nuxt-seomatic-meta-apollo',
     '@nuxtjs/apollo',
     // '@nuxtjs/dotenv',
   ],
   ```

   _'@nuxtjs/apollo'_: Apollo is used to connect to the Craft CMS API - it's automatically installed as a dependency of `nuxt-seomatic-meta-apollo` so you'll just need to add it to the array.

   _'@nuxtjs/dotenv'_ (optional): To specify your GraphQL connection variables in a `.env` file then [install the nuxt dotenv module](https://github.com/nuxt-community/dotenv-module#setup).

3. Now specify the GraphQL connection settings - you have two options:

   a) Add the connection settings to an `.env` file in your project root (if you're using the [@nuxtjs/dotenv](https://github.com/nuxt-community/dotenv-module#setup) module):

   ```bash
   # GraphQL bearer token (Not required if API is public)
   GRAPHQL_TOKEN=ACCESS_TOKEN_SECRET
   ```

   b) Or add the connection settings to a new `seomaticMeta` object in `nuxt.config.js`:

   ```js
   /*
    ** Seomatic meta config
    */
   seomaticMeta: {
     graphqlToken: 'ACCESS_TOKEN_SECRET',
   },
   ```

4. Lastly, add some code to start the API request and supply the result to Nuxt's head property. This is added to your pages in `pages/*.vue`:

   ```js
   <script>
   export default {
     //...

     // Get Seomatic data from Craft by route
     async asyncData({ app, route }) {
       const siteId = 1 // For multi-site installs
       return {
         headData: await app.seomaticMeta(route, siteId)
       };
     },

     // Supply the data to the Nuxt head property
     head() {
       return this.headData;
     }
   };
   </script>
   ```

## Configuration

Options can be supplied in a `seomaticMeta` object in `nuxt.config.js`:

```js
seomaticMeta: {
  debug: true,
  routeRemap: [
    {
      path: '/',
      getFrom: 'homepage',
    },
    {
      path: 'another-route',
      getFrom: 'gets-meta-from-this-route-instead',
    },
  ],
  graphqlToken: 'ACCESS_TOKEN_SECRET',
},
```

| Name         | Type      | Default                                                                                                                     | Description                                                                                                                                                                                         |
| ------------ | --------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| debug        | `boolean` | `false`                                                                                                                     | Display the GraphQL data and other useful feedback in your console when using `npm run generate`.                                                                                                   |
| routeRemap   | `array`   | `[]`                                                                                                                        | Custom remapping of route data so you can grab the SEOmatic data from another page.<br> Eg: Your Nuxt homepage has a route of `/` but you want data from a page in Craft with a slug of `homepage`. |
| backendUrl   | `string`  | `` | The url for your Craft installation.<br>This can also be defined in your `.env` under the key `BACKEND_URL`.           |
| graphqlPath  | `string`  | `` | The path to your GraphQL API.<br>This can also be defined in your `.env` under the key `GRAPHQL_PATH`.                 |
| graphqlToken | `string`  | `` | The token for your secured GraphQL endpoint.<br>This can also be defined in your `.env` under the key `GRAPHQL_TOKEN`. |

Note: .env variables require the [dotenv module](https://github.com/nuxt-community/dotenv-module#setup).

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check the [issues page](http://github.com/ben-rogerson/nuxt-seomatic-meta/issues).

## Show your support

Give a ⭐️ if this project helped you!
