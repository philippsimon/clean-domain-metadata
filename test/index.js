var _ = require('underscore');
var async = require('async');
var request = require('request');
var require_directory = require('require-directory');
var cheerio = require('cheerio');

var domain_infos_map = require_directory(module, '../domains');
var domain_tests_map = require_directory(module, './domains');
var clean_info = require('../index');

var tests = [];
_.forEach(domain_infos_map, function(domain_info, domain) {
	if (!(domain in domain_tests_map)) {
		throw new Error('test is missing for ' + domain);
	}
	var test = domain_tests_map[domain];
	if (test instanceof Array) {
		test.forEach(function(test) {
			tests.push(test);
		});
	} else {
		tests.push(test);
	}
});

async.mapLimit(tests, 5, function _iterator(test, callback) {
	request.get(test.url, function(error, response, body) {
		if (error || response.statusCode !== 200) {
			throw new Error('Problem with ' + test.url);
		}
		
		var $ = cheerio.load(body, {
			decodeEntities: false
		});
		
		var cleaned_info = clean_info({
			url: test.url,
			title: $('title').html()
		});
		
		if (cleaned_info.title !== test.title) {
			console.error(cleaned_info, test);
			callback(new Error("titles don't match"), cleaned_info);
		} else {
			callback(null, cleaned_info);
		}
	});
}, function _callback(error, results) {
	if (error) {
		throw error;
	}
	console.log('all tests finished');
});