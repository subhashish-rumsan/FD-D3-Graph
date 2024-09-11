import { useEffect, useRef } from "react";
import ForceGraph from "force-graph";
import * as d3 from "d3"; // Import d3 library

const NaaSGraph = () => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (graphRef.current) {
      // Map each company with their logo URL
      const logos = {
        Colt: "https://www.mef.net/member-logos/logo_001U0000008mj8CIAQ.png",
        "Console Connect":
          "https://www.mef.net/wp-content/uploads/Logo_ConsoleConnect_PCCW-Global.png",
        Telstra:
          "https://1000logos.net/wp-content/uploads/2023/07/Telstra-logo.jpg",
        Orange: "https://www.mef.net/member-logos/logo_001U0000008mwuSIAQ.png",
        Sparkle: "https://www.mef.net/member-logos/logo_001U0000008n6cfIAA.png",
        "Tata Communications":
          "https://www.mef.net/wp-content/uploads/2021/01/certify-logos_0058_tata-38.png",
        "Deutsche Telekom":
          "https://www.mef.net/member-logos/logo_001U0000008mvOWIAY.png",
        Lumen: "https://www.mef.net/member-logos/logo_001U0000007QXtCIAW.png",
        "AT&T": "https://www.mef.net/member-logos/logo_001U0000007Q2wGIAS.png",
        Verizon: "https://www.mef.net/member-logos/logo_001U0000007QXsxIAG.png",
        Retelit: "https://www.mef.net/member-logos/logo_001U000000jvHK9IAM.png",
        Orchest: "https://www.mef.net/member-logos/logo_0010B00001wy25KQAQ.png",
        Cirion:
          "https://press.ciriontechnologies.com/wp-content/uploads/2024/07/Cirion_logo_1200x675.jpg",
        Starhub:
          "https://findlogovector.com/wp-content/uploads/2023/07/starhub-logo-vector.png",
      };

      const gData = {
        nodes: [
          { id: "Colt", group: "Federation Member" },
          { id: "Console Connect", group: "Federation Member" },
          { id: "Telstra", group: "Federation Member" },
          { id: "Orange", group: "Federation Member" },
          { id: "Sparkle", group: "Federation Member" },
          { id: "Tata Communications", group: "Federation Member" },
          { id: "Deutsche Telekom", group: "Supplier" },
          { id: "Lumen", group: "Supplier" },
          { id: "AT&T", group: "Supplier" },
          { id: "Verizon", group: "Supplier" },
          { id: "Retelit", group: "Supplier" },
          { id: "Orchest", group: "Supplier" },
          { id: "Cirion", group: "Supplier" },
          { id: "Starhub", group: "Supplier" },
        ],
        links: [
          { source: "Colt", target: "Console Connect", value: 5 },
          { source: "Colt", target: "Telstra", value: 2 },
          { source: "Colt", target: "Orange", value: 8 },
          { source: "Console Connect", target: "Telstra", value: 3 },
          { source: "Telstra", target: "Orange", value: 1 },
          { source: "Orange", target: "Sparkle", value: 7 },
          { source: "Sparkle", target: "Tata Communications", value: 2 },
          {
            source: "Tata Communications",
            target: "Deutsche Telekom",
            value: 4,
          },
          { source: "Colt", target: "Lumen", value: 0 },
          { source: "Orange", target: "Deutsche Telekom", value: 9 },
          { source: "Console Connect", target: "Lumen", value: 9 },
          { source: "Tata Communications", target: "Lumen", value: 4 },
          { source: "Orange", target: "AT&T", value: 5 },
          { source: "Colt", target: "Verizon", value: 1 },
          { source: "Sparkle", target: "Retelit", value: 7 },
          { source: "Telstra", target: "Verizon", value: 7 },
          { source: "Sparkle", target: "Orchest", value: 10 },
          { source: "Telstra", target: "Cirion", value: 2 },
          { source: "Tata Communications", target: "Starhub", value: 10 },
        ],
      };

      const transactionCount = {};
      gData.links.forEach((link) => {
        transactionCount[link.source] =
          (transactionCount[link.source] || 0) + link.value;
        transactionCount[link.target] =
          (transactionCount[link.target] || 0) + link.value;
      });

      const minTransaction = Math.min(...Object.values(transactionCount));
      const maxTransaction = Math.max(...Object.values(transactionCount));

      const scaleNodeSize = (value) => {
        const minSize = 5;
        const maxSize = 20;
        return (
          ((value - minTransaction) / (maxTransaction - minTransaction)) *
            (maxSize - minSize) +
          minSize
        );
      };

      const colorScale = {
        "Federation Member": "#4CAF50", // green for Federation Members
        Supplier: "#FF9800", // orange for Suppliers
      };

      const forceGraph = ForceGraph()(graphRef.current)
        .graphData(gData)
        .nodeAutoColorBy("group")
        .nodeLabel((node) => node.id)
        .nodeVal((node) => scaleNodeSize(transactionCount[node.id]))
        .linkDirectionalArrowLength(5)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalParticles((link) => link.value)
        .linkDirectionalParticleSpeed((link) => 0.01 / link.value)
        .d3Force("charge", d3.forceManyBody().strength(-300))
        .d3Force("link", d3.forceLink().distance(200).strength(1))
        .d3Force(
          "collide",
          d3
            .forceCollide()
            .radius((node) => scaleNodeSize(transactionCount[node.id]) + 10)
            .strength(0.7)
        )
        .d3Force("center", d3.forceCenter());

      // Add logos to the nodes
      const imgCache = {}; // Cache to store loaded images

      forceGraph.nodeCanvasObject((node, ctx, globalScale) => {
        const size = scaleNodeSize(transactionCount[node.id]);

        // Load image only once per node
        if (!imgCache[node.id]) {
          const img = new Image();
          img.src = logos[node.id]; // Get the logo URL for the company
          img.onload = () => {
            imgCache[node.id] = img;
            forceGraph.refresh();
          };
        }

        // If image is loaded, draw it on the node
        if (imgCache[node.id]) {
          const imgSize = size * 3; // Increase the image size even further

          // Draw the logo inside the circle (without the border)
          ctx.drawImage(
            imgCache[node.id],
            node.x - imgSize / 2,
            node.y - imgSize / 2,
            imgSize,
            imgSize
          );
        } else {
          // Fallback to drawing the circle when no logo is available
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          ctx.strokeStyle = "#d3d3d3"; // Lighter border for non-logo nodes
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw the node label
        ctx.font = `${12 / globalScale}px Sans-Serif`; // Adjust font size based on zoom level
        ctx.fillStyle = "#000"; // Set label color
        ctx.textAlign = "center"; // Center the label
        ctx.textBaseline = "middle"; // Align vertically
        ctx.fillText(node.id, node.x, node.y + size + 10); // Draw label slightly below the node
      });

      forceGraph.d3Force("center", null); // Re-center the graph to fit in the view
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div ref={graphRef} />
    </div>
  );
};

export default NaaSGraph;
