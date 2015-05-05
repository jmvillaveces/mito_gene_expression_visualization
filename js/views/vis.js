var _url, _width, _fheight = 550, _pheight = 1200, _force, _gravity = -0.01, _damper = 0.1, _center, _offset = 150, _p_annotations, _radius_scale;

var _fill = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#7AA25C', '#BECCAE', '#D84B2A']);
var _stroke = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#7E965D', '#A7BB8F', '#C72D0A']);

var _charge = function(d){ return -Math.pow(d.radius, 2.0) / 8; };

var Annotations = require('./annotations');

var _buoyancy = function(alpha) {
    return function(d) {
        var val = d.y * 0.05 * alpha * alpha * alpha * 100;
        d.y = (d.regulated === 'down') ? d.y + val : (d.regulated === 'up') ? d.y - val : d.y;
    };
};

var _move_towards_center = function(alpha){
    return function(d) {
        d.x = d.x + (_center.x - d.x) * (_damper + 0.02) * alpha;
        d.y = d.y + (_center.y - d.y) * (_damper + 0.02) * alpha;
    };
};

var _display_by_process = function(){
    _force.stop();
    d3.select(_selector).transition().duration(2000).style('height', _pheight);
    
    _circles.transition().duration(2000)
        .attr('cx', function(d) {
            return d.pack.x;
        })
        .attr('cy', function(d) {
            return d.pack.y;
        })
        .attr('transform', function(d) { return 'translate(' + d.parent.px + ',' + d.parent.py + ')'; });
    
    _p_annotations.fadeIn();
};

var _display_group_all = function() {
    
    d3.select(_selector).transition().duration(2000).style('height', _fheight);
    
    _circles.attr('transform', null);
    _p_annotations.hide();
    
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

var init_process_annotations = function(){
    
    _p_annotations = $('<div id="_p_annotations" class="annotations"></div>').appendTo(_selector).hide();
    
    
    var p = _.map(_processes, function(p){
        return {px:p.px, py:p.py - 55, process: p.process, percentage: p.percentage};
    });
    var ann = new Annotations().setElement('#_p_annotations').render(p);
};

var _format_data = function(json){
    
    _center = { x:_width/2, y: _fheight/2 };
    
    var max_abs_log2 = d3.max(json.nodes, function(d) {
        return Math.abs(d.Log2fold_change);
    });
    
    _radius_scale = d3.scale.log().domain([1, max_abs_log2 + 1 ]).range([1, 30]);
    
    _data = {};
    _data.nodes = _.map(json.nodes, function(d){
        d.regulated = (d.Log2fold_change > 1.5 || d.p_value < 0.05 && d.Log2fold_change > 0) ? 'up' : 
            (d.Log2fold_change < - 1.5 || d.p_value < 0.05 && d.Log2fold_change < 0) ? 'down' : 'none';
        
        d.radius = _radius_scale(Math.abs(d.Log2fold_change) + 1);
        return d;
    });
    
    // Calculate process centers
    var rows = 4, cols = 3;
    var wScale = d3.scale.linear().domain([0, cols]).range([_offset, _width - _offset]);
    var hScale = d3.scale.linear().domain([0, rows]).range([_offset, _pheight - _offset]);
    
    _processes = _.groupBy(_data.nodes, function(n){ return n.process; });
    _processes = _.map(_processes, function(val, key){
        var affected = _.filter(val, function(n){ return (n.regulated === 'up' || n.regulated === 'down'); }).length;
        return {percentage: d3.round((affected * 100) / val.length, 2), process: key, genes : val};
    });
    
    _processes.sort(function(a,b){return b.percentage - a.percentage;});
    
    _processes = _.map(_processes, function(p){
        p.px = wScale(this.row);
        p.py = hScale(this.col);
        
        if(this.row < rows-1){
            this.row++;
        }else{
            this.row = 0;
            this.col++;
        }
        
        return p; 
    }, {col:0,row:0});
    
    _.each(_processes, function(p){
        
        //Pack Layout positions
        var bubble = d3.layout.pack()
            .sort(function(a, b) {
                return -(a.value - b.value);
            })
            .radius(function(r){ return r;})
            .value(function(d){return d.radius;})
            .children(function(d) { return d.genes;})
            .padding(1);
        
        bubble.nodes(p);
    });
    
    _data.nodes = _.map(_data.nodes, function(d){
        d.pack = {x: d.x, y: d.y};
        return _.omit(d, ['x', 'y']);
    });
    
    //init force
    _force = d3.layout.force().nodes(_data.nodes).size([_width, _fheight]);
};

var _create_vis = function(){
    
    _vis = d3.select(_selector).append('svg').attr('class', 'canvas').attr('width', _width).attr('id', 'svg_vis');
    
    _circles = _vis.selectAll('circle').data(_data.nodes, function(d){ return d.id; });
    
    _circles.enter().append('circle')
        .attr('r', 0)
        .attr('fill', function(d){ return _fill(d.regulated); })
        .attr('stroke-width', '1px')
        .attr('stroke', function(d){ return _stroke(d.regulated);})
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
    
    init_process_annotations();
    create_legend();
};

var create_legend = function(){

    var legend = d3.select('#legend')
        .append('ul')
        .attr('class', 'list-inline');

    var keys = legend.selectAll('li.key')
        .data(_fill.domain());

    keys.enter().append('li')
        .attr('class', 'key')
        .style('border-top-color', function(d){ return _fill(d);})
        .text(function(d) {
            return d;
        });
    
    var svg = d3.select('#legend').append('svg')
            .attr('width', 150)
            .attr('height', 70).append('g').attr('transform', function(d) { return 'translate(' + 35 + ',' + 35 + ')'; });
    
    var min = _.min(_data.nodes, function(d){ return Math.abs(d.Log2fold_change); });
    var max = _.max(_data.nodes, function(d){ return Math.abs(d.Log2fold_change); });
    
    var d = [min.radius, (max.radius + min.radius)/2, max.radius];
    
    svg.selectAll('circle').data(d).enter()
        .append('circle')
            .attr('r', function(d){ return d; })
            .attr('class', 'scale_circle')
            .attr('cy', function(d){ return 30 - d;});
    
    svg.selectAll('line').data(d).enter()
        .append('line')
            .attr('x1', 0)
            .attr('y1', function(d){ return 30 - 2*d; })
            .attr('x2', 60)
            .attr('y2', function(d){ return 30 - 2*d; })
            .attr('class', 'scale_line');
    
    var l = [
        { r:d[0], log: Math.abs(min.Log2fold_change)},
        { r:d[1], log: Math.abs((min.Log2fold_change + max.Log2fold_change)/2)},
        { r:d[2], log: Math.abs(max.Log2fold_change)}
    ];
    console.log(l);
    svg.selectAll('text').data(l).enter()
        .append('text')
            .attr('x', 60)
            .attr('y', function(d){ return 30 - 2*d.r; })
            .attr('class', 'scale_text')
            .text(function(d){ return d3.round(d.log,3); });
    
    //d3.round((affected * 100) / val.length, 2)
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
        _display_group_all();
    });
};

module.exports = Vis;