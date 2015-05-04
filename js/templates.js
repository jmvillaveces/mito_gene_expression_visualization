var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["Templates"] = this["Templates"] || {};

this["Templates"]["annotations"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression, alias4=this.lambda;

  return "    <div class=\"annotation\" style=\"left:"
    + alias3(((helper = (helper = helpers.px || (depth0 != null ? depth0.px : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"px","hash":{},"data":data}) : helper)))
    + "; top:"
    + alias3(((helper = (helper = helpers.py || (depth0 != null ? depth0.py : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"py","hash":{},"data":data}) : helper)))
    + "\">\n        "
    + alias3(alias4((depth0 != null ? depth0.process : depth0), depth0))
    + " <br> <p>"
    + alias3(alias4((depth0 != null ? depth0.percentage : depth0), depth0))
    + "%</p>\n    </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.annotations : depth0),{"name":"each","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

this["Templates"]["buttonGroup"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"form-group btn-group\" data-toggle=\"buttons\">\n    <label class=\"btn btn-default active\" data-toggle=\"tooltip\" data-placement=\"bottom\">\n        <input type=\"radio\" name=\"vis_setting\" value=\"all\" autocomplete=\"off\" checked=\"\"> All Gene Expression\n    </label>\n    <label class=\"btn btn-default\" data-toggle=\"tooltip\" data-placement=\"bottom\">\n        <input type=\"radio\" name=\"vis_setting\" value=\"process\" autocomplete=\"off\"> Gene Expression by Process\n    </label>\n    <label class=\"btn btn-default\" data-toggle=\"tooltip\" data-placement=\"bottom\">\n        <input type=\"radio\" name=\"vis_setting\" value=\"chart\" autocomplete=\"off\"> Gene Expression Chart\n    </label>\n</div>";
},"useData":true});

this["Templates"]["main"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"container\" class=\"container\">\n    <div id=\"navbar\" class=\"nav_bar\"></div>\n    <div id=\"vis\" class=\"vis\"></div>\n</div>";
},"useData":true});

if (typeof exports === 'object' && exports) {module.exports = this["Templates"];}