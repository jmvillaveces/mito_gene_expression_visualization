var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["Templates"] = this["Templates"] || {};

this["Templates"]["annotation"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"node theme\" style=\"vertical-align: middle;display: inline-block;\">\n    <span class=\"glyphicon glyphicon-plus-sign\" style=\"position: absolute;margin-left:-65%;opacity:0;\"></span>\n    <div>"
    + container.escapeExpression(((helper = (helper = helpers.Process || (depth0 != null ? depth0.Process : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"Process","hash":{},"data":data}) : helper)))
    + "</div>\n</div>";
},"useData":true});

this["Templates"]["buttonGroup"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"form-group btn-group\" data-toggle=\"buttons\">\n    <label class=\"btn btn-default active\" data-toggle=\"tooltip\" data-placement=\"bottom\">\n        <input type=\"radio\" name=\"vis_setting\" value=\"network\" autocomplete=\"off\" checked=\"\"> Network\n    </label>\n    <label class=\"btn btn-default\" data-toggle=\"tooltip\" data-placement=\"bottom\">\n        <input type=\"radio\" name=\"vis_setting\" value=\"all\" autocomplete=\"off\"> Gene Expression\n    </label>\n    <label class=\"btn btn-default\" data-toggle=\"tooltip\" data-placement=\"bottom\">\n        <input type=\"radio\" name=\"vis_setting\" value=\"process\" autocomplete=\"off\"> Gene Expression by Process\n    </label>\n    <label class=\"btn btn-default\" data-toggle=\"tooltip\" data-placement=\"bottom\">\n        <input type=\"radio\" name=\"vis_setting\" value=\"chart\" autocomplete=\"off\"> Gene Expression Chart\n    </label>\n</div>\n<ul class=\"nav nav-pills pull-right\">\n    <li role=\"presentation\"><input type=\"text\" class=\"form-control\" placeholder=\"Search gene by name...\"></li>\n</ul>\n\n";
},"useData":true});

this["Templates"]["main"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<!-- Page Content -->\n<div class=\"container\">\n\n    <div id=\"navbar\" class=\"nav_bar\"></div>\n        \n    <div class=\"legend\">\n        <div class=\"row\">\n            <div class=\"col-md-4\">\n                <div class=\"col-md-6\"><strong>Color</strong> shows gene regulation</div>\n                <div id=\"color_scale\" class=\"col-md-6\"></div>\n            </div>\n            <div class=\"col-md-4\">\n                <div class=\"col-md-7\"><strong>Dark Borders</strong> show mutations</div>\n                <div id=\"border_scale\" class=\"col-md-5\"></div>\n            </div>\n            <div class=\"col-md-4\">\n                <div class=\"col-md-6\"><strong>Size</strong> shows Log2 fold change</div>\n                <div id=\"size_scale\" class=\"col-md-6\"></div>\n            </div>\n        </div>\n    </div>\n        \n    <div class=\"row\">\n        <div class=\"col-md-12\">\n            <div id=\"vis\" class=\"vis\"></div>\n        </div>        \n    </div>\n    \n</div>";
},"useData":true});

this["Templates"]["tooltip"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "        <div class=\"tip-process\">\n            <strong>Variant Sites:</strong> "
    + container.escapeExpression(((helper = (helper = helpers.Variant_sites || (depth0 != null ? depth0.Variant_sites : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"Variant_sites","hash":{},"data":data}) : helper)))
    + "\n            <br>\n            "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.Chromosome_number : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n        </div>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<strong>Chromosome:</strong> "
    + container.escapeExpression(((helper = (helper = helpers.Chromosome_number || (depth0 != null ? depth0.Chromosome_number : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"Chromosome_number","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div>\n    <div class=\"tip-name\"><strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong></div>\n    <div class=\"tip-rule\"></div>\n    <div class=\"tip-process\">"
    + alias4(((helper = (helper = helpers.process || (depth0 != null ? depth0.process : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"process","hash":{},"data":data}) : helper)))
    + "</div>\n    <div class=\"tip-function\">"
    + alias4(((helper = (helper = helpers.gene_function || (depth0 != null ? depth0.gene_function : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"gene_function","hash":{},"data":data}) : helper)))
    + "</div>\n    <div class=\"tip-pvalue\"><strong>Pvalue: "
    + alias4(((helper = (helper = helpers.p_value || (depth0 != null ? depth0.p_value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"p_value","hash":{},"data":data}) : helper)))
    + "</strong></div>\n    <div><strong>Log2 fold change:</strong> \n        <span class=\"tip-"
    + alias4(((helper = (helper = helpers.regulated || (depth0 != null ? depth0.regulated : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"regulated","hash":{},"data":data}) : helper)))
    + "\"><strong>"
    + alias4(((helper = (helper = helpers.Log2fold_change || (depth0 != null ? depth0.Log2fold_change : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Log2fold_change","hash":{},"data":data}) : helper)))
    + "</strong></span>\n    </div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.Variant_sites : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>";
},"useData":true});

if (typeof exports === 'object' && exports) {module.exports = this["Templates"];}