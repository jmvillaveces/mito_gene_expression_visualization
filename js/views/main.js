var templates = require('../templates');

module.exports = Backbone.View.extend({
    
    events: {
        'keyup input' : 'search'
    },
    
    template: templates.main,
    
    render: function(){
        this.$el.append(this.template({}));
        return this;
    },
    
    search : function(e){
        App.views.vis.search($(e.target).val());
    }
});