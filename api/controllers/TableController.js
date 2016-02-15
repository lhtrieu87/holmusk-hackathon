var Promise = require('bluebird');
var fetch = require('fetch');
var jp = require('jsonpath');

function rangeProp(value, key, up, low, result) {
  if(!value) {
    result[key] = 'Unknown';
  } else {
    value = parseFloat(value.value);

    if(value > up)
      result[key] = 'Red';
    else if(value < low)
      result[key] = 'Green';
    else result[key] = 'Amber';
  }

  return result;
}

function computeScore(item) {
  return new Promise(function (resolve, reject) {
    fetch.fetchUrl('https://test.holmusk.com/food/search?q=' + item + '&page=0&limit=1', function (error, meta, body) {
      var response = JSON.parse(body.toString());

      if(response.length > 0) {
        var result = {};
        rangeProp(jp.query(response, '$..total_fats')[0], 'fat', 21, 3, result);
        rangeProp(jp.query(response, '$..saturated')[0], 'saturated', 6, 1.5, result);

        rangeProp(jp.query(response, '$..sugar')[0], 'sugar', 27, 5, result);
        rangeProp(jp.query(response, '$..sodium')[0], 'salt', 1800, 300, result);

        resolve(result);
      } else {
      	resolve('Not Found');
      }
    });
  });
}


module.exports = {
  create: function (req, res) {
    var items = req.body.items;
    Promise.resolve(items)
      .map(function (item) {
        item = item.name;
        return computeScore(item);
      })
      .then(function (results) {
        res.ok(results);
      })
      .catch(function (error) {
        sails.log.error(error);
      });
  }
};
