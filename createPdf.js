const { JSDOM } = require("jsdom");
const { Chart, registerables } = require("chart.js");
const { jsPDF } = require("jspdf");

// Register Chart.js components
Chart.register(...registerables);

async function createPdfWithChart() {
  // Create a virtual DOM
  const { window } = new JSDOM(
    '<!DOCTYPE html><html><body><canvas id="chart"></canvas></body></html>',
    {
      pretendToBeVisual: true,
    }
  );

  // Mock browser-like environment for jsdom
  global.window = window;
  global.document = window.document;
  global.HTMLCanvasElement = window.HTMLCanvasElement;
  global.CanvasRenderingContext2D = window.CanvasRenderingContext2D;

  // Mock ResizeObserver to prevent Chart.js error
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Get the canvas and context
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  // Create the Chart
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [
        {
          label: "# of Votes",
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false, // Disable responsiveness in JSDOM
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Convert canvas to base64 image
  const imageBase64 = canvas.toDataURL("image/png");

  // Generate PDF
  const pdf = new jsPDF();
  pdf.text("Chart Report", 20, 10);
  pdf.addImage(imageBase64, "PNG", 15, 20, 180, 100);

  // Convert PDF to base64
  return Buffer.from(pdf.output("arraybuffer")).toString("base64");
}

module.exports = { createPdfWithChart };
 