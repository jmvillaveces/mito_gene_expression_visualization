function circle(){}

// Calculate circle radius given an area
circle.getRadius = function(area){
    return Math.sqrt( area / Math.PI);
};

// Calculate circle area given a radius
circle.getArea = function(radius){
    return radius * radius * Math.PI;
};
module.exports = circle;