var templates = require('../templates');

module.exports = Backbone.View.extend({
    
    events: {
        'keyup input' : 'onSearch',
        'blur input' : 'onBlur',
        'focus input' : 'onFocus',
        'click .results li' : 'onClick'
    },
    
    template: templates.main,
    
    render: function(){
        this.$el.append(this.template({}));
        return this;
    },
    
    onBlur : function(e){
        
        setTimeout(function(){
            $('.results').empty().css('display', 'none');
        }, 200);
    },
    
    onFocus : function(e){
        this.search($.trim($(e.target).val()));
    },
    
    onClick : function(e){
        
        var name = $(e.currentTarget).find('.title').text();
        
        $('input').val(name);
        this.search(name);
        $('.results').empty().css('display', 'none');
    },
    
    onSearch : function(e){
        
        var val = $.trim($(e.target).val()),
            c = String.fromCharCode(e.keyCode),
            isWordCharacter = c.match(/\w/),
            isBackspaceOrDelete = (event.keyCode == 8 || event.keyCode == 46);
                
        
        if(isWordCharacter || isBackspaceOrDelete){
            this.search(val);
        }
    },
    
    search : function(val){    
        
        var results = App.views.vis.search(val),
            view = this;

        results = _.chain(results)
                .sortBy('Name') //function(r){ return r.Name + r.Process; }
                .filter(function(r, i){ return i < 5; })
                .value();
            

        if(results.length > 0){

            var resTpl = templates.result;
            html = _.map(results, resTpl);

            $('.results').empty().append(html).css('display', 'block');

        }else{
            $('.results').empty().css('display', 'none');
        }
    }
});