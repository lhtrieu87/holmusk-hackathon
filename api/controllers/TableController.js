var Promise = require('bluebird');
var fetch = require('fetch');
var jp = require('jsonpath');

module.exports = {
  create: function (req, res) {
    var items = req.body.items;
    Promise.resolve(items)
      .map(function (item) {
        item = item.name.split(' ')[0];
        return new Promise(function (resolve, reject) {
          fetch.fetchUrl('https://test.holmusk.com/food/search?q=' + item + '&page=0&limit=1', function (error, meta, body) {
            var response = JSON.parse(body.toString());

            if(parseFloat(jp.query(response, '$..total_fats')[0].value) > 21 ||
              parseFloat(jp.query(response, '$..saturated')[0].value) > 6 ||
              parseFloat(jp.query(response, '$..sugar')[0].value) > 27 ||
              parseFloat(jp.query(response, '$..sodium')[0].value) > 1800)
              resolve('Red')
            else if(parseFloat(jp.query(response, '$..total_fats')[0].value) < 3 ||
              parseFloat(jp.query(response, '$..saturated')[0].value) < 1.5 ||
              parseFloat(jp.query(response, '$..sugar')[0].value) < 5 ||
              parseFloat(jp.query(response, '$..sodium')[0].value) < 300)
              resolve('Green');
            else
            	resolve('Amber');
          });
        });
      })
      .then(function (results) {
        res.ok(results);
      })
      .catch(function (error) {
        sails.log.error(error);
      });
  }
};
