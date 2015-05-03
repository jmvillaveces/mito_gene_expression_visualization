var _url, _width, _height, _force;

var _fill = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#7AA25C', '#BECCAE', '#D84B2A']);
var _stroke = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#7E965D', '#A7BB8F', '#C72D0A']);

var _format_data = function(json){
    
    var max_abs_log2 = d3.max(json.nodes, function(d) {
        return Math.abs(d.Log2fold_change);
    });
    
    var radius_scale = d3.scale.log().domain([1, max_abs_log2 + 1 ]).range([1, 30]);
    
    _data = {};
    _data.nodes = _.map(json.nodes, function(d){
        d.regulated = (d.Log2fold_change > 1.5 || d.p_value < 0.05 && d.Log2fold_change > 0) ? 'up' : 
            (d.Log2fold_change < - 1.5 || d.p_value < 0.05 && d.Log2fold_change < 0) ? 'down' : 'none';
        
        d.radius = radius_scale(Math.abs(d.Log2fold_change) + 1);
        return d;
    });
    
    // Calculate process centers
    var rows = 4, cols = 3;
    var wScale = d3.scale.linear().domain([-1, cols + 1 ]).range([0, _width]);
    var hScale = d3.scale.linear().domain([-1, rows + 1 ]).range([25, _height]);
    
    _processes = _.groupBy(_data.nodes, function(n){ return n.process; });
    _processes = _.map(_processes, function(val, key){
        var affected = _.filter(val, function(n){ return (n.reg === 'up' || n.reg === 'down'); }).length;
        return {percentage: (affected * 100) / val.length, process: key, genes : val};
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
    
    //Pack Layout positions
    var bubble = d3.layout.pack()
        .sort(function(a, b) {
            return -(a.value - b.value);
        })
        .radius(function(r){ return r;})
        .size([_width, _height])
        .value(function(d){return d.radius;})
        .children(function(d) { return d.genes;})
        .padding(1);
    
    bubble.nodes({genes:_processes, name:'root'});
    
    _data.nodes = _.map(_data.nodes, function(d){
        d.pack = {x: d.x, y: d.y};
        d.x = 0;
        d.y = 0;
        return d;
    });
};

var _create_vis = function(){
    _vis = d3.select(_selector).append('svg').attr('class', 'canvas').attr('width', _width).attr('height', _height).attr('id', 'svg_vis');
    
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
        })
        //.attr('transform', function(d) { return 'translate(' + d.parent.px + ',' + d.parent.py + ')'; });
        .attr('transform', function(d) { return 'translate(0,0)'; });
    
    _circles.attr('cx', function(d){return d.pack.x;})
        .attr('cy', function(d){return d.pack.y;});

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