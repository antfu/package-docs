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

    return axios.post(`${api_url}/package/mget`, packages).then(result => {
      return _.mapValues(result.data, info => {
        this.query_count += 1
        if (info.collected) {
          if (info.collected.github && info.collected.github.homepage)
            return info.collected.github.homepage
          if (info.collected.metadata && info.collected.metadata.links) {
            return info.collected.metadata.links.homepage ||
              info.collected.metadata.links.repository ||
              info.collected.metadata.links.npm ||
              '<NOT FOUND>'
          }
        }
        return '<NOT FOUND>'
      })
    })
  }

  queryPackageJson (packageJson) {
    const result = {}
    return this.query(Object.keys(packageJson.dependencies || {}))
      .then(r => {
        result.dependencies = r
        return this.query(Object.keys(packageJson.devDependencies || {}))
      })
      .then(r => {
        result.devDependencies = r
        return this.query(Object.keys(packageJson.peerDependencies || {}))
      })
      .then(r => {
        result.peerDependencies = r
        return result
      })
  }
}

module.exports = PackageDocs
