// Required scripts
var dataFormatter = require('../dataFormatter.js');
var regulation = require('../geneRegulation')();


// Variables
var selector,
    svg, // SVG tag
    width = 900, // vis width
    height = 900, //vis height
    padding = 100,
    offset = 150,
    maxRadius = 10,
    view, // current view (process, group, chart, network)
    data, // variable holding all vis data
    processes, // process rings 
    genes, // gene circles
    annotations, // div process annotations
    links,
    fill = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#3498db', '#BECCAE', '#e74c3c']),
    stroke = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#2171b5', '#A7BB8F', '#C72D0A']),
    highlightColor = '#FFFBCC',
    mutationColor = '#2c3e50',
    templates = require('../templates.js'),
    prPadding = 1.7,
    clickEvent = {target: null, holdClick: false};

function initVis(){
    
    var resp = d3.select(selector)
        .append('div')
        .attr('class', 'svg-container'); //container class to make it responsive
    
    svg = resp
        .append('svg')
        .attr('class', 'canvas svg-content-responsive')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', [0, 0, width, height].join(' '))
        .attr('id', 'svg_vis')
        .on('click', onClick);
    
    // Init links!
    initLinks();
    
    var root = { id:'root', genes:data.processes };
    
    var diameter = d3.min([width, height]) * 0.65,
        format = d3.format(",d");

    var pack = d3.layout.pack()
        .size([diameter - 4, diameter - 4])
        .children(function(d){ return d.genes;})
        .value(function(d) { return Math.abs(d.Log2FoldChange); })
        .sort(function(a,b){
            
            if(a.genes && b.genes){
                return  b.regulated - a.regulated;
            }
            
            return a.value - b.value;
        })
        .nodes(root);
    
    // Use all space available while keeping padding between elements
    var pxMin = _.min(data.processes, function(d){return d.x;}),
        pyMin = _.min(data.processes, function(d){return d.y;}),
        xMin = - (pxMin.x * prPadding) + pxMin.r,
        yMin = - (pyMin.y * prPadding) + pyMin.r;
    
    _.each(data.processes, function(d){
        d.original = {};
        d.original.x = d.x;
        d.original.y = d.y;
        d.x = (d.x * prPadding) + xMin;
        d.y = (d.y * prPadding) + yMin;
    });
    
    _.each(data.nodes, function(d){
        d.x = d.x + (d.parent.x - d.parent.original.x);
        d.y = d.y + (d.parent.y - d.parent.original.y);
    });
    
    var g = svg.append('g');
    
    g.datum(root)
        .selectAll('g')
        .data(data.processes).enter()
        .append('g')
        .attr('id', function(d) { return  d.id; })
        .each(handleProcess);
    
    
    
    function handleProcess(d){
        
        var g = d3.select(this)
                .append('g')
                .attr('class', 'process')
                .attr('transform', function(d){ return 'translate(' + d.x + ',' + d.y + ')'; }),
            innerR = d.r * 0.8,
            arr = [ 
                { stroke: stroke('up'), color: fill('up'), Log2FoldChange: d.up.length}, 
                { stroke: stroke('none'), color: fill('none'), Log2FoldChange: d.none.length }, 
                { stroke: stroke('down'), color: fill('down'), Log2FoldChange: d.down.length }
            ],
            arc = d3.svg.arc()
                .innerRadius(innerR)
                .outerRadius(d.r),
            pie = d3.layout.pie()
                .sort(null)
                .value(function(d) { return d.Log2FoldChange; });
        
        // Add background circle circle to hide links and listen to events
        g.selectAll('circle').data([d])
            .enter().append('circle')
            .attr('fill', '#ffffff')
            .attr('id', function(d) { return 'circle_' + d.id; })
            .attr('r', d.r)
            .attr('stroke-width', 2)
            .attr('stroke', function(d){ 
                var p = _.pluck(d.genes, 'Variant_sites');
                return (p.join('').length > 0) ? mutationColor : null;
            })
            .on('mouseout', onMouseOut)
            .on('mouseover', onMouseOverNode);
        
        // Create ring
        g.selectAll('path').data(pie(arr))
            .enter().append('path')
            .attr('fill', function(d) { return d.data.color; })
            .attr('d', arc)
            .style('pointer-events', 'none'); // only the backgound circle listens to events
        
        // Create text path
        /*var txtArc = d3.svg.arc()
            .innerRadius(d.r)
            .outerRadius(d.r + 11)
            .startAngle(0)
            .endAngle(2 * Math.PI);
        
        g.append('path')
            .attr('id', function(d){ return 'txtPath' + d.id; })
            .attr('d', getPath)
            .style('fill', 'none');
        
        g.append('text')
                .style("text-anchor","middle")
            .append('textPath')
                .attr('xlink:href', function(d){ return '#txtPath' + d.id; })
	           .attr('startOffset', '50%')	
                .text(function(d) { return d.Process; });*/
        
        
        handleGenes.call(this, d);
        
    }
    
    function handleGenes(d){
        
        var g = d3.select(this)
            .append('g')
            .attr('class', 'genes');
        
        g.selectAll('circle').data(d.genes)
            .enter().append('circle')
                .attr('id', function(d) { return  d.id; })
                .attr('r', function(d){ return d.r; })
                .attr('fill', function(d){ return fill(d.regulated); })
                .attr('cx', function(d){ return d.x; })
                .attr('cy', function(d){ return d.y; })
                .attr('opacity', 0)
                .attr('display','none')
                .attr('stroke-width', function(d){ return (d.mutation.length) ? 1.2 : 1; })
                .attr('stroke', function(d){ return (d.mutation.length) ? mutationColor : stroke(d.regulated);})
                .attr('class', function(d){ return 'gene ' + d.parent.id; })
                .on('mouseout', onMouseOut)
                .on('mouseover', onMouseOverNode);
    }
    
    function getPath(d){
        
        //M start-x, start-y A radius-x, radius-y, x-axis-rotation, large-arc-flag, sweep-flag, end-x, end-y
        //M0,300 A200,200 0 0,1 400,300
        
        var x1 = - d.r,
            x2 = d.r,
            y1 = 0,
            y2 =  0;
        
        return 'M ' + x1 + ',' + y1 + ' A ' + d.r + ',' + d.r +' 0 0, 1, ' + x2 + ',' + y2;
    }
    
    /***************************** 
     * Create process Annotations
     *****************************/
    
    var ann_scale = d3.scale.log().domain(d3.extent(data.processes, function(d){ return d.r; })).range([8,12]);
    
    annotations = svg.selectAll('.node')
                        .data(data.processes);
    
    var txt = annotations.enter()
        .append('text')
        .attr('x', function(d){ return d.x;})
        .attr('y', function(d){ return d.y + d.r;})
        .attr('class', 'node theme')
        .style('text-anchor','middle')
        .style('font-size', function(d){ return ann_scale(d.r); })
        .on('mouseover', function(d){
            if(clickEvent.holdClick) return;
            
            d3.select(this).select('.handle').transition(3000).style('opacity', 1);
            d3.select(this).transition(3000).style('font-size', function(d){ return 1.1 * ann_scale(d.r); });
            
        })
        .on('mouseout', function(d){ 
            d3.select(this).select('.handle').transition(3000).style('opacity', 0);
            d3.select(this).transition(3000).style('font-size', function(d){ return ann_scale(d.r); });
        })
        .on('click', function(d){
        
            
            if(clickEvent.holdClick) return;
        
            var handle = d3.select(this).select('.handle'),
                g = d3.select('#' + d.id),
                process = g.select('.process'),
                genes = g.selectAll('.' + d.id);
        
        
            if(handle.text() === '+'){
                
                genes
                    .style('display', 'inline')
                    .transition(1000)
                    .attr('opacity', 1);
                
                process
                    .transition(1000)
                    .attr('opacity', 0)
                    .each('end', function(d){ process.style('display', 'none'); });
                
                handle.text('-');
            }else{
                
                process
                    .style('display', 'inline')
                    .transition(1000)
                    .attr('opacity', 1);
                
                genes
                    .transition(1000)
                    .attr('opacity', 0)
                    .each('end', function(d){ genes.style('display', 'none'); });
                
                handle.text('+');
            }
        })
        .each(appendTSpan);
    
    function appendTSpan(d){
        
        var txt = d3.select(this),
            words = d.Process.split(' '),
            y = 0;
        
        words.unshift('+');
        txt.selectAll('tspan')
            .data(words)
            .enter()
            .append('tspan')
            .attr('dy', function(j){
                var dy = ann_scale(d.r);
                y += dy;
                return dy;
            })
            .attr('x', d.x)
            .attr('class', function(d){ return (d === '+') ? 'handle' : ''; })
            .attr('opacity', function(d){ return (d === '+') ? 0 : 1; })
            .text(function(j){ return j; });
    }
    
    
        
    //.text(function(d){ return d.Process;});
    
    
    /*var div = d3.select(selector)
        .append('div')
        .attr('class', 'node-label-container');
    
    processAnnotations = div.selectAll('div').data(data.processes);
    
    processAnnotations.enter().append('div')
        .html(annTemplate)
        .attr('style', function(d){
            var x = d.x,
                y = d.y + d.r;
        
            return 'position:absolute; font-size:' + ann_scale(d.r) + 'px; left:' + x + 'px; top:' + y + 'px'; 
        })
        .on('mouseover', function(d){
            if(clickEvent.holdClick) return;
            d3.select(this).select('span').transition(2000).style('opacity', 1);
        })
        .on('mouseout', function(d){ 
            d3.select(this).select('span').transition(2000).style('opacity', 0);
        })
        .on('click', function(d){
        
            if(clickEvent.holdClick) return;
        
            var span = d3.select(this).select('span'),
                g = d3.select('#' + d.id),
                process = g.select('.process'),
                genes = g.selectAll('.' + d.id);
        
        
            if(span.classed('glyphicon-plus-sign')){
                
                genes
                    .style('display', 'inline')
                    .transition(1000)
                    .attr('opacity', 1);
                
                process
                    .transition(1000)
                    .attr('opacity', 0)
                    .each('end', function(d){ process.style('display', 'none'); });
                
                span.classed('glyphicon-plus-sign', false).classed('glyphicon-minus-sign', true);
            }else{
                
                process
                    .style('display', 'inline')
                    .transition(1000)
                    .attr('opacity', 1);
                
                genes
                    .transition(1000)
                    .attr('opacity', 0)
                    .each('end', function(d){ genes.style('display', 'none'); });
                
                span.classed('glyphicon-minus-sign', false).classed('glyphicon-plus-sign', true);
            }
        });*/
    
    //select all genes
    genes = d3.selectAll('.genes');
    //select all processes
    processes = d3.selectAll('.process');
}

