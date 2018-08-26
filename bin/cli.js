#!/usr/bin/env node
'use strict';

const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const minimist = require('minimist')
const prettyjson = require('prettyjson')

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    p: 'package',
    o: 'output',
    q: 'quiet'
  },
  boolean: ['h', 'q', 'o'],
  string: ['p'],
  default: {
    p: 'package.json',
  }
})

if (argv.help) {
  process.stderr.write(`
    Description
      Get packages' document homepages from 'package.json'
    Usage
      $ package-docs <package-name> <2nd-package-name...>
    Options
      --package, -p        Path to 'package.json' file (default: package.json)
      --output, -o         Output file path (default: package-docs.json)
      --quiet, -q          Disable output except for errors
      --help, -h           Displays this message
  `)
  process.exit(0)
}

const api_url = 'https://api.npms.io/v2'
const package_file = argv.package
const package_docs_file = argv.output === true ? 'package-docs.json' : argv.output

async function queryDocs(packages){
  if (packages.length === 0)
    return undefined
  const result = await axios.post(api_url+'/package/mget', packages)
  return _.mapValues(result.data,info=>{
    if (info.collected){
      if (info.collected.github && info.collected.github.homepage)
        return info.collected.github.homepage
      if (info.collected.metadata && info.collected.metadata.links)
      return info.collected.metadata.links.homepage ||
        info.collected.metadata.links.repository ||
        info.collected.metadata.links.npm
    }
  })
}

async function queryPackages(packages){
  const info = await queryDocs(packages)
  output(info)
}

async function readAndSave() {
  const content = fs.readFileSync(package_file)
  const package_json = JSON.parse(content)

  const dependencies = await queryDocs(Object.keys(package_json.dependencies || {}))
  const devDependencies = await queryDocs(Object.keys(package_json.devDependencies || {}))
  const peerDependencies = await queryDocs(Object.keys(package_json.peerDependencies || {}))

  const info = {
    dependencies,
    devDependencies,
    peerDependencies
  }

  output(info)
}

function print(info){
  console.log('\n'+prettyjson.render(info)+'\n')
}

function output(info){
  if(package_docs_file)
    fs.writeFileSync(package_docs_file, JSON.stringify(info, null, 2))
  else 
    print(info)
}

function exec(){
  if (argv._.length) {
    queryPackages(argv._)
    .then()
    .catch(e=>console.error(e))
  }
  else {
    readAndSave()
      .then()
      .catch(e=>console.error(e))
  }
}

exec()
