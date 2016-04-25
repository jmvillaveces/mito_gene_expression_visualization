// Required scripts
var _areaCalc = require('../circle.geo.js');
var _processPositions = require('../data/process_positions.json');

var _url, // data location
    _width, // vis width
    _height = 550, //vis height
    _processHeight = 1200, //process height
    _force, // force layout
    _gravity = -0.01, 
    _damper = 0.1, 
    _center, // svg center
    _offset = 150, 
    _processAnnotations, // div process annotations  
    _radiusScale, 
    _view, // current view (process, group, chart, network)
    _data, // variable holding all vis data
    _geneCircles, // gene circles
    _processCircles, 
    _links,
    _fill = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#3690c0', '#BECCAE', '#D84B2A']),
    _stroke = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#2171b5', '#A7BB8F', '#C72D0A']),
    _templates = require('../templates.js'),
    _holdClick = false; // track click event

// Initialize tooltip
var _tipTemplate = _templates.tooltip;
var _tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return _tipTemplate(d); });

// Annotations template
var _annTemplate = _templates.annotation;

// Force charge
var _charge = function(d){ 
    return -Math.pow(d.radius, 2.0) / 8; 
};

// Move gens up or down according to expression
var _buoyancy = function(alpha) {
    return function(d) {
        var val = d.y * 0.05 * alpha * alpha * alpha * 100;
        d.y = (d.regulated === 'down') ? d.y + val : (d.regulated === 'up') ? d.y - val : d.y;
    };
};

var _moveTowardsCenter = function(alpha){
    return function(d) {
        d.x = d.x + (_center.x - d.x) * (_damper + 0.02) * alpha;
        d.y = d.y + (_center.y - d.y) * (_damper + 0.02) * alpha;
    };
};

// Group genes by process
var _displayByProcess = function(){
    _force.stop(); // stop force
    d3.selectAll('.axis').style('opacity', 0);
    d3.select(_selector).transition().duration(2000).style('height', _processHeight);
    
    // Transition genes to process positions
    _geneCircles.transition().duration(2000)
        .attr('cx', function(d) {
            return d.parent.px + d.pack.x;
        })
        .attr('cy', function(d) {
            return d.parent.py + d.pack.y;
        });
    
    _processAnnotations.style('opacity', 1);
};

// Move genes toward the center focal point of the visualization
var _displayGroupAll = function() {
    
    d3.select(_selector).transition().duration(2000).style('height', _height);
    
    d3.selectAll('.axis').style('opacity', 0);
    _geneCircles.attr('transform', null);
    _processAnnotations.style('opacity', 0);
    
    _force.gravity(_gravity)
        .charge(_charge)
        .friction(0.9)
        .on('tick', function(e) {
            _geneCircles.each(_moveTowardsCenter(e.alpha)).each(_buoyancy(e.alpha))
                .attr('cx', function(d) {
                    return d.x;
                })
                .attr('cy', function(d) {
                    return d.y;
                });
        })
        .start();
};

// Display processes as a network
var _displayNetwork = function(){
    
    d3.selectAll('.axis').style('opacity', 0);
    _geneCircles
        .attr('transform', null)
        .style('display', 'none')
        .attr('opacity', 0);
    
    _processAnnotations.style('opacity', 1);
    
    _processCircles
        .attr('cx', function(d) {
            return d.network.x ;
        })
        .attr('cy', function(d) {
            return d.network.y ;
        });
    
    _processCircles.transition().duration(3000).attr('opacity', 1);
    
};

// Move genes to chart positions
var _displayChart = function() {
    _force.stop();
    _processAnnotations.style('opacity', 0);
    
    _geneCircles
        .attr('cx', function(d){ return (_view === 'group') ? d.x : d.pack.x * 20; })
        .attr('cy', function(d){ return (_view === 'group') ? d.y : d.pack.y * 20; })
        .attr('transform', null);
    
    _geneCircles.transition().duration(2000)
        .attr('cx', function(d){ return d.chart.x; })
        .attr('cy', function(d){ return d.chart.y; });
    
    d3.selectAll('.axis').transition().duration(2000).style('opacity', 1);
};

