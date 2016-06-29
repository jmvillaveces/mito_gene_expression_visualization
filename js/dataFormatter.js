// Required scripts
var _ = require('underscore');
var regulation = require('./geneRegulation')();


function dataFormatter(nodes, links){
    
    var data = {};
    
    data.nodes = _.map(nodes, function(n){
        n.id = _.uniqueId(n.Name + '_');
        return n;
    });
    
    data.processes = _.groupBy(data.nodes, function(n){ return n.Process; });
    data.processes = _.map(data.processes, function(genes, key){
    
        var process = {};
        
        process.id = _.uniqueId('process_');
        
        process.up = _.chain(genes).filter(regulation.isUpRegulated).map( function(d){ return _.extend(d, {'regulated': 'up'}); } ).value();
        process.down = _.chain(genes).filter(regulation.isDownRegulated).map( function(d){ return _.extend(d, {'regulated': 'down'}); } ).value();
        process.none = _.chain(genes).filter(regulation.isNotRegulated).map( function(d){ return _.extend(d, {'regulated': 'none'}); } ).value();
        
        process.Process = key;
        process.genes = genes;
        process.Log2FoldChange = _.reduce(genes, function(memo, n){ return memo + Math.abs(n.Log2FoldChange); }, 0);
        process.regulated = process.up.length + process.down.length;
        
        //Assign genes a parent
        _.each(genes, function(g){
            g.parent = process;
        });
        
        return process;
    });
    
    // Sort by number of regulated genes
    data.processes.sort(function(a,b){
        return b.regulated - a.regulated;
    });
    
    data.nodes.sort(function(a, b){ 
        return (a.regulated < b.regulated) ? -1 : (a.regulated > b.regulated) ? 1 : 0; 
    });
    
    //Calculate Links!
    var nodeDic = {},
        processLinksDic = {},
        nodeProcessDic = {},
        nlinks = [];
    
    // Create node dictionary
    _.each(data.nodes, function(n){ 
        
        if(_.isUndefined(nodeDic[n.Name])){
            nodeDic[n.Name] = [];
        }
        
        nodeDic[n.Name].push(n);
    });
    
    function getLink(source, target){
        var k = source.id + target.id;
        
        if(_.isUndefined(processLinksDic[k])){
            processLinksDic[k] = { source: source , target: target, links: 0 };
        }
        
        return processLinksDic[k];
    }
    
    function getPLink(n, p){
        if(_.isUndefined(nodeProcessDic[n.id])){
            nodeProcessDic[n.id] = { source: n, target: p, links: 0 };
        }
        return nodeProcessDic[n.id];
    }
    
    
    function processLink(source, target){
        var p1 = source.parent,
            p2 = target.parent,
            b = p1.Process.localeCompare(p2.Process),
            pLink;
        
        //Do not add links from same biological process
        if(p1 === p2) return;
        
        if(b === -1){
            pLink = getLink(p1, p2);
            pLink.links ++;
        }else if (b === 1){
            pLink = getLink(p2, p1);
            pLink.links ++;
        }
        
        // Calculate process - node links
        if(p1.id !== p2.id){
            getPLink(source, p2).links ++; 
            getPLink(target, p1).links ++;
        }
        
        nlinks.push({ source: source , target: target});
    }
    
    
    function processLinks(l){
        
        var sources = nodeDic[l.source], // Several nodes with same name
            targets = nodeDic[l.target]; // Some genes bellong to multiple processess
        
        _.each(sources, function(s){
            _.each(targets, function(t){
                processLink(s, t);
            }); 
        });
        
    }
    
    _.each(links, processLinks);
    
    data.links = nlinks;
    data.pLinks = _.values(nodeProcessDic);
    
    return data;
}

module.exports = dataFormatter;

