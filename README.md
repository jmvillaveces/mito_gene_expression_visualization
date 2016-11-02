# Mitomodels Gene Expression Visualization

This project aims to visualize gene expression profiles in the context of mitochondrial processes. See a working demo [here](http://jmvillaveces.github.io/mito_models_visualization/dist/).

## Getting Started

1. Clone the project
`git clone https://github.com/jmvillaveces/mito_models_visualization.git`
2. Install dependencies
`npm i`
3. Compile the project
`grunt dist`
4. Run
`grunt serve`

## Usage

```
<html>
    <head>

        <!-- 1. Import the app styles CSS -->
        <link href='css/App.css' rel='stylesheet' type='text/css'>

    </head>

    <body></body>

    <!-- 2. Import javascript  -->
    <script src="js/App.min.js"></script>

    <script>
        App.init(); // 3. Initialize application!
    </script>
</html>
```

## Built With

* [NPM](https://www.npmjs.com/) - Dependency Management
* [GRUNT](http://gruntjs.com/) - Task Runner
* [Backbone](http://backbonejs.org/) -  model–view–presenter (MVP) application design paradigm
* [Handlebars](http://handlebarsjs.com/) - HTML templating

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/jmvillaveces/mito_models_visualization/tags).

## Authors

* **José M. Villaveces** - [jmvillaveces](http://jmvillaveces.github.io/) 
