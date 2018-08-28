#!/usr/bin/env node
'use strict'

/* eslint-disable no-console */
const fs = require('fs')
const minimist = require('minimist')
const prettyjson = require('prettyjson')
const Spinner = require('cli-spinner').Spinner
const chalk = require('chalk')
const PackageDocs = require('../src')

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

const start_time = +new Date()

const package_file = argv.package
const package_docs_file = argv.output === true ? 'package-docs.json' : argv.output
const spinner = new Spinner(chalk.yellow('%s Querying..'))
spinner.setSpinnerString(6)

async function queryArgs (packages) {
  const pd = new PackageDocs()
  start()
  const info = await pd.query(packages)
  finished(pd.query_count)

  output(info)
}

async function queryPackageJson () {
  const pd = new PackageDocs()
  const package_json = await pd.readPackageJson(package_file)

  start()
  const info = await pd.queryPackageJson(package_json)
  finished(pd.query_count)

  output(info)
}

function start () {
  if (argv.q)
    return
  spinner.start()
}

function finished (count) {
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
  (argv._.length ? queryArgs(argv._) : queryPackageJson())
    .then()
    .catch(e => console.error(e))
}

exec()
