var templates = require('../templates');

module.exports = Backbone.View.extend({
    
    events: {
        'click #save' : 'onSaveClick',
        'keyup input' : 'search'
    },
    
    template: templates.navBar,
    
    render: function(){
        this.$el.append(this.template({}));
        return this;
    },
    
    onSaveClick : function(e){
        d3.selectAll("#save")
            .attr("href", "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(d3.selectAll("#svg_vis")
                .attr("version", "1.1").attr("xmlns", "http://www.w3.org/2000/svg").node().parentNode.innerHTML)))).attr("download",'image.svg');
    },
    
    search : function(e){
        App.views.vis.search($(e.target).val());
    }
});