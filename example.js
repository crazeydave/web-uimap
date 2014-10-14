
var sampleMap = require('./ui-map-sample.js');

var locator = sampleMap.getLocator("issuePages::article(1)");

// Getting 'to' function fails
// Removed 'object' returned by the module export (getting sampleMap.getLocaror fails is it SCOPE)

console.log(locator);