const api_url = 'https://api.npms.io/v2'
const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')

class PackageDocs {
  constructor () {
    this.query_count = 0
  }

  readPackageJson (filepath = 'package.json') {
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
      .then(r => JSON.parse(r))
  }

  query (packages) {
    if (packages.length === 0)
      return new Promise((resolve) => resolve(undefined))

    if (_.isString(packages))
      packages = [packages]

    return this.queryTree({ __default: packages })
      .then(r => r.__default)
  }

  queryTree (packagesTree) {
    const packages = _.chain(Object.values(packagesTree))
      .map(i => _.isArray(i) ? i : Object.keys(i))
      .flatten()
      .uniq()
      .value()

    return axios.post(`${api_url}/package/mget`, packages)
      .then(result => {
        return _.mapValues(result.data, info => {
          this.query_count += 1
          if (info.collected) {
            if (info.collected.github && info.collected.github.homepage)
              return info.collected.github.homepage
            if (info.collected.metadata && info.collected.metadata.links) {
              return info.collected.metadata.links.homepage ||
              info.collected.metadata.links.repository ||
              info.collected.metadata.links.npm ||
              null
            }
          }
          return null
        })
      })
      .then(result => {
        const tree = {}
        for (const collectionKey of Object.keys(packagesTree)) {
          const collection = packagesTree[collectionKey]
          const packages = _.isArray(collection) ? collection : Object.keys(collection)
          tree[collectionKey] = {}
          for (const p of packages)
            tree[collectionKey][p] = result[p] || null
        }
        return tree
      })
  }

  queryPackageJson (packageJson) {
    return this.queryTree(_.pick(packageJson, ['dependencies', 'devDependencies', 'peerDependencies']))
  }
}

module.exports = PackageDocs
