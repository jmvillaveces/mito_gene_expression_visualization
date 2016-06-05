// Required scripts
var dataFormatter = require('../dataFormatter.js');

// Variables
var selector,
    svg, // SVG tag
    width, // vis width
    height = 550, //vis height 
    offset = 150,
    view, // current view (process, group, chart, network)
    data, // variable holding all vis data
    processes,
    processAnnotations, // div process annotations
    links,
    fill = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#3498db', '#BECCAE', '#e74c3c']),
    stroke = d3.scale.ordinal().domain(['up', 'none', 'down']).range(['#2171b5', '#A7BB8F', '#C72D0A']),
    highlightColor = '#FFFBCC',
    mutationColor = '#2c3e50',
    templates = require('../templates.js'),
    annTemplate = templates.annotation; // Annotations template

function initVis(){
    
    svg = d3.select(selector)
        .append('svg')
        .attr('class', 'canvas')
        .attr('width', width)
        .attr('id', 'svg_vis');
    
    var g = svg.append('g')
        .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');
    
    
    //Pack Layout positions
    var bubble = d3.layout.pack()
        .sort(function(a, b) {
            return -(a.regulated - b.regulated);
        })
        .radius(function(r){ return r;})
        .value(function(d){return d.r;})
        .children(function(d) { return d.children;})
        .padding(80);
        
    bubble.nodes({children: data.processes});
    
    //Init processess
    processes = g.selectAll('g').data(data.processes, function(d){ return d.id; });
    
    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.Log2FoldChange; });

    var arc = d3.svg.arc();
    
    processes.enter().append('g')
        .attr('id', function(d) { return  d.id; })
        .attr('class', 'process')
        .attr('opacity', 1)
        .attr('transform', function(d){ return 'translate(' + d.x + ',' + d.y + ')'; });
    
    function packGenes(p){
        // Node Pack Layout positions
        var nodePack = d3.layout.pack()
            .sort(function(a, b) {
                return -(a.value - b.value);
            })
            .radius(function(r){ return r;})
            .value(function(d){return d.r;})
            .children(function(d) { return d.genes;})
            .padding(2);

            nodePack.nodes(p);
    }
    
    function appendArch(d){
        
        var g = d3.select(this),
            r = d.r * 0.7,
            arr = [ 
                { stroke: stroke('up'), color: fill('up'), Log2FoldChange: d.up.length}, 
                { stroke: stroke('none'), color: fill('none'), Log2FoldChange: d.none.length }, 
                { stroke: stroke('down'), color: fill('down'), Log2FoldChange: d.down.length }
            ];
        
        arc.innerRadius(r)
            .outerRadius(d.r);
        
        // Add background circle circle to hide links and listen for events
        g.selectAll('circle').data([d])
            .enter().append('circle')
            .attr('fill', '#ffffff')
            .attr('id', function(d) { return 'circle_' + d.id; })
            .attr('r', d.r)
            .attr('stroke-width', 2)
            .attr('stroke', function(d){ 
                var p = _.pluck(d.genes, 'Variant_sites');
                return (p.join('').length > 0) ? mutationColor : null;
            });
        
        // Create ring
        g.selectAll('path').data(pie(arr))
            .enter().append('path')
            .attr('fill', function(d) { return d.data.color; })
            .attr('d', arc)
            .style('pointer-events', 'none'); // only the backgound circle listens to events
        
        var geneGroup = g.append('g');
        
        //Init genes
        packGenes(d);
        var genes = g.selectAll('circle').data(d.genes, function(d){ return d.id; });
    
        genes.enter().append('circle')
            .attr('id', function(d) { return  d.id; })
            .attr('r', function(d){ return d.r; })
            .attr('fill', function(d){ return fill('up'); })
            .attr('cx', function(d){ return d.x; })
            .attr('cy', function(d){ return d.y; })
            .attr('stroke-width', function(d){ return (d.mutation.length) ? 1.2 : 1; })
            .attr('stroke', function(d){ return (d.mutation.length) ? mutationColor : stroke('up');})
            .attr('class', function(d){ return d.parent.id; });
        
        /*_geneCircles.enter().append('circle')
        .attr('r', 0)
        .attr('fill', function(d){ return _fill(d.regulated); })
        .attr('stroke-width', function(d){ return (d.Variant_sites.length) ? 1.2 : 1; })
        .attr('stroke', function(d){ return (d.Variant_sites.length) ? _mutationColor : _stroke(d.regulated);})
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
        .call(_tip);*/
        
    }
    
    processes.each(appendArch);
    
    // Create process Annotations
    var ann_scale = d3.scale.log().domain(d3.extent(data.processes, function(d){ return d.r; })).range([10,16]);
    
    var div = d3.select(selector)
        .append('div')
        .attr('class', 'node-label-container');
    
    processAnnotations = div.selectAll('div').data(data.processes);
    
    processAnnotations.enter().append('div')
        .html(annTemplate)
        .attr('style', function(d){
        
            var x = width/2 + d.x,
                y = height/2 + d.y + d.r;
        
            return 'position:absolute; font-size:' + ann_scale(d.r) + 'px; left:' + x + 'px; top:' + y + 'px'; 
        })
        .on('mouseover', function(d){
            //if(_clickEvent.holdClick) return;
            d3.select(this).select('span').transition(2000).style('opacity', 1);
        })
        .on('mouseout', function(d){ 
            d3.select(this).select('span').transition(2000).style('opacity', 0);
        })
        .on('click', function(d){
        
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

Vis.width = function(_){
    if (!arguments.length)
        return width;
    width = _;
    return Vis;
};

Vis.search = function(str){ 
    //_search(str);
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