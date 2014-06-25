This tool allows you to capture incoming/outgoing HTTP requests and re-play them.

Firebug has a neat feature called "Copy as cURL" in network tab, which works for firefox. For any requests browser did, you can copy the request in the form of curl command, paste it into the terminal, and basically replay the request. I wanted to have the same thing in console node.js applications, so here it is.

Fair warnings:
 - this tool will print out anything including private data such as auth tokens
 - it is not a security tool, so it's quite possible to write code that does http request bypassing it

