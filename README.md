# Package Docs
Get packages' document homepages from `package.json`

## Installation
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
    "minimist": "^1.2.0"
  }
}
```
to:
```json
// pacakge-docs.json
{
  "dependencies": {
    "axios": "https://github.com/axios/axios",
    "chalk": "https://github.com/chalk/chalk#readme",
    "lodash": "https://lodash.com/",
    "minimist": "https://github.com/substack/minimist"
  }
}
```

## TODO
- [ ] Better error handling
- [ ] Querying indicator
- [ ] Document for output to stdout
- [ ] Publish to npm
- [ ] Markdown format output
- [ ] HTML format output

## License
MIT [@antfu](https://github.com/antfu) 2018