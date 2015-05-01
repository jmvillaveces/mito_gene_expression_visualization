//Public members
var App = {};

App.init = function(options){
    
    //Views
    var Main = require('./views/main');
    var ButtonGroup = require('./views/buttonGroup');
    
    App.views = {};
    App.views.vis = require('./views/vis');
    
    App.views.main = new Main();
    App.views.main.setElement('body').render();
    
    App.views.buttonGroup = new ButtonGroup();
    App.views.buttonGroup.setElement('#navbar').render();
    
    
    
    App.views.vis.url('sample1.json').selector('#vis').height($('#vis').height()).width($('#vis').width()).init();
};

module.exports = App;