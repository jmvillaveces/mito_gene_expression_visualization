var templates = require('../templates');

module.exports = Backbone.View.extend({
    
    events: {
        'change input[name=vis_setting]' : 'onVisSettingChange'
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
        }else{
            App.views.vis.displayTowardProcess();
        }
    }
});