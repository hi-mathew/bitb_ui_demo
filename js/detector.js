document.getElementById("analyzeBtn").onclick = async function () {
  const iframe = document.getElementById("targetIframe");

  if (!iframe || !iframe.contentDocument) {
    document.getElementById("result").textContent =
      "⚠️ Could not analyze content (likely cross-origin or blocked).";
    return;
  }

  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Feature 1: window size ratio
    const rect = iframe.getBoundingClientRect();
    const windowRatio = (rect.width * rect.height) / (window.innerWidth * window.innerHeight);

    // Feature 2: number of iframes
    const iframeCount = doc.getElementsByTagName("iframe").length;

    // Feature 3: check if there is a login form
    const inputs = doc.getElementsByTagName("input");
    let hasLoginForm = 0;
    for (let i = 0; i < inputs.length; i++) {
      const type = inputs[i].type.toLowerCase();
      if (type === "password") {
        hasLoginForm = 1;
        break;
      }
    }

    // Prepare feature vector
    const features = [windowRatio, iframeCount, hasLoginForm];

    // Call backend
    const response = await fetch("http://localhost:8080/api/bitb/detect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ features: features }),
    });

    const result = await response.json();

    // Display prediction
    document.getElementById("result").textContent = `✅ Prediction: ${result.message} (Score: ${result.score})`;

  } catch (err) {
    console.error("Error analyzing iframe:", err);
    document.getElementById("result").textContent = "⚠️ Analysis failed.";
  }
};
