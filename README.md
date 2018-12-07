# Package Docs

[![npm](https://img.shields.io/npm/v/package-docs.svg)](https://www.npmjs.com/package/package-docs)
[![Depfu](https://img.shields.io/depfu/antfu/package-docs.svg)](https://depfu.com/github/antfu/package-docs?project=Npm)
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/antfu/package-docs#readme)


Get packages' document homepages from `package.json`

## Install
```bash
$ npm i -g package-docs
```

## Usage
```bash
$ package-docs
```

It will read `package.json` and get packages in the `dependencies`/`devDependencies`/`peerDependencies` fields and save their document homepage urls into `package-docs.json`.

```json
// pacakge.json
{
  "name": "package-docs",
  "dependencies": {
    "axios": "^0.18.0",
    "chalk": "^2.4.1",
    "lodash": "^4.17.10",
    "minimist": "^1.2.0",
    "prettyjson": "^1.2.1"
  },
  "devDependencies": {
    "eslint": "^5.4.0",
    "eslint-config-standard": "^11.0.0"
  }
}
```
output:
```json5
dependencies:
  axios:      https://github.com/axios/axios
  chalk:      https://github.com/chalk/chalk#readme
  lodash:     https://lodash.com/
  minimist:   https://github.com/substack/minimist
  prettyjson: http://rafeca.com/prettyjson
devDependencies:
  eslint:                 https://eslint.org
  eslint-config-standard: https://standardjs.com
```

### Output to file
You may also save the output to json file by specifying the option `-o`, the output will save to `package-docs.json` by default
```bash
$ package-docs -o
```

### Inline query
```bash
$ package-docs vue vuex
```
```
vue:  http://vuejs.org
vuex: https://vuex.vuejs.org
```

### Open in browser
```bash
$ package-docs vue --open
```
`--open` option will make a prompt to confirm when opening more than 5 urls. You can specify `-y` to bypass the prompt.

## TODO
- [x] Open in browser
- [ ] Better error handling
- [x] Querying indicator
- [x] Publish to npm
- [ ] Unit tests
- [x] Rewrite use class
- [ ] Node.js API
- [ ] Cache

## License
MIT [@antfu](https://github.com/antfu) 2018