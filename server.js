var express = require('express');
var path = require('path');
var ejs = require('ejs');
var mongoose = require('mongoose');
var chibiurl = mongoose.connect(process.env.MONGOLAB_URI);
var chibiurlSchema = new mongoose.Schema({
  url: String,
  chibi: String,
  extension: Number
});
//Thanks to odysseas for his great valid-url module! More information at https://www.npmjs.com/package/valid-url
var validUrl = require('valid-url');
var app = express();
var chibiurlModel = chibiurl.model('chibiurl', chibiurlSchema);
var arg;

mongoose.Promise = global.Promise;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/*', function(req, res) {
  arg = req.path.slice(1);

  if (validUrl.isWebUri(arg)){
        console.log('Looks like an URI');
    } else {
        console.log('Not a URI');
    }

  if (validUrl.isUri(arg)) {
    isValid(res, arg);
  } else {
    notValid(res, arg);
  }
});

function isValid(res, arg) {

  chibiurlModel.count({}, function(err, count) {
    let newUrl = arg;
    let newChibi = 'https://chibi-url.herokuapp.com/' + count.toString();
    let newExtension = count;

    let testEntry = new chibiurlModel({
      url: newUrl,
      chibi: newChibi,
      extension: newExtension
    });
    testEntry.save();
    res.send({"original-url": newUrl, "short-url": newChibi});
  });
}

function notValid(res, arg) {
  chibiurlModel.findOne({extension: arg}, function(err, entry) {
    if (entry === null) {
      res.send({"error": "Oops! The url you entered isn't valid and isn't showing up in our database."});
    } else {
      res.redirect(entry.url);
    }
  });
}

app.listen(process.env.PORT || 1337, function() {
});
