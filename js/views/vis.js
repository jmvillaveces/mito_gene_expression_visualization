var _url, _width, _fheight = 550, _pheight = 1200, _force, _gravity = -0.01, _damper = 0.1, _center, _offset = 150, _p_annotations, _radius_scale, _view, _data, _circles, _process_circles;

var p_pos = require('../data/process_positions.json');

var _fill = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#3690c0', '#BECCAE', '#D84B2A']);
var _stroke = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#2171b5', '#A7BB8F', '#C72D0A']);

var _charge = function(d){ return -Math.pow(d.radius, 2.0) / 8; };

// Initialize tooltip
var _tipTemplate = require('../templates.js').tooltip;
var _tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return _tipTemplate(d); });

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
    d3.selectAll('.axis').style('opacity', 0);
    d3.select(_selector).transition().duration(2000).style('height', _pheight);
    
    _circles.transition().duration(2000)
        .attr('cx', function(d) {
            return d.parent.px + d.pack.x;
        })
        .attr('cy', function(d) {
            return d.parent.py + d.pack.y;
        });
    
    _p_annotations.style('opacity', 1);
};

var _display_group_all = function() {
    
    d3.select(_selector).transition().duration(2000).style('height', _fheight);
    
    d3.selectAll('.axis').style('opacity', 0);
    _circles.attr('transform', null);
    _p_annotations.style('opacity', 0);
    
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

var _display_network = function(){
    
    _circles
        .attr('transform', null)
        .style('opacity', 0);
    
    _p_annotations.style('opacity', 0);
    
    _process_circles
        .attr('cx', function(d) {
            return d.network.x ;
        })
        .attr('cy', function(d) {
            return d.network.y ;
        });
    
    _process_circles.transition().duration(3000).style('opacity', 1);
    
};

var _display_chart = function() {
    _force.stop();
    _p_annotations.style('opacity', 0);
    
    _circles
        .attr('cx', function(d){ return (_view === 'group') ? d.x : d.pack.x * 20; })
        .attr('cy', function(d){ return (_view === 'group') ? d.y : d.pack.y * 20; })
        .attr('transform', null);
    
    _circles.transition().duration(2000)
        .attr('cx', function(d){ return d.chart.x; })
        .attr('cy', function(d){ return d.chart.y; });
    
    d3.selectAll('.axis').transition().duration(2000).style('opacity', 1);
};

var _init_processes = function(){
    
    var g = _vis.append('g').attr('id', '_processes');
    
    _process_circles = g.selectAll('circle').data(_data.processes);
    
    _process_circles.enter().append('circle')
        .attr('fill', '#3690c0')
        .attr('r', function(d) { return d.r; })
        .attr('id', function(d) { return  d.id; })
        .attr('class', 'process')
        .style('opacity', 0)
        .on('click', function(p){
        
            var genes = d3.selectAll('.'+p.id)
                .attr('cx', function(d) {
                    return d.parent.network.x;
                })
                .attr('cy', function(d) {
                    return d.parent.network.y;
                });
        
            d3.select(this).transition(2000).style('r', 0);
        
            genes.transition(2000)
                .style('opacity', 1)
                .attr('cx', function(d) {
                    return d.parent.network.x + d.pack.x ;
                })
                .attr('cy', function(d) {
                    return d.parent.network.y + d.pack.y ;
                });
        
        });
};

var _init_process_annotations = function(){
    
    _p_annotations = _vis.append('g').attr('id', '_p_annotations');
    
    var ann = _p_annotations.selectAll('text').data(_data.processes);
    
    ann.enter().append('text')
        .attr('class', 'annotation')
        .attr('text-anchor', 'middle')
        .attr('y', function(d){return d.py - 55;})
        .attr('x', function(d){return d.px;})
        .append('tspan')
        .attr('dy', 0)
        .text(function(d){return d.process;})
        .append('tspan')
        .attr('x', function(d){return d.px;})
        .attr('dy', 15)
        .text(function(d){return d.regulated_genes + '%';});
};

var _format_data = function(json){
    
    _center = { x:_width/2, y: _fheight/2 };
    
    _data = {};
    _data.nodes = _.map(json.nodes, function(d){
        d.regulated = (d.Log2fold_change > 1.5 || d.p_value < 0.05 && d.Log2fold_change > 0) ? 'up' : 
            (d.Log2fold_change < - 1.5 || d.p_value < 0.05 && d.Log2fold_change < 0) ? 'down' : 'none';

        return d;
    });
    
    // Calculate process centers
    var rows = 4, cols = 3;
    var wScale = d3.scale.linear().domain([0, cols]).range([_offset, _width - _offset]);
    var hScale = d3.scale.linear().domain([0, rows]).range([_offset, _pheight - _offset]);
    function getPercentage(n, total){
        return n * 100 / total;
    }   
    
    var i = 1;
    _data.processes = _.groupBy(_data.nodes, function(n){ return n.process; });
    _data.processes = _.map(_data.processes, function(genes, key){
        
        //Number of regulated genes
        var regulated = 0;
        var log = 0;
        var p_id = 'process_' + (++i);
        
        var reg_groups = _.groupBy(genes, function(n){
            regulated = (n.regulated === 'up' || n.regulated === 'down' || n.Chromosome_number.length > 0) ? regulated + 1 : regulated;
            log += n.Log2fold_change;
            
            n.p_id = p_id;
            
            return n.regulated;
        });
        
        var regulated_genes = getPercentage(regulated, genes.length);
        
        return {
            regulated_genes: d3.round(regulated_genes, 2), 
            process: key, 
            genes : genes, 
            id: p_id,
            down: (regulated_genes.down) ? getPercentage(regulated_genes.down.length, genes.length) : 0,
            up: (regulated_genes.up) ?  getPercentage(regulated_genes.up.length, genes.length) : 0,
            none: (regulated_genes.none) ?  getPercentage(regulated_genes.none.length, genes.length) : 0,
            Log2fold_change: log,
            network: p_pos[p_id]
        };
    });
    
    _data.processes.sort(function(a,b){return b.regulated_genes - a.regulated_genes;});
    
    //Calculate radius for all nodes
    var all_nodes = _.flatten( [_data.processes, _data.nodes] );
    var max_abs_log2 = d3.max( all_nodes, function(d) {
        return Math.abs(d.Log2fold_change);
    });
    
    _radius_scale = d3.scale.log().domain([1, max_abs_log2 + 1 ]).range([1, 30]);
    _.each(all_nodes, function(d){
        d.radius = _radius_scale(Math.abs(d.Log2fold_change) + 1);
    });
    
    _data.processes = _.map(_data.processes, function(p){
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
    
    _.each(_data.processes, function(p){
        
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
    
    _data.nodes.sort(function(a, b){ return (a.regulated < b.regulated) ? -1 : (a.regulated > b.regulated) ? 1 : 0; });
    
    //init force
    _force = d3.layout.force().nodes(_data.nodes).size([_width, _fheight]);
};

var _init_chart = function(){
    var margins = { top: 50, right: 50, bottom: 20, left: 50};
    var pvalExtent = d3.extent(_data.nodes, function(d){ return d.p_value;});
    var xRange = d3.scale.linear().range([margins.left, _width - margins.right]).domain(pvalExtent);
    var log2Extent = d3.extent(_data.nodes, function(d){ return d.Log2fold_change;});
    var yRange = d3.scale.linear().range([_fheight - margins.top, margins.bottom]).domain(log2Extent);
    
    var xAxis = d3.svg.axis()
        .scale(xRange)
        .tickSize(2)
        .tickValues([0.05].concat(pvalExtent))
        .tickSubdivide(true)
        .tickFormat(d3.format('.1r'));
    
    var yAxis = d3.svg.axis()
        .scale(yRange)
        .tickSize(2)
        .tickValues([0, -1.5, 1.5].concat(log2Extent))
        .orient('left')
        .tickSubdivide(true)
        .tickFormat(d3.format('.3r'));
    
    _vis.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (_fheight - margins.bottom) + ')')
        .attr('opacity', 0)
        .call(xAxis)
        .append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'end')
            .attr('y', -5)
            .attr('dx', '-50')
            .attr('x', _width)
            .text('p-value');
 
    _vis.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + (margins.left) + ',0)')
        .attr('opacity', 0)
        .call(yAxis)
        .append('text')
            .attr('class', 'y label')
            .attr('text-anchor', 'end')
            .attr('y', -35)
            .attr('transform', 'rotate(-90)')
            .text('log2 fold chain');
    
    var d = [{x1:0, y1:1.5, x2: pvalExtent[1] ,y2:1.5 }, {x1:0, y1:-1.5, x2: pvalExtent[1] ,y2:-1.5}, {x1:0.05, y1:log2Extent[0], x2: 0.05 ,y2:log2Extent[1]}];
    
    var g = _vis.append('g');
    
    var lines = g.selectAll('line').data(d);
    lines.enter().append('line')
            .attr('x1', function(d){ return xRange(d.x1);})
            .attr('x2', function(d){ return xRange(d.x2);})
            .attr('y1', function(d){ return yRange(d.y1);})
            .attr('y2', function(d){ return yRange(d.y2);})
            .attr('fill', '#000')
            .attr('class', 'axis scale_line tick');
    
    _data.nodes = _.map(_data.nodes, function(d){
        d.chart =  {x:xRange(d.p_value), y:yRange(d.Log2fold_change)};
        return d;
    });
};

var _create_vis = function(){
    
    _vis = d3.select(_selector).append('svg').attr('class', 'canvas').attr('width', _width).attr('id', 'svg_vis');
    
    _circles = _vis.selectAll('circle').data(_data.nodes, function(d){ return d.id; });
    
    _circles.enter().append('circle')
        .attr('r', 0)
        .attr('fill', function(d){ return _fill(d.regulated); })
        .attr('stroke-width', function(d){ return (d.Variant_sites.length) ? 1.2 : 1; })
        .attr('stroke', function(d){ return (d.Variant_sites.length) ? '#333333' : _stroke(d.regulated);})
        .attr('id', function(d) { return 'bubble_' + d.id; })
        .attr('class', function(d){ return d.p_id; })
        .on('mouseover', _tip.show)
        .on('mouseout', _tip.hide)
        .on('click', function(d){console.log(d);})
        .transition().duration(2000).attr('r', function(d) {
            return d.radius;
        })
        .call(_tip);
    
    _init_chart();
    _init_process_annotations();
    _init_processes();
    _create_legend();
};

var _create_legend = function(){

    var legend = d3.select('#color_scale')
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
    
    // Size
    var svg = d3.select('#size_scale').append('svg')
            .attr('width', 150)
            .attr('height', 70).append('g').attr('transform', function(d) { return 'translate(' + 35 + ',' + 35 + ')'; });
    
    var min = _.min(_data.nodes, function(d){ return Math.abs(d.Log2fold_change); });
    var max = _.max(_data.nodes, function(d){ return Math.abs(d.Log2fold_change); });
    
    var d = [min.radius, (max.radius + min.radius)/2, max.radius];
    
    svg.selectAll('circle').data(d).enter()
        .append('circle')
            .attr('r', function(d){ return d; })
            .attr('class', 'size_circle')
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
    
    svg.selectAll('text').data(l).enter()
        .append('text')
            .attr('x', 60)
            .attr('y', function(d){ return 30 - 2*d.r; })
            .attr('class', 'scale_text')
            .text(function(d){ return d3.round(d.log,3); });
    
    // Border
    svg = d3.select('#border_scale').append('svg')
            .attr('width', 34)
            .attr('height', 34).append('g').attr('transform', function(d) { return 'translate(' + 17 + ',' + 17 + ')'; });
    
    svg.selectAll('circle').data([d[1]]).enter()
        .append('circle')
            .attr('r', function(d){ return d; })
            .attr('class', 'border_circle');
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
    _view = 'process';
};

Vis.displayGroupAll = function(){
    _display_group_all();
    _view = 'group';
};

Vis.displayChart = function(){
    _display_chart();
    _view = 'chart';
};

Vis.init = function(){
    d3.json(_url, function(error, json) {
        if (error) return console.warn(error);
        _format_data(json);
        _create_vis();
        //_display_group_all();
        _display_network();
    });
};

module.exports = Vis;