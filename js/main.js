var d3 = require('d3');

//Public members
var App = {};

App.init = function(options){
    
     
    
    
    //Views
    var Main = require('./views/main');
    var ButtonGroup = require('./views/buttonGroup');
    
    App.views = {};
    App.views.vis = require('./views/process.vis.js');
    
    App.views.main = new Main();
    App.views.main.setElement('body').render();
    
    App.views.buttonGroup = new ButtonGroup();
    App.views.buttonGroup.setElement('#navbar').render();
    
    App.views.vis.selector('#vis').width(1170);
    
    
    d3.json('../data/mouse-21.3.json', function(error, nodes) {
        if (error) return console.warn(error);
        
        d3.json('../data/links.json', function(error, links) {
            if (error) return console.warn(error);
            
            App.views.vis.init(nodes, links);
        });
        
    });
    
    
    
    
};

module.exports = App;