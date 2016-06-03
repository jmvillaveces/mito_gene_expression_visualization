// Required scripts
var _ = require('underscore');
var areaCalc = require('./circle.geo.js');

function dataFormatter(dataset){
    
    var data = {};
    
    data.nodes = dataset.nodes;
    
    data.processes = _.groupBy(data.nodes, function(n){ return n.process; });
    data.processes = _.map(data.processes, function(genes, key){
    
        //Number of regulated genes
        var up = _.filter(genes, function(g){ return g.Log2fold_change > 1.5; }),
            down = _.filter(genes, function(g){ return g.Log2fold_change < -1.5; }),
            none = _.filter(genes, function(g){ return (g.Log2fold_change > -1.5 && g.Log2fold_change < 1.5) ; }),
            regulated = up.length + down.length,
            log = _.reduce(genes, function(memo, n){ return memo + Math.abs(n.Log2fold_change); }, 0),
            p_id = _.uniqueId('process_');
        
        return {
            id: p_id,
            process: key, 
            genes : genes,
            Log2fold_change: log,
            regulated: regulated,
            down: down,
            up: up,
            none: genes.length ,
        };
        
        
    });
    
    data.processes.sort(function(a,b){return b.regulated_genes - a.regulated_genes;});
    
    //Calculate radius for all nodes
    var all_nodes = _.flatten( [data.processes, data.nodes] );
    var max_abs_log2 = d3.max( all_nodes, function(d) {
        return Math.abs(d.Log2fold_change);
    });
    
    var radiusScale = areaCalc.areaScale([1, max_abs_log2 + 1 ], [2, 20]);
    _.each(all_nodes, function(d){
        d.r = radiusScale(Math.abs(d.Log2fold_change) + 1);
    });
    
    data.nodes.sort(function(a, b){ return (a.regulated < b.regulated) ? -1 : (a.regulated > b.regulated) ? 1 : 0; });
    
    
    
    return data;
}

module.exports = dataFormatter;

