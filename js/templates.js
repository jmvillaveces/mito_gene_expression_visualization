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
    return "<div id=\"container\" class=\"container\">\n    <div id=\"navbar\" class=\"nav_bar\"></div>\n    <div class=\"legend\">\n        <div class=\"row\">\n            <div class=\"col-md-4\">\n                <div class=\"col-md-6\"><strong>Color</strong> shows gene regulation</div>\n                <div id=\"color_scale\" class=\"col-md-6\"></div>\n            </div>\n            <div class=\"col-md-4\">\n                <div class=\"col-md-7\"><strong>Dark Borders</strong> show mutations</div>\n                <div id=\"border_scale\" class=\"col-md-5\"></div>\n            </div>\n            <div class=\"col-md-4\">\n                <div class=\"col-md-6\"><strong>Size</strong> shows Log2 fold change</div>\n                <div id=\"size_scale\" class=\"col-md-6\"></div>\n            </div>\n        </div>\n    </div>\n    <div id=\"vis\" class=\"vis\">\n    </div>\n</div>";
},"useData":true});

this["Templates"]["tooltip"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "        <div class=\"tip-process\">\n            <strong>Variant Sites:</strong> "
    + this.escapeExpression(((helper = (helper = helpers.Variant_sites || (depth0 != null ? depth0.Variant_sites : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"Variant_sites","hash":{},"data":data}) : helper)))
    + "\n            <br>\n            "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.Chromosome_number : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n        </div>\n";
},"2":function(depth0,helpers,partials,data) {
    var helper;

  return "<strong>Chromosome:</strong> "
    + this.escapeExpression(((helper = (helper = helpers.Chromosome_number || (depth0 != null ? depth0.Chromosome_number : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"Chromosome_number","hash":{},"data":data}) : helper)));
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div>\n    <div class=\"tip-name\"><strong>"
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong></div>\n    <div class=\"tip-rule\"></div>\n    <div class=\"tip-process\">"
    + alias3(((helper = (helper = helpers.process || (depth0 != null ? depth0.process : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"process","hash":{},"data":data}) : helper)))
    + "</div>\n    <div class=\"tip-function\">"
    + alias3(((helper = (helper = helpers.gene_function || (depth0 != null ? depth0.gene_function : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"gene_function","hash":{},"data":data}) : helper)))
    + "</div>\n    <div class=\"tip-pvalue\"><strong>Pvalue: "
    + alias3(((helper = (helper = helpers.p_value || (depth0 != null ? depth0.p_value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"p_value","hash":{},"data":data}) : helper)))
    + "</strong></div>\n    <div><strong>Log2 fold change:</strong> \n        <span class=\"tip-"
    + alias3(((helper = (helper = helpers.regulated || (depth0 != null ? depth0.regulated : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"regulated","hash":{},"data":data}) : helper)))
    + "\"><strong>"
    + alias3(((helper = (helper = helpers.Log2fold_change || (depth0 != null ? depth0.Log2fold_change : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"Log2fold_change","hash":{},"data":data}) : helper)))
    + "</strong></span>\n    </div>\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.Variant_sites : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</div>";
},"useData":true});

if (typeof exports === 'object' && exports) {module.exports = this["Templates"];}