// Initialize paths to display node relationships
var _initLinks = function(){
    
    // Join process and gene links
    var links = _.union(_data.p_links, _data.links);
    
    // Create link dictionary to prevent iteration over all links
    var l_dic = {};
    function get_node(n){
        if(_.isUndefined(l_dic[n.id])){
            l_dic[n.id] = [];
        }
        return l_dic[n.id];
    }
    
    _.each(links, function(l){       
        get_node(l.source).push(l);
        get_node(l.target).push(l);
    });
    
    // Calculate higher number of links to be displayed
    var number = 0;
    _.each(l_dic, function(v, k){
        number = (number > v.length) ? number : v.length;
    });
    
    var g = _vis.append('g').attr('id', '_links');
    
    // Data structure to store all variables related to links
    _links = {};
    _links.paths = g.selectAll('path').data(_.range(0, number)) // Append paths
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('opacity', 1)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(95, 96, 98, 0.4)');
    
    _links.scale = d3.scale.linear().domain(d3.extent(links, function(l){ return l.links; })).range([2,10]);
    
    _links.data = l_dic;
};

var _initProcesses = function(){
    
    var g = _vis.append('g').attr('id', '_processes');
    
    _processCircles = g.selectAll('g').data(_data.processes);
    
    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.Log2fold_change; });

    var arc = d3.svg.arc();
    
    _processCircles.enter().append('g')
        .attr('id', function(d) { return  d.id; })
        .attr('class', 'process')
        .attr('opacity', 0)
        .attr('transform', function(d){ return 'translate(' + d.network.x + ',' + d.network.y + ')'; })
        .on('mouseout', _onMouseOut)
        .on('mouseover', _onMouseOverNode);
    
    function appendArch(d){
        
        var g = d3.select(this),
            r = d.r * 0.7,
            arr = [ 
                { stroke: _stroke('up'), color: _fill('up'), Log2fold_change:d.up}, 
                { stroke: _stroke('none'), color: _fill('none'), Log2fold_change:d.none }, 
                { stroke: _stroke('down'), color: _fill('down'), Log2fold_change: d.down }
            ];
        
        arc.innerRadius(r)
            .outerRadius(d.r);
        
        // Add background circle circle to hide links and listen for events
        g.selectAll('circle').data([d])
            .enter().append('circle')
            .attr('fill', '#ffffff')
            .attr('r', d.r)
            .attr('stroke-width', 2)
            .attr('stroke', function(d){ 
                var p = _.pluck(d.genes, 'Variant_sites');
                return (p.join('').length > 0) ? '#333333' : null;
            });
        
        // Create ring
        g.selectAll('path').data(pie(arr))
            .enter().append('path')
            .attr('fill', function(d) { return d.data.color; })
            .attr('stroke', function(d) { return d.data.stroke; })
            .attr('stroke-width', 1)
            .attr('d', arc)
            .style('pointer-events', 'none'); // only the backgound circle listens to events
        
        // Add text
        /*g.append('text')
            .attr('dy', r * 0.2)
            .attr('font-size', r * 0.5)
            .attr('fonr-family', 'Montserrat')
            .style('text-anchor', 'middle')
            .text(function(d) { return '56%'; });*/
        
    }
    
    _processCircles.each(appendArch);
    
    /*
    // append concentric circles
    function append_circles(d){
        
        var g = d3.select(this),
            a = d.r * d.r * Math.PI,
            arr = [ 
                { stroke: _stroke('up'), color: _fill('up'), r: _areaCalc.getRadius(d.up * a/100) }, 
                { stroke: _stroke('none'), color: _fill('none'), r: _areaCalc.getRadius(d.none * a/100) }, 
                { stroke: _stroke('down'), color: _fill('down'), r: _areaCalc.getRadius(d.down * a/100) }
            ];
        
        // Sort concentric circles by ascending radius
        arr = _.sortBy(arr, function(n){ return - n.r; });
        
        g.selectAll('circle').data(arr)
            .enter()
            .append('circle')
                .attr('fill', function(n){ return n.color; })
                .attr('stroke-width', 1)
                .attr('stroke', function(d){ return d.stroke; })
                .attr('r', function(n){ return n.r; })
                .style('pointer-events', function(n, i){ return (i === 0) ? 'auto' : 'none'; }); // pointer events only for bigest circle
    }
    
    _processCircles.enter().append('g')
        .attr('id', function(d) { return  d.id; })
        .attr('class', 'process')
        .attr('opacity', 0)
        .attr('transform', function(d){ return 'translate(' + d.network.x + ',' + d.network.y + ')'; })
        //.on('click', function(p){})
        .on('mouseout', _onMouseOut)
        .on('mouseover', _onMouseOverNode);
    
        _processCircles.each(append_circles);*/
};

