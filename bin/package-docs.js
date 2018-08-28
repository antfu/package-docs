#!/usr/bin/env node
'use strict'

/* eslint-disable no-console */
const version = '0.0.2'

const fs = require('fs')
const _ = require('lodash')
const minimist = require('minimist')
const prettyjson = require('prettyjson')
const Spinner = require('cli-spinner').Spinner
const opn = require('opn')
const inquirer = require('inquirer')
const chalk = require('chalk')
const PackageDocs = require('../src')

const open_max_amount = 5

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    p: 'package',
    o: 'output',
    q: 'quiet',
    v: 'version',
    O: 'open',
    y: 'yes',
  },
  boolean: ['h', 'q', 'o', 'v', 'O', 'y'],
  string: ['p'],
  default: {
    p: 'package.json',
    yes: false,
  },
  unknown (args) {
    if (!args.startsWith('-'))
      return true
    process.stdout.write(chalk.red(`Unkown argument ${args}`))
    process.exit(1)
  },
})

if (argv.version) {
  process.stdout.write(`v${version}`)
  process.exit(0)
}

if (argv.help) {
  process.stderr.write(`
    Description
      Get packages' document homepages from 'package.json'
    Usage
      $ package-docs <package-names ...>
    Options
      --package, -p        Path to 'package.json' file (default: package.json)
      --output, -o         Output file path (default: package-docs.json)
      --open, -O           Open the browser
      --yes, -y            Automatic yes to prompts
      --quiet, -q          Disable output except for errors
      --help, -h           Displays this message
  `)
  process.exit(0)
}

async function exec () {
  const time_started = +new Date()
  const package_file = argv.package
  const output_file = argv.output === true ? 'package-docs.json' : argv.output
  const spinner = new Spinner(chalk.yellow('%s Querying..'))
  spinner.setSpinnerString(6)
  const pd = new PackageDocs()

  if (!argv.q)
    spinner.start()

  let result
  if (argv._.length) {
    result = await pd.query(argv._)
  }
  else {
    const package_json = await pd.readPackageJson(package_file)
    result = await pd.queryPackageJson(package_json)
  }

  const time_ended = +new Date()

  if (!argv.q) {
    spinner.stop(true)
    const cost = ((time_ended - time_started) / 1000).toFixed(1)
    console.log(chalk.cyan(`Queried ${pd.query_count} packages in ${cost}s`))
  }

  if (output_file) {
    // Save to file
    fs.writeFileSync(output_file, JSON.stringify(result, null, 2))
    if (!argv.q) console.log(chalk.green(`Output saved in "${output_file}"`))
  }
  else if (!argv.q) {
    // Print to console
    console.log(`\n${prettyjson.render(result)}\n`)
  }

  if (argv.open) {
    const urls = _.chain(Object.values(result))
      .map(i => {
        if (_.isNull(i))
          return null
        if (_.isString(i))
          return i
        if (_.isObject(i))
          return Object.values(i)
        return i
      })
      .flatten()
      .filter(i => i)
      .uniq()
      .value()

    let open = true
    if (urls.length > open_max_amount && !argv.yes) {
      open = (await inquirer.prompt([{
        type: 'confirm',
        default: false,
        name: 'open',
        message: `Are you sure to open ${urls.length} urls?`,
      }])).open
    }

    if (open) {
      for (const url of urls)
        await opn(url)
    }
  }
}

exec()
  .then()
  .catch(e => {
    console.error(e)
  })
