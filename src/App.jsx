import { useEffect, useRef } from "react";
import ForceGraph from "force-graph";
import * as d3 from "d3"; // Import d3 library

const NaaSGraph = () => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (graphRef.current) {
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
        if (maxTransaction === minTransaction) {
          return maxSize; // If all values are the same, set to max size
        }
        return (
          ((value - minTransaction) / (maxTransaction - minTransaction)) *
            (maxSize - minSize) +
          minSize
        );
      };

      // Define colors for Federation Members and Suppliers
      const colorScale = {
        "Federation Member": "#4CAF50", // green for Federation Members
        Supplier: "#FF9800", // orange for Suppliers
      };

      const forceGraph = ForceGraph()(graphRef.current)
        .graphData(gData)
        .nodeAutoColorBy("group")
        .nodeColor((node) => colorScale[node.group]) // Set colors based on group
        .nodeLabel((node) => node.id) // Add labels to nodes
        .nodeVal((node) => scaleNodeSize(transactionCount[node.id])) // Dynamically scale node size
        .linkDirectionalArrowLength(5)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalParticles((link) => link.value) // Number of particles based on transaction volume
        .linkDirectionalParticleSpeed((link) => 0.01 / link.value) // Slower particles for higher transactions
        .d3Force("charge", d3.forceManyBody().strength(-300)) // Increase repulsion to spread out nodes
        .d3Force("link", d3.forceLink().distance(200).strength(1)) // Set link distance
        .d3Force(
          "collide",
          d3
            .forceCollide()
            .radius((node) => scaleNodeSize(transactionCount[node.id]) + 10)
            .strength(0.7)
        ) // Prevent overlap
        .d3Force("center", d3.forceCenter());

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