var _onClick = function(){
    
    var target = d3.event.target;
    
    if(_view === 'network'){
        
        switch( target.tagName.toLowerCase() ) {
        
            case 'circle':
                _holdClick = true;
                break;
            
            case 'svg':
                _holdClick = false;
                _onMouseOut();
                break;
        }
    }
};

var _onMouseOut = function(node){
    
    if(_holdClick) return;
    
    _links.paths.attr('opacity', 0);
    _processCircles.attr('opacity', 1);
    _geneCircles.attr('opacity', 1);
    _processAnnotations.style('opacity', 1);
};

var _onMouseOverNode = function(node){
    
    if(_holdClick) return;
    
    var nodeLinks = _links.data[node.id], neighbors = [];
            
    _links.paths.each(function(n, i){
        if(nodeLinks.length > i){
            var l = nodeLinks[i],
                source = l.source,
                target = l.target,
                s_display = d3.select('#' + source.id).style('display'),
                t_display = d3.select('#' + target.id).style('display');
            
            if(s_display !== 'none' && t_display !== 'none'){
                
                d3.select(this)
                    .style('stroke-width', _links.scale(l.links))
                    .attr('opacity', 1)
                    .attr('d', function (d) {
                        var dx = target.network.x - source.network.x, dy = target.network.y - source.network.y, dr = Math.sqrt(dx * dx + dy * dy);
                        return 'M' + source.network.x + ',' + source.network.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + target.network.x + ',' + target.network.y;
                });

                neighbors.push(source.id);
                neighbors.push(target.id);
            }
        }
    });
                              
    function notNeighboors(n){
        return ! _.contains(neighbors, n.id);
    }
    
    _geneCircles.filter(notNeighboors).attr('opacity', 0.2);
    _processCircles.filter(notNeighboors).attr('opacity', 0.2);
    _processAnnotations.filter(notNeighboors).style('opacity', 0.2);
};

var _initProcessAnnotations = function(){
    
    var ann_scale = d3.scale.log().domain(d3.extent(_data.processes, function(d){ return d.r; })).range([10,16]);
    
    var div = d3.select(_selector)
        .append('div')
        .attr('class', 'node-label-container');
    
    _processAnnotations = div.selectAll('div').data(_data.processes);
    
    _processAnnotations.enter().append('div')
        .html(_annTemplate)
        .attr('style', function(d){ return 'position:absolute; font-size:' + ann_scale(d.r) + 'px; left:' + d.network.x + 'px; top:' + (d.network.y + d.r) + 'px'; })
        .on('mouseover', function(d){
            if(_holdClick) return;
        
            d3.select(this).select('span').transition(2000).style('opacity', 1);
        })
        .on('mouseout', function(d){ 
            d3.select(this).select('span').transition(2000).style('opacity', 0);
        })
        .on('click', function(d){
        
            if(_holdClick) return;
        
            var span = d3.select(this).select('span'),
                genes = d3.selectAll('.' + d.id),
                process = d3.select('#' + d.id);
            
            
            if(span.classed('glyphicon-plus-sign')){
                
                genes.attr('cx', function(d) {
                    return d.parent.network.x;
                })
                .attr('cy', function(d) {
                    return d.parent.network.y;
                });
                
                process
                    .attr('opacity', 1)
                    .transition(2000)
                    .attr('opacity', 0)
                    .each('end', function(d){ process.style('display', 'none'); });

                genes.transition(2000)
                    .attr('opacity', 1)
                    .style('display', 'inline')
                    .attr('cx', function(d) {
                        return d.network.x;
                    })
                    .attr('cy', function(d) {
                        return d.network.y;
                    });
                
                span.classed('glyphicon-plus-sign', false).classed('glyphicon-minus-sign', true);
            }else{

                genes.transition(2000)
                    .attr('opacity', 0)
                    .attr('cx', function(d) {
                        return d.parent.network.x;
                    })
                    .attr('cy', function(d) {
                        return d.parent.network.y;
                    })
                    .each('end', function(d){ d3.select(this).style('display', 'none'); });
                
                process.style('display', 'inline')
                    .attr('opacity', 0)
                    .transition(2000)
                    .attr('opacity', 1);
                
                span.classed('glyphicon-minus-sign', false).classed('glyphicon-plus-sign', true);
            }
        });
};

