var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["Templates"] = this["Templates"] || {};

this["Templates"]["main"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<!-- Page Content -->\n<div class=\"container main\">\n    \n    \n    <div class=\"row\">\n        \n        <div class=\"col-md-3\">\n            \n            <div class=\"row\">\n            \n                <div class=\"col-md-12 title\" style=\"margin-top:20px;\">Find a Gene</div>\n            \n                <div class=\"col-md-12\" style=\"margin-top:10px;\">\n                    <input type=\"text\" class=\"form-control\" placeholder=\"Search gene by name...\">\n                    <ul class=\"list-group results\"></ul>\n                </div>\n\n\n                <div class=\"col-md-12 miniTitle\" style=\"margin-top:20px;\">\n                    Legend\n                </div>\n\n                <div class=\"col-md-6 legendText\">\n                    <strong>Color</strong> shows gene regulation\n                </div>\n\n                <div class=\"col-md-6\">\n                    <svg width=\"120\" height=\"40\">\n                        <rect x=\"0\" y=\"10\" width=\"38\" height=\"7\" fill=\"#2171b5\"></rect>\n                        <rect x=\"38\" y=\"10\" width=\"38\" height=\"7\" fill=\"#BECCAE\"></rect>\n                        <rect x=\"76\" y=\"10\" width=\"38\" height=\"7\" fill=\"#C72D0A\"></rect>\n\n                        <text x=\"10\" y=\"26\" class=\"legendText\">Up</text>\n                        <text x=\"44\" y=\"26\" class=\"legendText\">None</text>\n                        <text x=\"80\" y=\"26\" class=\"legendText\">Down</text>\n                    </svg>\n                </div>\n\n                <div class=\"col-md-6 legendText\">\n                    <strong>Dark Borders</strong> show mutations\n                </div>\n\n                <div class=\"col-md-6 legendText\">\n                    <svg width=\"120\" height=\"40\">\n                        <circle cx=\"58\" cy=\"20\" fill=\"none\" r=\"18\" stroke-width=\"1.2\" stroke=\"#2c3e50\"></circle>\n                    </svg>\n                </div>\n\n                <div class=\"col-md-6 legendText\">\n                    <strong>Size</strong> shows Log2 fold change\n                </div>\n\n                <div class=\"col-md-6 legendText\">\n                    <svg width=\"120\" height=\"40\">\n                        <circle cx=\"58\" cy=\"20\" style=\"stroke-dasharray: 2 2\" fill=\"none\" r=\"18\" stroke-width=\"1\" stroke=\"#5f6062\"></circle>\n                        <circle cx=\"58\" cy=\"31\" style=\"stroke-dasharray: 2 2\" fill=\"none\" r=\"6\" stroke-width=\"1\" stroke=\"#5f6062\"></circle>\n                    </svg>\n                </div>\n\n                <div class=\"col-md-12\">\n                    <hr>\n                </div>\n            \n            </div>\n            \n            \n            <div class=\"row tip\" style=\"margin-top:20px;\">\n            </div>\n            \n            \n        </div>\n        \n        <div class=\"col-md-9\">\n            <div id=\"vis\" class=\"vis\"></div>\n        </div> \n    </div>\n    \n</div>\n\n";
},"useData":true});

this["Templates"]["result"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<li class=\"list-group-item\"><span class=\"title\">"
    + alias4(((helper = (helper = helpers.Name || (depth0 != null ? depth0.Name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Name","hash":{},"data":data}) : helper)))
    + "</span><br><span>"
    + alias4(((helper = (helper = helpers.Process || (depth0 != null ? depth0.Process : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Process","hash":{},"data":data}) : helper)))
    + "</span></li>";
},"useData":true});

this["Templates"]["tooltip"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"col-md-12 title\">"
    + alias4(((helper = (helper = helpers.Name || (depth0 != null ? depth0.Name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Name","hash":{},"data":data}) : helper)))
    + "</div>\n\n<div class=\"col-md-12 process\">"
    + alias4(((helper = (helper = helpers.Process || (depth0 != null ? depth0.Process : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Process","hash":{},"data":data}) : helper)))
    + "</div>\n\n<div class=\"col-md-12 function\">"
    + alias4(((helper = (helper = helpers.Function || (depth0 != null ? depth0.Function : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Function","hash":{},"data":data}) : helper)))
    + "</div>\n\n<div class=\"col-md-6 miniTitle\">\n    Pvalue\n</div>\n                \n<div class=\"col-md-6\">"
    + alias4(((helper = (helper = helpers["p-value"] || (depth0 != null ? depth0["p-value"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"p-value","hash":{},"data":data}) : helper)))
    + "</div>\n\n<div class=\"col-md-6 miniTitle\">\n    Log2 fold change\n</div>\n                \n<div class=\"col-md-6\">"
    + alias4(((helper = (helper = helpers.Log2FoldChange || (depth0 != null ? depth0.Log2FoldChange : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"Log2FoldChange","hash":{},"data":data}) : helper)))
    + "</div>";
},"useData":true});

if (typeof exports === 'object' && exports) {module.exports = this["Templates"];}