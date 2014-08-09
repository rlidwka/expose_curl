This tool allows you to capture incoming/outgoing HTTP requests and re-play them.

Firebug has a neat feature called "Copy as cURL" in network tab, which works for firefox. For any requests browser did, you can copy the request in the form of curl command, paste it into the terminal, and basically replay the request. I wanted to have the same thing in console node.js applications, so here it is.

### Usage

Suppose you want to see what requests npm is making to the registry. Sounds easy:

```sh
$ expose_curl npm install jju
npm http GET https://registry.npmjs.org/jju
curl -i http://registry.npmjs.org/jju -H 'if-none-match: "8DFJYVR9FK8RMM0HYSP9WY7X3"' -H 'npm-session: 81b70fd2abf3f2e8' -H 'version: 2.0.0-alpha-5' -H 'referer: install jju' -H 'accept: application/json' -H 'accept-encoding: gzip' -H 'user-agent: npm/2.0.0-alpha-5 node/v0.10.25 linux x64' -H 'host: registry.npmjs.org'
npm http 304 https://registry.npmjs.org/jju
jju@1.0.4 node_modules/jju
```

`npm` output gets mixed with `expose_curl` output here.

See that "curl -i" line in the middle there? You can copy-paste it to the terminal, and reproduce npm's http request exactly as it was.

### Fair warnings:

 - this tool will print out anything including private data such as auth tokens
 - it is not a security tool, so it's quite possible to write code that does http request bypassing it

