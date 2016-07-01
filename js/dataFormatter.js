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
    
    
    /***************************
     *
     * Calculate Links!
     *
     ***************************/
    var nodeDic = {},
        processDic = {},
        linkDic = {};
    
    // Create node dictionary 
    // (many nodes can have same name)
    _.each(data.nodes, function(n){ 
        
        if(_.isUndefined(nodeDic[n.Name])){
            nodeDic[n.Name] = [];
        }
        nodeDic[n.Name].push(n);
    });
    
    // Create process dictionary
    _.each(data.processes, function(n){
        processDic[n.Process] = n;
    });
    
    _.each(links, function(l){
        
        // Arrays of nodes with same name 
        // (genes with same name can belong to different processes)
        var sources = nodeDic[l.source],
            targets = nodeDic[l.target];
            
        //some nodes in links may not be present
        if(_.isUndefined(sources) || _.isUndefined(targets)) return;
         
        _.each(sources, function(s){
        
            _.each(targets, function(t){
            
                var p1 = processDic[s.Process],
                    p2 = processDic[t.Process];
        
                // Only take into account interactions from different processes
                if(p1.id === p2.id) return;
                
                addLink(s, t);
                addLink(p1, p2);
                addLink(s, p2);
                addLink(p1, t);
            });
        });
    });
    
    function addLink(){
       
        var arg = _.sortBy(arguments, 'id'),
            s = arg[0],
            t = arg[1];
        
        var id = s.id + t.id;
        
        if(_.isUndefined(linkDic[id])){
            linkDic[id] = { source:s, target:t, links:1 };
        }else{
            linkDic[id].links += 1;   
        }
    }
    
    var nodeLinkDict = {};
    _.each(linkDic, function(l, k){
        
        var s = l.source,
            t = l.target;
        
        addElement(s.id, l);
        addElement(t.id, l);
    });
    
    function addElement(k, l){
        if(_.isUndefined(nodeLinkDict[k])){
            nodeLinkDict[k] = [];
        }
        nodeLinkDict[k].push(l);
    }
    
    data.links = nodeLinkDict;
    
    return data;
}

module.exports = dataFormatter;

