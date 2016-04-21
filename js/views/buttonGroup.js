var templates = require('../templates');

module.exports = Backbone.View.extend({
    
    events: {
        'change input[name=vis_setting]' : 'onVisSettingChange',
        'click #save' : 'onSaveClick'
    },
    
    template: templates.buttonGroup,
    
    render: function(){
        this.$el.append(this.template({}));
        return this;
    },
    
    onVisSettingChange : function(e){
        var val = $(e.target).val();
        if(val === 'all'){
            App.views.vis.displayGroupAll();
        }else if (val === 'chart'){
            App.views.vis.displayChart();
        }else if (val === 'process'){
            App.views.vis.displayTowardProcess();
        }else if (val === 'network'){
            App.views.vis.displayNetwork();
        }
    },
    
    onSaveClick : function(e){
        d3.selectAll("#save")
            .attr("href", "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(d3.selectAll("#svg_vis")
                .attr("version", "1.1").attr("xmlns", "http://www.w3.org/2000/svg").node().parentNode.innerHTML)))).attr("download",'image.svg');
    }
});