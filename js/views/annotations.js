var templates = require('../templates');

module.exports = Backbone.View.extend({
    
    template: templates.annotations,
    
    render: function(opt){
        this.$el.append(this.template({annotations:opt}));
        return this;
    }
});