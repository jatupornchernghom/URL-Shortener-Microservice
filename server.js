const express = require('express');
const cors = require('cors');
const dns = require("dns")
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false}))
app.use(express.json())
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//List with url and short url pairs
const urlList = []

//Function to append a pair to the list and create a shortener
const shortener = (url) => {
  //If the url has already been shortened, return the old 
  if(urlList.some((obj) => obj.original == url))
    return urlList.find((obj) => obj.original == url).short;

  let shortUrl = urlList.length.toString()
  urlList.push({"original": url, "short": shortUrl })
  return shortUrl
}

app.post("/api/shorturl", (req, res) => {
  const {url} = req.body;
  console.log(url)
  cleanUrl = url.replace(/^https?:\/\//, "").replace(/\/[\w\?=]*$/, "")
  console.log(cleanUrl)
  //Check valid url and show short version if it is valid.
  dns.lookup(cleanUrl, (err, addr, fam) => {
    if (err) return res.json({error: "invalid url"})
    
    let shortUrl = shortener(url)
    return res.json({"original_url": url , "short_url": Number(shortUrl)})
  })
})
//Check if a short version is in the list and if it is, redirect to it.
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const {shortUrl} = req.params
  if(urlList.some((obj) => obj.short == shortUrl))
    res.redirect(urlList.find(obj => obj.short == shortUrl).original)
  res.status(400).send("No url assigned to your shortener")
})




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
