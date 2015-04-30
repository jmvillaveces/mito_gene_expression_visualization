var _url = '', _selector = null, _width = 500, _height = 500, _gravity = -0.01, _damper = 0.1, _center = null, _data = null, _vis = null, _circles = null, _force = null, _fill_color = null, _radius_scale = null, _p_centers = [];

var _charge = function(d){ return -Math.pow(d.radius, 2.0) / 8; };

var _buoyancy = function(alpha) {
    return function(d) {
        var val = d.y * 0.05 * alpha * alpha * alpha * 100;
        d.y = (d.color === '#d84b2a') ? d.y + val : (d.color === '#7aa25c') ? d.y - val : d.y;
    };
};

var _move_towards_center = function(alpha){
    return function(d) {
        d.x = d.x + (_center.x - d.x) * (_damper + 0.02) * alpha;
        d.y = d.y + (_center.y - d.y) * (_damper + 0.02) * alpha;
    };
};

var _move_towards_process = function(alpha) {
    return function(d) {
        var target = _p_centers[d.process];
        d.x = d.x + (target.x - d.x) * (_damper + 0.02) * alpha * 1.1;
        d.y = d.y + (target.y - d.y) * (_damper + 0.02) * alpha * 1.1;
    };
};
    

var _display_group_all = function() {
    _force.gravity(_gravity)
        .charge(_charge)
        .friction(0.9)
        .on('tick', function(e) {
            _circles.each(_move_towards_center(e.alpha)).each(_buoyancy(e.alpha))
            .attr('cx', function(d) {
                return d.x;
            })
            .attr('cy', function(d) {
                return d.y;
            });
        })
        .start();
};

var _display_by_process = function(){
    
    _force.gravity(_gravity)
        .charge(_charge)
        .friction(0.9)
        .on('tick', function(e) {
            _circles
                .each(_move_towards_process(e.alpha))
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; });
        })
        .start();
};

var _display_chart = function() {
    _force.stop();
    
    _circles
        .transition()
        .duration(2000)
        .attr('cy', function(d) {
            return d.chart.y;
        })
        .attr('cx', function(d) {
            return d.chart.x;
        });
};


var _create_vis = function(){
    _vis = d3.select(_selector).append('svg').attr('width', _width).attr('height', _height).attr('id', 'svg_vis');
    _circles = _vis.selectAll('circle').data(_data.nodes, function(d){ return d.id; });
    
    _circles.enter().append('circle')
        .attr('r', 0)
        .attr('fill', function(d){ return d.color; })
        .attr('stroke-width', '1px')
        .attr('stroke', function(d){
            return (d.color === '#d84b2a') ? '#C72D0A' : (d.color === '#7aa25c') ? '#7E965D' : '#A7BB8F';
        })
        .attr('id', function(d) { return 'bubble_' + d.id; })
        .on('mouseover', function(d, i) {
            console.log('mouseover');
        }).on('mouseout', function(d, i) {
            console.log('mouseout');
        })
        .on('click', function(d){console.log(d);})
        .transition().duration(2000).attr('r', function(d) {
            return d.radius;
        });
    
    _center = { x:_width/2, y: _height/2 };
    _force = d3.layout.force().nodes(_data.nodes).size([_width, _height]);
    _display_group_all();
};

var _format_data = function(json){
    _data = json;
    _calc_process_centers();
    
    var max_abs_log2 = d3.max(json.nodes, function(d) {
        return Math.abs(d.Log2fold_change);
    });
    
    _radius_scale = d3.scale.log().domain([1, max_abs_log2 + 1 ]).range([0.5, 30]);
    
    
    var processes = _.keys(_p_centers);
    var x = d3.scale.linear().domain([0, processes.length]).range([100, _width]).nice();
    var y = d3.scale.linear().domain(d3.extent(_data.nodes, function(d){ return d.Log2fold_change;})).range([50, 500]).nice();
    
    _data.nodes = _.map(_data.nodes, function(d){ 
        var val = Math.abs(d.Log2fold_change) + 1;
        d.radius = _radius_scale(val);
        d.color = (d.Log2fold_change > 1.5) ? '#7aa25c' : (d.Log2fold_change < - 1.5) ? '#d84b2a' : (d.p_value < 0.05 && d.Log2fold_change > 0) ? '#7aa25c' : (d.p_value < 0.05 && d.Log2fold_change < 0) ? '#d84b2a' : '#beccae';
        
        d.chart = { x: x(_p_centers[d.process].i), y: y(d.Log2fold_change) };
        
        return d;
    });
    
    _data.nodes = _data.nodes.sort(function(a,b){return b.radius - a.radius;});
};

var _calc_process_centers = function(){
    
    var rows = 4, cols = 5;
    var wScale = d3.scale.linear().domain([0, rows]).range([250, _width]);
    var hScale = d3.scale.linear().domain([0, cols]).range([250, _height]);
    
    _p_centers = _.groupBy(_data.nodes, function(n){ return n.process; }); 
    var parr = [];
    _.each(_p_centers, function(val, key){
        var affected = _.filter(val, function(n){ return (n.color === '#d84b2a' || n.color === '#7aa25c'); }).length;
        parr.push({percentage: (affected * 100)/ val.length, process: key});
    });
    
    parr.sort(function(a,b){return b.percentage - a.percentage;});
    _.each(parr, function(p, i){
        _p_centers[p.process] = { x:wScale(this.row), y:hScale(this.col), i:i };
        
        if(this.row < rows -1){ 
            this.row ++;
        }else{
            this.col ++;
            this.row =0;
        }
    }, {col:0,row:0});
};

//Public members
var Vis = function(){};
    
Vis.url = function(_){
    if (!arguments.length)
        return _url;
    _url = _;
    return Vis;
};

Vis.selector = function(_){
    if (!arguments.length)
        return _selector;
    _selector = _;
    return Vis;
};

Vis.width = function(_){
    if (!arguments.length)
        return _width;
    _width = _;
    return Vis;
};

Vis.height = function(_){
    if (!arguments.length)
        return _height;
    _height = _;
    return Vis;
};

Vis.displayTowardProcess = function(){
    _display_by_process();
};

Vis.displayGroupAll = function(){
    _display_group_all();
};

Vis.displayChart = function(){
    _display_chart();
};

Vis.init = function(){
    d3.json(_url, function(error, json) {
        if (error) return console.warn(error);
        _format_data(json);
        _create_vis();
    });
};

module.exports = Vis;