
d3.json('sankey-data.json', function (data) {
// Some setup stuff.
var margin = {top: 50, right: 120, bottom: 50, left: 120};
var width = 800 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;
var color = d3.scale.category20();

// SVG (group) to draw in.
var svg = d3.select(".chart").append("svg")
        .attr({
          width: width + margin.left + margin.right,
          height: height + margin.top + margin.bottom
        })
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set up Sankey object.
var sankey = d3.sankey()
        .nodeWidth(30)
        .nodePadding(10)
        .size([width, height])
        .nodes(data.nodes)
        .links(data.links)
        .layout(64);

// Path data generator.
var path = sankey.link();

// Draw the links.
var links = svg.append("g").selectAll(".link")
        .data(data.links)
        .enter()
        .append("path")
        .attr({
          "class": "link",
          d: path
        })
        .style("stroke-width", function (d) {
          return Math.max(1, d.dy);
        })

links.append("title")
        .text(function (d) {
          return d.source.name + " to " + d.target.name + " = " + d.value;
        });

// Draw the nodes.
var nodes = svg.append("g").selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr({
          "class": "node",
          transform: function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          }
        });


nodes.append("rect")
        .attr({
          height: function (d) {
            return d.dy;
          },
          width: sankey.nodeWidth()
        })
        .on("mouseover", function (d) {
          links.filter(function (l) {
            if (d.targetLinks.includes(l) || d.sourceLinks.includes(l)) {
              d3.select(this).classed("link-active", true);
            };
          });
        })
        .on("mouseleave", function (d) {
          links.filter(function (l) {
            if (d.targetLinks.includes(l) || d.sourceLinks.includes(l)) {
              d3.select(this).classed("link-active", false);
            };
          });
        })
        .style({
          fill: function (d) {
            return d.color = color(d.name.replace(/ .*/, ""));
          },
          stroke: function (d) {
            return d3.rgb(d.color).darker(.2);
          }
        })
        .append("title")
        .text(function (d) {
          return d.name + "\n"  + "hi";
        })

nodes.append("text")
        .attr({
          x: function (d) {
            return d.x == 0 ? -10 : sankey.nodeWidth() + 10;
          },
          y: function (d) {
            return d.dy / 2;
          },
          dy: ".35em",
          "text-anchor": function (d) {
            return  d.x == 0 ? "end" : "right";
          },
          // transform: null
        })
        .text(function (d) {
          return d.name;
        });
})
