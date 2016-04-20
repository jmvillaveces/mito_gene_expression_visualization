function circle(){}

// Calculate circle radius given an area
circle.getRadius = function(area){
    return Math.sqrt( area / Math.PI);
};

// Calculate circle area given a radius
circle.getArea = function(radius){
    return radius * radius * Math.PI;
};

circle.areaScale = function(domain, range){

    var areaRange = _.map(range, circle.getArea),
        scale = d3.scale.log().domain(domain).range(areaRange);
    
    return function(val){
        return circle.getRadius(scale(val));
    };
};

module.exports = circle;