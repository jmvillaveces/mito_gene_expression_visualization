var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["Templates"] = this["Templates"] || {};

this["Templates"]["buttonGroup"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"form-group btn-group\" data-toggle=\"buttons\">\r\n    <label class=\"btn btn-default active\" data-toggle=\"tooltip\" data-placement=\"bottom\">\r\n        <input type=\"radio\" name=\"vis_setting\" value=\"all\" autocomplete=\"off\" checked=\"\"> All Gene Expression\r\n    </label>\r\n    <label class=\"btn btn-default\" data-toggle=\"tooltip\" data-placement=\"bottom\">\r\n        <input type=\"radio\" name=\"vis_setting\" value=\"process\" autocomplete=\"off\"> Gene Expression by Process\r\n    </label>\r\n    <label class=\"btn btn-default\" data-toggle=\"tooltip\" data-placement=\"bottom\">\r\n        <input type=\"radio\" name=\"vis_setting\" value=\"chart\" autocomplete=\"off\"> Gene Expression Chart\r\n    </label>\r\n</div>\r\n<ul class=\"nav nav-pills pull-right\">\r\n    <li role=\"presentation\"><a id=\"save\" href=\"#\">Save</a></li>\r\n</ul>\r\n\r\n";
},"useData":true});

this["Templates"]["main"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"container\" class=\"container\">\r\n    <div id=\"navbar\" class=\"nav_bar\"></div>\r\n    <div class=\"legend\">\r\n        <div class=\"row\">\r\n            <div class=\"col-md-4\">\r\n                <div class=\"col-md-6\"><strong>Color</strong> shows gene regulation</div>\r\n                <div id=\"color_scale\" class=\"col-md-6\"></div>\r\n            </div>\r\n            <div class=\"col-md-4\">\r\n                <div class=\"col-md-7\"><strong>Dark Borders</strong> show mutations</div>\r\n                <div id=\"border_scale\" class=\"col-md-5\"></div>\r\n            </div>\r\n            <div class=\"col-md-4\">\r\n                <div class=\"col-md-6\"><strong>Size</strong> shows Log2 fold change</div>\r\n                <div id=\"size_scale\" class=\"col-md-6\"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div id=\"vis\" class=\"vis\">\r\n    </div>\r\n</div>";
},"useData":true});

this["Templates"]["tooltip"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "        <div class=\"tip-process\">\r\n            <strong>Variant Sites:</strong> "
    + container.escapeExpression(((helper = (helper = helpers.Variant_sites || (depth0 != null ? depth0.Variant_sites : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"Variant_sites","hash":{},"data":data}) : helper)))
    + "\r\n            <br>\r\n            "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.Chromosome_number : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n        </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<strong>Chromosome:</strong> "
    + container.escapeExpression(((helper = (helper = helpers.Chromosome_number || (depth0 != null ? depth0.Chromosome_number : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"Chromosome_number","hash":{},"data":data}) : helper)));
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div>\r\n    <div class=\"tip-name\"><strong>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</strong></div>\r\n    <div class=\"tip-rule\"></div>\r\n    <div class=\"tip-process\">"
    + alias4(((helper = (helper = helpers.process || (depth0 != null ? depth0.process : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"process","hash":{},"data":data}) : helper)))
    + "</div>\r\n    <div class=\"tip-function\">"
    + alias4(((helper = (helper = helpers.gene_function || (depth0 != null ? depth0.gene_function : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"gene_function","hash":{},"data":data}) : helper)))
    + "</div>\r\n    <div class=\"tip-pvalue\"><strong>Pvalue: "
    + alias4(((helper = (helper = helpers.p_value || (depth0 != null ? depth0.p_value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"p_value","hash":{},"data":data}) : helper)))
    + "</strong></div>\r\n    <div><strong>Log2 fold change:</strong> \r\n        <span class=\"tip-"
    + alias4(((helper = (helper = helpers.regulated || (depth0 != null ? depth0.regulated : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"regulated","hash":{},"data":data}) : helper)))
    + "\"><strong>"
    + alias4(((helper = (helper = helpers.Log2fold_change || (depth0 != null ? depth0.Log2fold_change : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Log2fold_change","hash":{},"data":data}) : helper)))
    + "</strong></span>\r\n    </div>\r\n\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.Variant_sites : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>";
},"useData":true});

if (typeof exports === 'object' && exports) {module.exports = this["Templates"];}