var _ = require('underscore');
var require_directory = require('require-directory');
var URL = require('url');

var host_infos = require_directory(module, './domains');

_.forEach(host_infos, function(domain_info) {
	domain_info.title = new RegExp(domain_info.title);
});

/**
 * @param domain_info
 * @param domain_info.url
 * @param domain_info.title
 */
function clean(link_metadata) {
	var url = URL.parse(link_metadata.url);
	
	var host_info = host_infos[url.host];
	if (url.host in host_infos) {
		if (host_info.title) {
			link_metadata.title = link_metadata.title.replace(host_info.title, '');
		} 
	}
	return link_metadata;
}
module.exports = clean;