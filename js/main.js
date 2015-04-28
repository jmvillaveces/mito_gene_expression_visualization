var _url = '';

//Public members
var App = function(){};
    
App.url = function(_){
    if (!arguments.length)
        return _url;
    _url = _;
    return App;
};

App.init = function(){
    d3.json(_url, function(error, json) {
        if (error) return console.warn(error);
        data = json;
        console.log(json);
    });
};

module.exports = App;