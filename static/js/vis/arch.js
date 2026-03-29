(function () {

  // ── DATA ────────────────────────────────────────────────────────────────────
  var nodes = [
    {
      id: "input",
      label: "Input",
      sub1: "256×256×1",
      sub2: "→ 224×224",
      shape: null,
      flatSize: null,
      color: { fill: "#F1EFE8", stroke: "#888780", text: "#3a3a38", sub: "#5F5E5A" },
      tip: "Input image ×1\nshape: (1, 1, 256, 256)\n→ resized to 224×224\n→ per-image standardisation",
      tipShape: null,
      hasLabel: true,
    },
    {
      id: "scale1",
      label: "scale1",
      sub1: "conv1  7×7 s2",
      sub2: "+ BN + ReLU",
      shape: "112×112×64",
      flatSize: "802 816",
      color: { fill: "#E1F5EE", stroke: "#0F6E56", text: "#085041", sub: "#1a9068" },
      tip: "scale1 — conv1\n7×7 conv, stride 2\n+ BatchNorm + ReLU\noutput: 112×112×64",
      tipShape: "(1,  802 816)",
    },
    {
      id: "scale2",
      label: "scale2",
      sub1: "MaxPool s2",
      sub2: "3×Bottleneck",
      shape: "56×56×256",
      flatSize: "802 816",
      color: { fill: "#EEEDFE", stroke: "#534AB7", text: "#3C3489", sub: "#6b63c8" },
      tip: "scale2 — layer1\nMaxPool stride 2\n3×Bottleneck  64→256 ch\noutput: 56×56×256",
      tipShape: "(1,  802 816)",
    },
    {
      id: "scale3",
      label: "scale3",
      sub1: "4×Bottleneck s2",
      sub2: "128 → 512 ch",
      shape: "28×28×512",
      flatSize: "401 408",
      color: { fill: "#E6F1FB", stroke: "#185FA5", text: "#0C447C", sub: "#2c7bc5" },
      tip: "scale3 — layer2\n4×Bottleneck, stride 2\n128 → 512 channels\noutput: 28×28×512",
      tipShape: "(1,  401 408)",
    },
    {
      id: "scale4",
      label: "scale4",
      sub1: "6×Bottleneck s2",
      sub2: "256 → 1024 ch",
      shape: "14×14×1024",
      flatSize: "200 704",
      color: { fill: "#FAEEDA", stroke: "#854F0B", text: "#633806", sub: "#a86510" },
      tip: "scale4 — layer3\n6×Bottleneck, stride 2\n256 → 1024 channels\noutput: 14×14×1024",
      tipShape: "(1,  200 704)",
    },
    {
      id: "scale5",
      label: "scale5",
      sub1: "3×Bottleneck s2",
      sub2: "512 → 2048 ch",
      shape: "7×7×2048",
      flatSize: "100 352",
      color: { fill: "#FAECE7", stroke: "#993C1D", text: "#712B13", sub: "#c04e26" },
      tip: "scale5 — layer4\n3×Bottleneck, stride 2\n512 → 2048 channels\noutput: 7×7×2048",
      tipShape: "(1,  100 352)",
    },
    {
      id: "gap",
      label: "GAP",
      sub1: "GlobalAvgPool",
      sub2: "7×7 → 1×1",
      shape: "2048",
      flatSize: "2 048",
      color: { fill: "#EAF3DE", stroke: "#3B6D11", text: "#27500A", sub: "#4e8f17" },
      tip: "Global Average Pooling\ntf.reduce_mean(x, axis=[1,2])\n7×7 spatial → 1 vector\noutput: (1, 2048)",
      tipShape: "(1,  2048)",
    },
    {
      id: "pred",
      label: "Prediction",
      sub1: "FC  2048→17",
      sub2: "+ Sigmoid",
      shape: "17 classes",
      flatSize: "17",
      color: { fill: "#FBEAF0", stroke: "#993556", text: "#72243E", sub: "#c24268" },
      tip: "FC + Sigmoid\nLinear: 2048 → 17\nprob = tf.sigmoid(logits)\nloss: BCE (sigmoid_xent)\nmulti-label output",
      tipShape: "(1,  17)",
    },
  ];

  // ── LAYOUT ──────────────────────────────────────────────────────────────────
  // viewBox ratio tuned to fill the ~30%-height panel at typical screen widths
  var W = 1160, H = 230;
  var NODE_W = 128, NODE_H = 108;
  var GAP_X  = 16;
  var Y_MID  = 28;

  var TOTAL_NODE_W = nodes.length * NODE_W + (nodes.length - 1) * GAP_X;
  var X_START = (W - TOTAL_NODE_W) / 2;   // ≈ 5px — nearly edge-to-edge

  nodes.forEach(function (d, i) {
    d.cx = X_START + i * (NODE_W + GAP_X) + NODE_W / 2;
    d.x  = d.cx - NODE_W / 2;
    d.y  = Y_MID;
  });

  // ── SVG ─────────────────────────────────────────────────────────────────────
  var svg = d3.select("#model-arch-content")
    .append("svg")
    .attr("viewBox", "0 0 " + W + " " + H)
    .attr("preserveAspectRatio", "xMidYMid meet");

  svg.append("defs").append("marker")
    .attr("id", "arch-arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 8).attr("refY", 5)
    .attr("markerWidth", 6).attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
      .attr("d", "M2 1L8 5L2 9")
      .attr("fill", "none")
      .attr("stroke", "#aaaaaa")
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");

  // section header
  svg.append("text")
    .attr("class", "arch-section-header")
    .attr("x", W / 2).attr("y", 14)
    .text("ResNet-50 feature extraction pipeline  ·  hover each block for details");

  // ── ARROWS ──────────────────────────────────────────────────────────────────
  for (var i = 0; i < nodes.length - 1; i++) {
    var a = nodes[i], b = nodes[i + 1];
    svg.append("line")
      .attr("class", "arch-link")
      .attr("x1", a.x + NODE_W + 2)
      .attr("y1", a.y + NODE_H / 2)
      .attr("x2", b.x - 2)
      .attr("y2", b.y + NODE_H / 2)
      .attr("stroke", b.color.stroke)
      .attr("marker-end", "url(#arch-arrow)");
  }

  // ── NODES ───────────────────────────────────────────────────────────────────
  var nodeG = svg.selectAll(".node-group")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

  // background rect
  nodeG.append("rect")
    .attr("class", "node-rect")
    .attr("width", NODE_W)
    .attr("height", NODE_H)
    .attr("rx", 8)
    .attr("fill", function (d) { return d.color.fill; })
    .attr("stroke", function (d) { return d.color.stroke; })
    .attr("stroke-width", 1.2);

  // top accent bar
  nodeG.append("rect")
    .attr("width", NODE_W)
    .attr("height", 4)
    .attr("rx", 2)
    .attr("fill", function (d) { return d.color.stroke; })
    .attr("opacity", 0.85);

  // label
  nodeG.append("text")
    .attr("class", "node-title")
    .attr("x", NODE_W / 2).attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("fill", function (d) { return d.color.text; })
    .text(function (d) { return d.label; });

  // sub1
  nodeG.append("text")
    .attr("class", "node-sub")
    .attr("x", NODE_W / 2).attr("y", 42)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("fill", function (d) { return d.color.sub; })
    .text(function (d) { return d.sub1; });

  // sub2
  nodeG.append("text")
    .attr("class", "node-sub")
    .attr("x", NODE_W / 2).attr("y", 56)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("fill", function (d) { return d.color.sub; })
    .text(function (d) { return d.sub2; });

  // divider
  nodeG.filter(function (d) { return d.shape; })
    .append("line")
    .attr("x1", 8).attr("x2", NODE_W - 8)
    .attr("y1", 70).attr("y2", 70)
    .attr("stroke", function (d) { return d.color.stroke; })
    .attr("stroke-width", 0.6)
    .attr("opacity", 0.4);

  // output shape
  nodeG.filter(function (d) { return d.shape; })
    .append("text")
    .attr("class", "node-shape")
    .attr("x", NODE_W / 2).attr("y", 82)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("fill", function (d) { return d.color.text; })
    .text(function (d) { return d.shape; });

  // true-label badge on input node
  nodeG.filter(function (d) { return d.hasLabel; })
    .append("rect")
    .attr("x", 6).attr("y", NODE_H - 22)
    .attr("width", NODE_W - 12).attr("height", 16)
    .attr("rx", 3)
    .attr("fill", "#3B6D11");

  nodeG.filter(function (d) { return d.hasLabel; })
    .append("text")
    .attr("x", NODE_W / 2).attr("y", NODE_H - 14)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("fill", "#EAF3DE")
    .attr("font-size", "10px")
    .attr("font-weight", "600")
    .text("true label  (1, 17)");

  // ── FLAT-SIZE LABELS ─────────────────────────────────────────────────────────
  svg.selectAll(".flat-label")
    .data(nodes.filter(function (d) { return d.flatSize; }))
    .enter()
    .append("text")
    .attr("class", "flat-label")
    .attr("x", function (d) { return d.cx; })
    .attr("y", Y_MID + NODE_H + 14)
    .text(function (d) { return d.flatSize; });

  // ── TRUE-LABEL PATH ──────────────────────────────────────────────────────────
  var inp  = nodes[0];
  var pred = nodes[nodes.length - 1];
  var pathY = Y_MID + NODE_H + 34;

  svg.append("path")
    .attr("class", "true-label-path")
    .attr("d", "M " + inp.cx  + " " + (inp.y  + NODE_H) +
              " L " + inp.cx  + " " + pathY +
              " L " + pred.cx + " " + pathY +
              " L " + pred.cx + " " + (pred.y + NODE_H))
    .attr("marker-end", "url(#arch-arrow)");

  svg.append("text")
    .attr("class", "bce-label")
    .attr("x", (inp.cx + pred.cx) / 2)
    .attr("y", pathY + 13)
    .text("BCE loss  ·  sigmoid_cross_entropy_with_logits");

  // ── TOOLTIP (D3 v4) ───────────────────────────────────────────────────────────
  var tip = document.getElementById("arch-tooltip");

  nodeG
    .on("mouseenter", function (d) {
      tip.innerHTML = '<span class="tip-title">' + d.label + '</span>' + d.tip +
        (d.tipShape ? '\n<span class="tip-shape">' + d.tipShape + '</span>' : "");
      tip.classList.add("visible");
    })
    .on("mousemove", function () {
      tip.style.left = (d3.event.clientX + 16) + "px";
      tip.style.top  = (d3.event.clientY + 16) + "px";
    })
    .on("mouseleave", function () {
      tip.classList.remove("visible");
    });

  // ── ANIMATE IN ───────────────────────────────────────────────────────────────
  nodeG
    .style("opacity", 0)
    .transition()
    .duration(400)
    .delay(function (d, i) { return i * 60; })
    .style("opacity", 1);

})();