var _formatData = function(json){
    
    var duplicates = _.chain(json.nodes).groupBy('name').filter(function(v){return v.length > 1;}).flatten().value();
    
    console.log(duplicates);
    
    _center = { x:_width/2, y: _height/2 };
    
    _data = {};
    _data.nodes = _.map(json.nodes, function(d){
        d.regulated = (d.Log2fold_change > 1.5 || d.p_value < 0.05 && d.Log2fold_change > 0) ? 'up' : 
            (d.Log2fold_change < - 1.5 || d.p_value < 0.05 && d.Log2fold_change < 0) ? 'down' : 'none';

        return d;
    });
    
    // Calculate process centers
    var rows = 4, cols = 3;
    var wScale = d3.scale.linear().domain([0, cols]).range([_offset, _width - _offset]);
    var hScale = d3.scale.linear().domain([0, rows]).range([_offset, _processHeight - _offset]);
    
    function getPercentage(n, total){
        return n * 100 / total;
    }
    
    function countLog2(arr){
        return _.reduce(arr, function(memo, d){
            return memo + Math.abs(d.Log2fold_change);
        }, 0);
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
            log += Math.abs(n.Log2fold_change);
            
            n.p_id = p_id;
            
            return n.regulated;
        });
        
        var regulated_genes = getPercentage(regulated, genes.length);
        
        return {
            regulated_genes: d3.round(regulated_genes, 2), 
            process: key, 
            genes : genes, 
            id: p_id,
            down: (reg_groups.down) ? getPercentage(countLog2(reg_groups.down), log) : 0,
            up: (reg_groups.up) ?  getPercentage(countLog2(reg_groups.up), log) : 0,
            none: (reg_groups.none) ?  getPercentage(countLog2(reg_groups.none), log) : 0,
            Log2fold_change: log,
            network: _processPositions[p_id]
        };
    });
    
    _data.processes.sort(function(a,b){return b.regulated_genes - a.regulated_genes;});
    
    //Calculate radius for all nodes
    var all_nodes = _.flatten( [_data.processes, _data.nodes] );
    var max_abs_log2 = d3.max( all_nodes, function(d) {
        return Math.abs(d.Log2fold_change);
    });
    
    _radiusScale = _areaCalc.areaScale([1, max_abs_log2 + 1 ], [2, 20]);
    _.each(all_nodes, function(d){
        d.radius = _radiusScale(Math.abs(d.Log2fold_change) + 1);
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
        d.network = {x: d.parent.network.x + d.pack.x, y: d.parent.network.y + d.pack.y};
        return _.omit(d, ['x', 'y']);
    });
    
    _data.nodes.sort(function(a, b){ return (a.regulated < b.regulated) ? -1 : (a.regulated > b.regulated) ? 1 : 0; });
    
    //Calculate Links!
    var node_dic = {}, process_links_dic = {};
    _.each(_data.nodes, function(n){ node_dic[n.id] = n; });
    
    function get_link(source, target){
        var k = source.id + target.id;
        
        if(_.isUndefined(process_links_dic[k])){
            process_links_dic[k] = { source: source , target: target, links: 0 };
        }
        
        return process_links_dic[k];
    }
    
    var nodeProcessDic = {};
    function getPLink(n, p){
        if(_.isUndefined(nodeProcessDic[n.id])){
            nodeProcessDic[n.id] = { source: n, target: p, links: 0 };
        }
        return nodeProcessDic[n.id];
    }
    
    function process_links(l){
        
        var source = node_dic[l.source];
        var target = node_dic[l.target];
        var p1 = source.parent;
        var p2 = target.parent;
        
        var b = p1.process.localeCompare(p2.process), p_link;
        
        if(b === -1){
            p_link = get_link(p1, p2);
            p_link.links ++;
        }else if (b === 1){
            p_link = get_link(p2, p1);
            p_link.links ++;
        }
        
        // Calculate process - node links
        if(p1.id !== p2.id){
            getPLink(source, p2).links ++; 
            getPLink(target, p1).links ++;
        }
        
        return { source: source , target: target};
    }
    
    _data.links = _.filter( _.map(json.links, process_links), function(l){ return l.target.process !== l.source.process; });
    _data.links = _.flatten([ _data.links, _.values(nodeProcessDic)]);
    _data.p_links = _.values(process_links_dic);
    
    //init force
    _force = d3.layout.force().nodes(_data.nodes).size([_width, _height]);
};

