// http://blog.thomsonreuters.com/index.php/mobile-patent-suits-graphic-of-the-day/
// var links = [
//   {source: "Microsoft", target: "Amazon", type: "licensing"},
//   {source: "Microsoft", target: "HTC", type: "licensing"},
//   {source: "Samsung", target: "Apple", type: "suit"},
//   {source: "Motorola", target: "Apple", type: "suit"},
//   {source: "Nokia", target: "Apple", type: "resolved"},
//   {source: "HTC", target: "Apple", type: "suit"},
//   {source: "Kodak", target: "Apple", type: "suit"},
//   {source: "Microsoft", target: "Barnes & Noble", type: "suit"},
//   {source: "Microsoft", target: "Foxconn", type: "suit"},
//   {source: "Oracle", target: "Google", type: "suit"},
//   {source: "Apple", target: "HTC", type: "suit"},
//   {source: "Microsoft", target: "Inventec", type: "suit"},
//   {source: "Samsung", target: "Kodak", type: "resolved"},
//   {source: "LG", target: "Kodak", type: "resolved"},
//   {source: "RIM", target: "Kodak", type: "suit"},
//   {source: "Sony", target: "LG", type: "suit"},
//   {source: "Kodak", target: "LG", type: "resolved"},
//   {source: "Apple", target: "Nokia", type: "resolved"},
//   {source: "Qualcomm", target: "Nokia", type: "resolved"},
//   {source: "Apple", target: "Motorola", type: "suit"},
//   {source: "Microsoft", target: "Motorola", type: "suit"},
//   {source: "Motorola", target: "Microsoft", type: "suit"},
//   {source: "Huawei", target: "ZTE", type: "suit"},
//   {source: "Ericsson", target: "ZTE", type: "suit"},
//   {source: "Kodak", target: "Samsung", type: "resolved"},
//   {source: "Apple", target: "Samsung", type: "suit"},
//   {source: "Kodak", target: "RIM", type: "suit"},
//   {source: "Nokia", target: "Qualcomm", type: "suit"}
// ];

// var nodes = {
//   "Microsoft" : {"name":"Microsoft"},
//   "Amazon":{"name":"Amazon"},
//   "HTC":{"name":"HTC"},
//   "Samsung":{"name":"Samsung"},
//   "Apple":{"name":"Apple"},
//   "Motorola":{"name":"Motorola"},
//   "Nokia":{"name":"Nokia"},
//   "Kodak":{"name":"Kodak"},
//   "Barnes & Noble":{"name":"Barnes & Noble"},
//   "Foxconn":{"name":"Foxconn"},
//   "Oracle":{"name":"Oracle"},
//   "Google":{"name":"Google"},
//   "Inventec":{"name":"Inventec"},
//   "LG":{"name":"LG"},
//   "RIM":{"name":"RIM"},
//   "Sony":{"name":"Sony"},
//   "Qualcomm":{"name":"Qualcomm"},
//   "Huawei":{"name":"Huawei"},
//   "ZTE":{"name":"ZTE"},
//   "Ericsson":{"name":"Ericsson"}
// };

// // Compute the distinct nodes from the links.
//  links.forEach(function(link) {
//    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
//    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
//  });
//  console.log(links);

// scene size
var w = 1024,
    h = 760;

// predeclare globals
var link = {},
    linkPath = {},
    textPath = {},
    circle = {},
    text = {},
    path_label = {};

// create force graph, but don't start
var force = d3.layout.force()
    .size([w, h])
    .linkDistance(200)
    .charge(-400)
    .on("tick", tick);

// create root svg, that force graph will modify
var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

// read data, and fill force graph
d3.json(json_path, function(json, error) {

    // parse string link endpoints to node ids
    var tmp_nodes = {}; // is a map<name,id>
    json.nodes.forEach(function(item, index) {
        // store node index under it's name in the map
        tmp_nodes[item.name] = index;
    });
    // change link source and target fields to use these ids instead of string keys
    json.links.forEach(function(item) {
        // link = item;
        item.source = tmp_nodes[item.source];
        item.target = tmp_nodes[item.target];
    });

    // add nodes to force graph
    force.nodes(json.nodes)
        .links(json.links)
        .start();

    // create link objects (svg groups) and add class .link to them
    link = svg.append("svg:g").selectAll("g.link")
        .data(force.links())
        .enter().append('g')
        .attr('class', 'link');

    // create link arches
    linkPath = link.append("svg:path")
        .attr("class", function(d) {
            return "link " + d.type;
        })
        .attr("marker-end", function(d) {
            return "url(#" + d.type + ")";
        });

    textPath = link.append("svg:path")
        .attr("id", function(d) {
            return d.source.index + "_" + d.target.index;
        })
        .attr("class", "textpath");

    circle = svg.append("svg:g").selectAll("circle")
        .data(force.nodes()).enter()
        .append("svg:circle")
        .attr("r", 8)
        .call(force.drag);

    circle.style("fill", function(d) {
        if (d.color) return d.color;
        else return "#FF0000";
    })

    text = svg.append("svg:g").selectAll("g")
        .data(force.nodes())
        .enter().append("svg:g");

    // A copy of the text with a thick white stroke for legibility.
    text.append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .attr("class", "shadow")
        .text(function(d) {
            return d.name;
        });

    text.append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) {
            return d.name;
        });

    path_label = svg.append("svg:g").selectAll(".path_label")
        .data(force.links())
        .enter().append("svg:text")
        .attr("class", "path_label")
        .append("svg:textPath")
        .attr("startOffset", "50%")
        .attr("text-anchor", "middle")
        .attr("xlink:href", function(d) {
            return "#" + d.source.index + "_" + d.target.index;
        })
        .style("fill", "#000")
        .style("font-family", "Arial")
        .text(function(d) {
            if (d.label) return d.label;
            else return "";
        });

    // force.nodes( d3.values(nodes) )
    //      .links( links )
    //      .start();
});


// Per-type markers, as they don't inherit styles.
// svg.append("svg:defs").selectAll("marker")
//     .data(["suit", "licensing", "resolved"])
//   .enter().append("svg:marker")
//     .attr("id", String)
//     .attr("viewBox", "0 -5 10 10")
//     .attr("refX", 15)
//     .attr("refY", -1.5)
//     .attr("markerWidth", 6)
//     .attr("markerHeight", 6)
//     .attr("orient", "auto")
//   .append("svg:path")
//     .attr("d", "M0,-5L10,0L0,5");

function arcPath(leftHand, d) {
    var start = leftHand ? d.source : d.target,
        end = leftHand ? d.target : d.source,
        dx = end.x - start.x,
        dy = end.y - start.y,
        dr = Math.sqrt(dx * dx + dy * dy),
        sweep = leftHand ? 0 : 1;
    return "M" + start.x + "," + start.y + "A" + dr + "," + dr + " 0 0," + sweep + " " + end.x + "," + end.y;
}

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
    linkPath.attr("d", function(d) {
        return arcPath(false, d);
    });

    textPath.attr("d", function(d) {
        return arcPath(d.source.x < d.target.x, d);
    });

    circle.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });

    text.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
}