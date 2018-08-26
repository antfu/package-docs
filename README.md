# Package Docs
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

You may also save the output to json file by specifying the option `-o`, the output will save to `package-docs.json` by default
```bash
$ package-docs -o
```

## TODO
- [ ] Better error handling
- [x] Querying indicator
- [ ] Publish to npm
- [ ] Markdown format output
- [ ] HTML format output
- [ ] Unit tests

## License
MIT [@antfu](https://github.com/antfu) 2018