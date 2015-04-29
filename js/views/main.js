var templates = require('../templates');

module.exports = Backbone.View.extend({
    
    template: templates.main,
    
    render: function(){
        this.$el.append(this.template({}));
        return this;
    }
});