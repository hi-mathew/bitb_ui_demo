function extractBitBFeatures() {
  const features = [];

  // Feature 1: hasIframe
  const iframes = document.getElementsByTagName("iframe");
  const hasIframe = iframes.length > 0 ? 1.0 : 0.0;
  features.push(hasIframe);

  // Feature 2: windowSizeRatio (window.innerWidth * height) / screen size
  const screenArea = window.screen.width * window.screen.height;
  const windowArea = window.innerWidth * window.innerHeight;
  const windowSizeRatio = screenArea > 0 ? windowArea / screenArea : 0.0;
  features.push(Number(windowSizeRatio.toFixed(2)));

  // Feature 3: hasOverlayLoginUI
  const suspiciousSelectors = ["#login", ".login-popup", "#fake-login", ".modal-login"];
  const hasOverlayLoginUI = suspiciousSelectors.some(sel => document.querySelector(sel)) ? 1.0 : 0.0;
  features.push(hasOverlayLoginUI);

  // Feature 4: iframeDepth (nested iframes)
  let maxDepth = 0;
  function checkIframeDepth(doc, depth = 0) {
    const frames = doc.getElementsByTagName("iframe");
    for (let i = 0; i < frames.length; i++) {
      try {
        const childDoc = frames[i].contentDocument;
        if (childDoc) {
          maxDepth = Math.max(maxDepth, depth + 1);
          checkIframeDepth(childDoc, depth + 1);
        }
      } catch (e) {
        // Ignore cross-origin
      }
    }
  }
  checkIframeDepth(document);
  features.push(maxDepth);

  // Feature 5: hasInputFields
  const inputFields = document.querySelectorAll("input[type='text'], input[type='password']");
  const hasInputFields = inputFields.length > 0 ? 1.0 : 0.0;
  features.push(hasInputFields);

  // Feature 6: hasLoginKeywords in the DOM
  const loginKeywords = ["login", "sign in", "user", "username", "password"];
  const pageText = document.body.innerText.toLowerCase();
  const hasLoginKeywords = loginKeywords.some(keyword => pageText.includes(keyword)) ? 1.0 : 0.0;
  features.push(hasLoginKeywords);

  // Feature 7: urlMismatch (TEMPORARILY FORCED FOR TESTING)
  const urlMismatch = 1.0; // Force mismatch to simulate phishing
  features.push(urlMismatch);

  // Feature 8: hostnameEntropy (simple length-based)
  const hostname = window.location.hostname;
  const entropy = hostname.length > 0 ? uniqueChars(hostname) / hostname.length : 0.0;
  features.push(Number(entropy.toFixed(2)));

  return features;
}

function uniqueChars(str) {
  return new Set(str).size;
}
