const http = require('http');
const https = require('https');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', ['Content-Type']);
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.statusCode = 200;

  if (req.method === "OPTIONS") {
    return res.end();
  }

  if (/npi\/\d+/gi.test(req.url)) {
    const npi = /(\d+)$/gi.exec(req.url)[1];
    getNpiData(npi, function(data, err) {
      if (err) {
        res.write(JSON.stringify(err));
        return res.end();
      } else {
        res.write(JSON.stringify(data));
        return res.end();
      }
    });
  } else {
    res.statusCode = 404;
    return res.end();
  }
}).listen(3001);

function getNpiData(npi, callback) {
  console.log('looking up ' + npi);
  https.get(`https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk;
    });

    resp.on('end', () => {
      callback(JSON.parse(data));
    });

  }).on("error", (err) => {
    callback(undefined, err);
  });
}
