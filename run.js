/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var uiMap = require('./web-uimap.js');

console.log(uiMap);

//console.log(uiMap.to("Dave::One.Two()"));

uiMap.load('./lib/ui-map-sample_1.js');

setTimeout(function () {

var locator = uiMap.to("issuePages::article(1)");

},
3000);