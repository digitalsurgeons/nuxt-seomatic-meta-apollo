const consola = require('consola')
import gql from 'graphql-tag'

export default ({ app }) => {
  app.seomaticMeta = async function nuxtSeomaticMeta({ fullPath }, id = 1) {
    const options = JSON.parse(`<%= JSON.stringify(options) %>`)

    // Custom remapping of routes to other routes
    // This is so you can grab seomatic data from another page
    // Eg: Your nuxt homepage has a slug of '/' but you want data
    // from a page in Craft with a slug of 'homepage'
    let routeRemapPath
    if (typeof options.routeRemap === 'object' && options.routeRemap) {
      const foundRouteRemap = options.routeRemap.find(
        ({ path }) => path === fullPath
      )
      routeRemapPath = foundRouteRemap && foundRouteRemap.getFrom
      if (options.debug && routeRemapPath) {
        consola.info(
          `Getting metadata for '${fullPath}' from '${routeRemapPath}'`
        )
      }
    }

    // Determine route name to use in graphql query
    const routeName = routeRemapPath || fullPath

    // Retrieve the seomatic graphql data via Apollo
    if (app.apolloProvider === undefined) {
      return consola.error(
        `SeomaticMeta plugin: Apollo not found, add it to your module array like this:\n\nmodules: ['nuxt-seomatic-meta-apollo', '@nuxtjs/apollo'],`
      )
    }

    // Uses default client because app.$apollo doesn't exist
    const result = await app.apolloProvider.defaultClient.query({
      headers: {
        ...(options.graphqlToken && {
          Authorization: `Bearer ${options.graphqlToken}`,
        }),
      },
      query: gql`
        query ($uri: String, $siteId: Int) {
          seomatic(uri: $uri, siteId: $siteId, asArray: true) {
            metaTitleContainer
            metaTagContainer
            metaScriptContainer
            metaLinkContainer
            metaJsonLdContainer
            ... on SeomaticType {
              metaTitleContainer
              metaJsonLdContainer
              metaLinkContainer
              metaScriptContainer
              metaTagContainer
            }
          }
        }
      `,
      variables: {
        uri: routeName,
        siteId: id,
      },
    })

    if (!result) consola.error(new Error(`No data was returned from Craft`))

    if (options.debug) consola.info('Received GraphQl result', result)

    const data = result.data.seomatic

    // Convert the graphql JSON data to an object so we can work with it
    const {
      metaTitleContainer: {
        title: { title },
      },
      metaTagContainer,
      metaLinkContainer,
      metaScriptContainer,
      metaJsonLdContainer,
    } = Object.entries(data).reduce((acc, [key, value]) => {
      if (key !== '__typename') {
        acc[key] = JSON.parse(value)
        return acc
      }

      return acc
    }, {})

    // if (options.debug) consola.info('metaTitleContainer.title', title)

    // Flatten metaTagContainer values into string
    const meta = metaTagContainer
      ? Object.values(metaTagContainer).reduce(
          (flat, next) => flat.concat(next),
          []
        )
      : null

    // Flatten metaLinkContainer values into string
    const link = metaLinkContainer
      ? Object.values(metaLinkContainer).reduce(
          (flat, next) => flat.concat(next),
          []
        )
      : null

    // Convert script data to <script>..</script>
    const metaScripts = metaScriptContainer
      ? Object.values(metaScriptContainer).map(({ script }) => ({
          innerHTML: script,
        }))
      : []

    // Convert JsonLd to <script type="application/ld+json">...</script>
    const jsonLd = metaJsonLdContainer
      ? Object.entries(metaJsonLdContainer).map((value) => ({
          type: 'application/ld+json',
          innerHTML: JSON.stringify(value[1]),
        }))
      : []

    // Combine processed script data
    const script = [...metaScripts, ...jsonLd]

    return {
      ...(title && { title }),
      ...(meta && { meta }),
      ...(link && { link }),
      script,
      __dangerouslyDisableSanitizers: ['script'],
    }
  }
}