var _initChart = function(){
    var margins = { top: 50, right: 50, bottom: 20, left: 50};
    var pvalExtent = d3.extent(_data.nodes, function(d){ return d.p_value;});
    var xRange = d3.scale.linear().range([margins.left, _width - margins.right]).domain(pvalExtent);
    var log2Extent = d3.extent(_data.nodes, function(d){ return d.Log2fold_change;});
    var yRange = d3.scale.linear().range([_height - margins.top, margins.bottom]).domain(log2Extent);
    
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
        .attr('transform', 'translate(0,' + (_height - margins.bottom) + ')')
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

var _createVis = function(){
    
    _vis = d3.select(_selector)
        .append('svg')
        .attr('class', 'canvas')
        .attr('width', _width)
        .attr('id', 'svg_vis')
        .on('click', _onClick);
    
    // Render links before circles
    _initLinks();
    
    _geneCircles = _vis.selectAll('circle').data(_data.nodes, function(d){ return d.id; });
    
    _geneCircles.enter().append('circle')
        .attr('r', 0)
        .attr('fill', function(d){ return _fill(d.regulated); })
        .attr('stroke-width', function(d){ return (d.Variant_sites.length) ? 1.2 : 1; })
        .attr('stroke', function(d){ return (d.Variant_sites.length) ? '#333333' : _stroke(d.regulated);})
        .attr('id', function(d, i) { return d.id; })
        .attr('class', function(d){ return d.p_id; })
        .on('mouseover', function(d){ 
            _tip.show(d);
            _onMouseOverNode(d);
        })
        .on('mouseout', function(d){ 
            _tip.hide(d);
            _onMouseOut(d);
        })
        .on('click', function(d){console.log(d);})
        .transition().duration(2000).attr('r', function(d) {
            return d.radius;
        })
        .call(_tip);
    
    _initChart();
    _initProcessAnnotations();
    _initProcesses();
    _createLegend();
};

var _createLegend = function(){

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
            .attr('height', 50).append('g').attr('transform', function(d) { return 'translate(' + 15 + ',' + 10 + ')'; });
    
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
            .attr('height', 34).append('g').attr('transform', function(d) { return 'translate(' + 15 + ',' + 15 + ')'; });
    
    svg.selectAll('circle').data([d[2]]).enter()
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
    _displayByProcess();
    _view = 'process';
};

Vis.displayGroupAll = function(){
    _displayGroupAll();
    _view = 'group';
};

Vis.displayChart = function(){
    _displayChart();
    _view = 'chart';
};

Vis.displayNetwork = function(){
    _displayNetwork();
    _view = 'network';
};

Vis.init = function(){
    d3.json(_url, function(error, json) {
        if (error) return console.warn(error);
        _formatData(json);
        _createVis();
        Vis.displayNetwork();
    });
};

module.exports = Vis;