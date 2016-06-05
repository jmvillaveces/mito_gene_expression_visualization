/*
 *    Extract Links from sample1.json to use as default link file
 */
var fs = require('fs');
var data = require('../data/sample1.json');


fs.writeFile('../data/links.json',  JSON.stringify(data.links), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The links file was saved!");
}); 

fs.writeFile('../data/nodes.json',  JSON.stringify(data.nodes), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The nodes file was saved!");
}); 