// Initialize paths to display node relationships
function initLinks(){
    
    var edges = _.chain(data.links)
                .values()
                .flatten()
                .value(),
        maxLinks = _.chain(data.links)
                    .values()
                    .sortBy('length')
                    .last()
                    .value()
                    .length,
        g = svg.append('g').attr('id', 'links');
    
    // Data structure to store all variables related to links
    links = {};
    links.paths = g.selectAll('path').data(_.range(0, maxLinks)) // Append paths
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('opacity', 1)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(44, 62, 80, 0.4)');
    
    links.scale = d3.scale.linear().domain(d3.extent(edges, function(l){ return l.links; })).range([2,10]);  
}

var onMouseOut = function(node){
    
    if(clickEvent.holdClick) return;
    
    links.paths.attr('opacity', 0);
    
    processes.attr('opacity', 1);
    d3.selectAll('.gene').attr('opacity', 1);
    annotations.style('opacity', 1);
};

var onMouseOverNode = function(node){
    
    if(clickEvent.holdClick) return;
    
    var nodeLinks = data.links[node.id], 
        neighbors = _.chain(nodeLinks)
                    .map(function(l){ 
                        if( node.id === l.source.id) return l.target.id;
                        return l.source.id;    
                    })
                    .value();
    
    
    // Add target to neighbors
    neighbors.push(node.id);
    
    links.paths.each(function(n, i){
    
         if(nodeLinks.length > i){
            
            var l = nodeLinks[i],
                source = l.source,
                target = l.target,
                s_display = d3.select('#' + source.id).style('display'),
                t_display = d3.select('#' + target.id).style('display');
             
             if(s_display !== 'none' && t_display !== 'none'){
                
                d3.select(this)
                    .style('stroke-width', links.scale(l.links))
                    .attr('opacity', 1)
                    .attr('d', function (d) {
                        var dx = target.x - source.x, dy = target.y - source.y, dr = Math.sqrt(dx * dx + dy * dy);
                        return 'M' + source.x + ',' + source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + target.x + ',' + target.y;
                });
             }
         }
    });
    
    function notNeighbors(n){
        return ! _.contains(neighbors, n.id);
    }
    
    d3.selectAll('.gene').filter(notNeighbors).attr('opacity', 0.2);
    processes.filter(notNeighbors).attr('opacity', 0.2);
    annotations.filter(notNeighbors).style('opacity', 0.2);
};

