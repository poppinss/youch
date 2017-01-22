# Youch!
> Pretty error reporting for Node.js :rocket:

<br />

<p>
  <a href="http://res.cloudinary.com/adonisjs/image/upload/v1485019153/Youch_g3vj4f.jpg">
    <img src="http://res.cloudinary.com/adonisjs/image/upload/v1485019153/Youch_g3vj4f.jpg" style="width: 600px;" />
  </a>
</p>

<br />

---

<br />

Youch is inspired by [Whoops](https://filp.github.io/whoops) but with a modern design. Reading stack trace of the console slows you down from active development. Instead **Youch** print those errors in structured HTML to the browser.

## Features
1. HTML reporter
2. JSON reporter, if request accepts a json instead of text/html.
3. Sorted frames of error stack.

## Installation
```bash
npm i --save youch
```

## Basic Usage
Youch is used by [AdonisJs](http://adonisjs.com), but it can be used by express or raw HTTP server as well.

```javascript
const Youch = require('youch')
const http = require('http')

http.createServer(function (req, res) {

  // PERFORM SOME ACTION
  if (error) {
    const youch = new Youch(error, req)

    youch
    .toHTML()
    .then((html) => {
      res.writeHead(200, {'content-type': 'text/html'})
      res.write(html)
      res.end()
    })
  }

}).listen(8000)
```

## Release History
Checkout [CHANGELOG.md](CHANGELOG.md) file for release history.

## Meta
Checkout [LICENSE.txt](LICENSE.txt) for license information
Harminder Virk (Aman) - [https://github.com/thetutlage](https://github.com/thetutlage)
