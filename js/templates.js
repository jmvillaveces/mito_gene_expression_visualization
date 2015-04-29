var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["Templates"] = this["Templates"] || {};

this["Templates"]["buttonGroup"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"form-group btn-group\" data-toggle=\"buttons\">\n    <label class=\"btn btn-default active\" data-toggle=\"tooltip\" data-placement=\"bottom\">\n        <input type=\"radio\" name=\"vis_setting\" value=\"all\" autocomplete=\"off\" checked=\"\"> All Gene Expression\n    </label>\n    <label class=\"btn btn-default\" data-toggle=\"tooltip\" data-placement=\"bottom\">\n        <input type=\"radio\" name=\"vis_setting\" value=\"process\" autocomplete=\"off\"> Gene Expression by Process\n    </label>\n</div>";
},"useData":true});

this["Templates"]["main"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"header\"></div>\n<div id=\"vis\" style=\"height:100%;width:100%;\"></div>";
},"useData":true});

if (typeof exports === 'object' && exports) {module.exports = this["Templates"];}