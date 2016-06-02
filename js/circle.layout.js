var d3 = require('d3');

function circleLayout(radius, key, origin){

    
    if(typeof origin === 'undefined'){
        origin = {x : 0, y : 0};
    }
    
    
    return function(elements){
        
        
        var angles = d3.range(0, 2 * Math.PI, 2 * Math.PI/elements.length);
        
        
        angles.forEach(function(a, i){
        
            var e = elements[i];
            
            e[key] = {};
            e[key].x = origin.x + radius * Math.cos(a);
            e[key].y = origin.y + radius * Math.sin(a);
        });
    };
}

module.exports = circleLayout;