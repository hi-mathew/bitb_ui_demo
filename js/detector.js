export async function analyzePage() {
  const url = document.getElementById("urlInput").value;
  const iframe = document.getElementById("targetIframe");
  const banner = document.getElementById("statusBanner");
  const reasonsBox = document.getElementById("reasons");

  banner.style.display = "none";
  reasonsBox.innerText = "";
  iframe.src = url;

  // Delay a bit to let iframe load
  setTimeout(async () => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) throw new Error("Could not access iframe document");

      const features = extractFeaturesFromDOM(doc);

      const response = await fetch("http://localhost:8080/api/bitb/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ features })
      });

      const data = await response.json();
      showBanner(data.prediction, data.score, data.message);
      const reasons = explainReasons(features);
      if (reasons.length > 0) {
        reasonsBox.innerText = "Reason(s): " + reasons.join(", ");
      }

    } catch (err) {
      console.error("BitB detection failed:", err);
      banner.style.display = "block";
      banner.style.backgroundColor = "#fff3cd";
      banner.style.color = "#856404";
      banner.innerText = "⚠️ Could not analyze content (likely cross-origin or CSP blocked)";
    }
  }, 1000);
}

function extractFeaturesFromDOM(doc) {
  const popup = window !== window.parent ? 1 : 0;
  const ratio = (window.innerWidth * window.innerHeight) / (screen.width * screen.height);
  const iframeCount = doc.getElementsByTagName("iframe").length;
  const overlays = doc.querySelectorAll("div, section").length > 10 ? 3 : 0;

  const loginForm = doc.querySelector("form input[type='password']") ? 1 : 0;
  const fakeOverlay = doc.querySelector("#fake-login") ? 1 : 0;
  const urlSpoof = location.hostname !== doc.location?.hostname ? 1 : 0;
  const hostnameLenRatio = (doc.location?.hostname.length || 1) / 20;

  return [
    popup,
    ratio,
    iframeCount,
    overlays,
    loginForm,
    fakeOverlay,
    urlSpoof,
    hostnameLenRatio
  ];
}

function showBanner(prediction, score, message) {
  const banner = document.getElementById("statusBanner");
  banner.style.display = "block";

  if (prediction === 1) {
    banner.style.backgroundColor = "#ffdddd";
    banner.style.color = "#a70000";
  } else {
    banner.style.backgroundColor = "#ddffdd";
    banner.style.color = "#006400";
  }

  banner.innerText = `${message} (Score: ${score})`;
}

function explainReasons(features) {
  const reasons = [];

  if (features[0] === 1 && features[1] < 0.8) {
    reasons.push("Popup window with small size");
  }
  if (features[2] > 4) {
    reasons.push("Too many iframes");
  }
  if (features[3] >= 2) {
    reasons.push("Suspicious overlays present");
  }
  if (features[4] === 1 && features[5] === 1) {
    reasons.push("Fake login form detected");
  }
  if (features[6] === 1) {
    reasons.push("URL mismatch or spoofing");
  }

  return reasons;
}

window.analyzePage = analyzePage;
