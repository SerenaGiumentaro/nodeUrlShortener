require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3001;
const urlsList = [];
let urlCounter = 0;
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const urlShorterMiddleware = (req, res, next) => {
  const urlObject = new URL(req.body.url);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (!isValidUrl(req.body.url)) {
    return res.json({ error: 'invalid url' });
  }
  
  dns.lookup(urlObject.hostname, (err) => {
    if (err) {
      console.log(err)
      return res.json({ error: "invalid url" });
    }
    next();
  });
};

app.post("/api/shorturl", urlShorterMiddleware, (req, res) => {
  const originalUrl = req.body.url;
  const newUrl = new URL(originalUrl);
  urlCounter++;
  const shortUrl = urlCounter;
  const urlObj = { url: newUrl.href, shortUrl: shortUrl };
  urlsList.push(urlObj);
  res.json({ original_url: newUrl, short_url: shortUrl });
});
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = +req.params.shortUrl

  const originalUrl =  urlsList.find(url => url.shortUrl === shortUrl)

  console.log(urlsList, shortUrl)
  if (originalUrl) {
    res.redirect(originalUrl.url);
  } else {
    res.json({ error: 'invalid url' });
  }
})
