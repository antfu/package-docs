#!/usr/bin/env node
'use strict'

/* eslint-disable no-console */
const _ = require('lodash')
const fs = require('fs')
const axios = require('axios')
const minimist = require('minimist')
const prettyjson = require('prettyjson')
const Spinner = require('cli-spinner').Spinner
const chalk = require('chalk')

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    p: 'package',
    o: 'output',
    q: 'quiet',
    m: 'markdown',
  },
  boolean: ['h', 'q', 'o', 'html', 'm'],
  string: ['p'],
  default: {
    p: 'package.json',
  },
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
      --markdown, -m      Output as Markdown(.md) file (default: json)
      --html               Output as HTML(.html) file (default: json)
      --quiet, -q          Disable output except for errors
      --help, -h           Displays this message
  `)
  process.exit(0)
}

if (argv.m) {
  console.log(chalk.red('Markdown output is not yet implemented'))
  process.exit(1)
}

if (argv.html) {
  console.log(chalk.red('HTML output is not yet implemented'))
  process.exit(1)
}

let count = 0
const start_time = +new Date()

const api_url = 'https://api.npms.io/v2'
const package_file = argv.package
const package_docs_file = argv.output === true ? 'package-docs.json' : argv.output
const spinner = new Spinner(chalk.yellow('%s Querying..'))
spinner.setSpinnerString(6)

async function queryDocs (packages) {
  if (packages.length === 0)
    return undefined
  const result = await axios.post(`${api_url}/package/mget`, packages)
  return _.mapValues(result.data, info => {
    count += 1
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
}

async function queryPackages (packages) {
  start()
  const info = await queryDocs(packages)
  finished()

  output(info)
}

async function readAndSave () {
  const content = fs.readFileSync(package_file)
  const package_json = JSON.parse(content)

  start()
  const dependencies = await queryDocs(Object.keys(package_json.dependencies || {}))
  const devDependencies = await queryDocs(Object.keys(package_json.devDependencies || {}))
  const peerDependencies = await queryDocs(Object.keys(package_json.peerDependencies || {}))
  finished()

  const info = {
    dependencies,
    devDependencies,
    peerDependencies,
  }

  output(info)
}

function start () {
  if (argv.q)
    return
  spinner.start()
}

function finished () {
  if (argv.q)
    return
  spinner.stop(true)
  const cost = ((+new Date() - start_time) / 1000).toFixed(1)
  console.log(chalk.cyan(`Queried ${count} packages in ${cost}s`))
}

function print (info) {
  console.log(`\n${prettyjson.render(info)}\n`)
}

function output (info) {
  if (package_docs_file) {
    fs.writeFileSync(package_docs_file, JSON.stringify(info, null, 2))
    if (!argv.q) console.log(chalk.green(`Output saved in "${package_docs_file}"`))
  }
  else { print(info) }
}

function exec () {
  if (argv._.length) {
    queryPackages(argv._)
      .then()
      .catch(e => console.error(e))
  }
  else {
    readAndSave()
      .then()
      .catch(e => console.error(e))
  }
}

exec()
