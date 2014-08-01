// JSON CONVENTION: 
//  nodes: name is the file-level unique id, displayed, if label missing
//         label is the text displayed
//         
//  links: type is a category, not displayed
//         label is the lable of the link displayed 

// scene size
var w = 1024,
    h = 760;
var KN_RECT_W = 50,
    KN_RECT_H = 16,
    AB_CIRCLE_R = 8;

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
    .linkDistance(function(d) {
        if (d.weight) return 200 / d.weight;
        else return 20; // default weight = 10;
    })
    .charge(-400)
    .on("tick", tick);

// create root svg, that force graph will modify
var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

// read data, and fill force graph
d3.json(json_path, function(json, error) {
    d3.json(abstraction_path, function(abstraction, error2) {
        // merge two json files, by appending namespace "abstraction" to the second set
        nodes_data = json.nodes;
        abstraction.nodes.forEach(function(item) {
            // store previous name as label
            if (!item.label) item.label = item.name;
            // append namespace to name (id) 
            item.name = "abstr_" + item.name;
            // store
            nodes_data.push(item);
        });
        // nodes_data = json.nodes.concat(abstraction.nodes);
        links_data = json.links;
        abstraction.links.forEach(function(item) {
            item.source = "abstr_" + item.source;
            item.target = "abstr_" + item.target;
            links_data.push(item);
        });
        //links_data = json.links.concat(abstraction.links);

        //console.log("obj: " + obj);
        // parse string link endpoints to node ids
        var tmp_nodes = {}; // is a map<name,id>
        nodes_data.forEach(function(item, index) {
            // store node index under it's name in the map
            tmp_nodes[item.name] = index;
            if (item.x) item.x *= w;
            if (item.y) item.y *= h;
        });
        // change link source and target fields to use these ids instead of string keys
        links_data.forEach(function(item) {
            // link = item;
            item.source = tmp_nodes[item.source];
            item.target = tmp_nodes[item.target];
            if (!item.weight) item.weight = 10;
        });

        // add nodes to force graph
        force.nodes(nodes_data)
            .links(links_data)
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

        // circle should be called "svg_nodes"
        circle = svg.append("svg:g").selectAll("circle")
            .data(force.nodes()).enter()
            .append("svg:g")
            .attr("class", "node")
            .call(force.drag);

        // add RECT for all knowledge nodes
        svg.selectAll("g.node")
            .filter(function(d) {
                return filterKnowledge(d);
            })
            .append("svg:rect")
            .attr("width", KN_RECT_W)
            .attr("height", KN_RECT_H)
            .style("stroke", function(d) {
                if (d.color) return d.color;
                else return "#3c64a0";
            })
            .style("fill", function(d) {
                return "#FFFFFF";
            });

        // add CIRCLE to abstraction NODEs
        svg.selectAll("g.node").filter(function(d) {
            return (d.name.indexOf("abstr_") > -1) && (d.type === "node");
        }).append("svg:circle")
            .attr("r", AB_CIRCLE_R)
            .style("fill", function(d) {
                if (d.color) return d.color;
                else return "#FF0000";
            });

        // add RECT to abstraction RELATIONs
        svg.selectAll("g.node").filter(function(d) {
            return (d.name.indexOf("abstr_") > -1) && (d.type === "relation");
        }).append("svg:rect")
            .attr("width", 16)
            .attr("height", 16)
            .attr("x", -8)
            .attr("y", -8)
            .style("stroke", function(d) {
                return "#000000";
            })
            .style("fill", function(d) {
                return "#FFFFFF";
            });

        // general text placeholders
        text = svg.append("svg:g").selectAll("g")
            .data(force.nodes())
            .enter().append("svg:g");

        // Abstraction labels
        text.filter(function(d) {
            return !filterKnowledge(d);
        })
            .append("svg:text")
            .attr("x", AB_CIRCLE_R + 1)
            .attr("y", ".31em")
            .attr("class", "shadow")
            .text(function(d) {
                return getNodeName(d);
            });
        // A copy of the text with a thick white stroke for legibility.
        text.filter(function(d) {
            return !filterKnowledge(d);
        })
            .append("svg:text")
            .attr("x", AB_CIRCLE_R + 1)
            .attr("y", ".31em")
            .text(function(d) {
                return getNodeName(d);
            });

        // Knowledge labels
        text.filter(function(d) {
            return filterKnowledge(d);
        })
            .append("svg:text")
            .attr("x", 2)
            .attr("y", KN_RECT_H / 2 + 2)
            .attr("class", "shadow")
            .text(function(d) {
                return getNodeName(d);
            });

        text.filter(function(d) {
            return filterKnowledge(d);
        }).append("svg:text")
            .attr("x", 2)
            .attr("y", KN_RECT_H / 2 + 2)
            .text(function(d) {
                return getNodeName(d);
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
    }); // second json file
}); // first json file


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

// returns nodes in the knowledge graph
function filterKnowledge(d) {
    return (d.name.indexOf("abstr_") === -1) && ((d.type === "sub-knowledge graph") || (d.type === "node") || (d.type === "root"));
}

function getNodeName(d) {
    if (d.label) return d.label;
    else return d.name;

}

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