var onClick = function(){
    
    var target = d3.event.target,
        name = target.tagName.toLowerCase(),
        id = target.id;
        
    if( (name === 'circle' && _.isNull(clickEvent.target)) || (name === 'circle' && id === clickEvent.target.id) ){
        clickEvent.holdClick = true;
        clickEvent.target = target;
    }else{
        clickEvent.target = null;
        clickEvent.holdClick = false;
        onMouseOut();
    }
};

// Search genes by name
function search(str){
    
    d3.selectAll('.search').classed('search', false);
    
    if(str.length < 3) return;
    
    str = str.toLowerCase();
    
    var matchingGenes = d3.selectAll('.gene')
                        .filter(function(d){ return d.Name.toLocaleLowerCase().match(str); })
                        .classed('search', true);
    
    matchingGenes.each(function(d){
    
        if( d3.select(this).style('display') === 'none'){
            // process is visible set class
            d3.select('#' + d.parent.id).select('circle').classed('search', true);
        } 
    });   
}


//Public members
var Vis = function(){};

Vis.selector = function(_){
    if (!arguments.length)
        return selector;
    selector = _;
    return Vis;
};

Vis.search = function(str){ 
    search(str);
    return Vis;
};

Vis.displayNetwork = function(){
    view = 'network';
};

Vis.init = function(nodes, links){
    data = dataFormatter(nodes, links);
    initVis();
};

module.exports = Vis;