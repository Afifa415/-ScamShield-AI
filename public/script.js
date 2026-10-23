const $ = (selector) => document.querySelector(selector);

const form = $("#analysisForm");
const messageInput = $("#messageInput");
const analyzeButton = $("#analyzeButton");
const analyzeButtonText = $("#analyzeButtonText");
const characterCount = $("#characterCount");
const formStatus = $("#formStatus");

const emptyState = $("#emptyState");
const analysisResults = $("#analysisResults");
const historyList = $("#historyList");
const modelName = $("#modelName");

const MAX_LENGTH = 6000;

const sampleMessages = {
  job: `Congratulations! You have been selected for a remote job with a salary of $5,000 per month. To activate your employee account, pay a refundable registration fee of $50 today. Send your payment receipt and bank details to our recruitment agent.`,

  prize: `Mubarak ho! Apka prize ready hai. Prize receive karne ke liye apna OTP aur bank details send karein. Offer sirf 10 minutes ke liye valid hai.`,

  ambiguous: `Hello, we reviewed your application and would like to arrange an interview next week. Please reply with your available dates and times. We will share the official meeting details after confirmation.`
};

function setStatus(message = "", type = "") {
  if (!formStatus) return;

  formStatus.textContent = message;
  formStatus.className = "form-status";

  if (type) {
    formStatus.classList.add(type);
  }
}

function updateCharacterCount() {
  if (!messageInput || !characterCount) return;

  const length = messageInput.value.length;
  characterCount.textContent = `${length.toLocaleString()} / ${MAX_LENGTH.toLocaleString()}`;

  characterCount.style.color =
    length > MAX_LENGTH ? "#ff5f7a" : "";
}

function setText(selector, value, fallback = "Not provided") {
  const element = $(selector);
  if (!element) return;

  element.textContent =
    typeof value === "string" && value.trim()
      ? value
      : fallback;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = String(text);
  }

  return element;
}

function normalizeRisk(value) {
  const risk = String(value || "").toUpperCase();

  return ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(risk)
    ? risk
    : "MEDIUM";
}

function normalizeComplexity(value) {
  const complexity = String(value || "").toUpperCase();

  return ["LOW", "MEDIUM", "HIGH"].includes(complexity)
    ? complexity
    : "MEDIUM";
}

function renderWarnings(warningSigns) {
  const container = $("#warningSigns");
  const count = $("#warningCount");

  if (!container) return;

  container.replaceChildren();

  const warnings = Array.isArray(warningSigns)
    ? warningSigns
    : [];

  if (count) {
    count.textContent = `${warnings.length} found`;
  }

  if (warnings.length === 0) {
    container.appendChild(
      createElement(
        "li",
        "no-warnings",
        "No clear warning signs were identified in the supplied text. This does not prove the message is safe."
      )
    );
    return;
  }

  warnings.forEach((warning) => {
    const item = createElement("li", "warning-item");

    const evidence = createElement(
      "strong",
      "warning-evidence",
      warning?.evidence || "Potential warning sign"
    );

    const explanation = createElement(
      "p",
      "warning-explanation",
      warning?.explanation || "No additional explanation was provided."
    );

    item.append(evidence, explanation);
    container.appendChild(item);
  });
}

function renderActions(actions) {
  const container = $("#recommendedActions");

  if (!container) return;

  container.replaceChildren();

  const recommendations = Array.isArray(actions)
    ? actions
    : [];

  if (recommendations.length === 0) {
    container.appendChild(
      createElement(
        "li",
        "action-item",
        "Use an independent, trusted source to verify important claims."
      )
    );
    return;
  }

  recommendations.forEach((action) => {
    const item = createElement("li", "action-item");
    const check = createElement("span", "action-check", "✓");
    const text = createElement(
      "span",
      "",
      typeof action === "string" ? action : "Review this recommendation."
    );

    item.append(check, text);
    container.appendChild(item);
  });
}

function renderAnalysis(result, metadata = {}) {
  const analysis = result || {};

  const risk = normalizeRisk(analysis.riskLevel);
  const complexity = normalizeComplexity(
    analysis.analysisComplexity
  );

  const riskLevel = $("#riskLevel");
  const riskGauge = $("#riskGauge");

  if (riskLevel) {
    riskLevel.textContent = risk;
    riskLevel.dataset.risk = risk;
  }

 
if (riskGauge) {
  riskGauge.textContent = {
    LOW: "LOW RISK",
    MEDIUM: "MEDIUM RISK",
    HIGH: "HIGH RISK",
    CRITICAL: "CRITICAL RISK"
  }[risk] || "UNKNOWN";

  riskGauge.dataset.risk = risk;
}


  setText("#scamCategory", analysis.scamCategory, "General assessment");
  setText("#analysisSummary", analysis.summary, "No summary was returned.");
  setText(
    "#uncertaintyText",
    analysis.uncertainty,
    "The sender's identity and external claims have not been independently verified."
  );

  setText(
    "#disclaimerText",
    analysis.disclaimer,
    "This is an AI risk assessment, not proof of fraud."
  );

  renderWarnings(analysis.warningSigns);
  renderActions(analysis.recommendedActions);

  setText("#complexityLevel", complexity);

  const complexityMeter = $("#complexityMeter");

  if (complexityMeter) {
    const widths = {
      LOW: "33%",
      MEDIUM: "66%",
      HIGH: "100%"
    };

    complexityMeter.style.width = widths[complexity];
    complexityMeter.setAttribute(
      "aria-label",
      `Analysis complexity: ${complexity}`
    );
  }

  setText(
    "#complexityReason",
    analysis.complexityReason,
    "The model estimated the difficulty from the available context."
  );

  const duration = Number(metadata.elapsedMs);

  const durationText =
    Number.isFinite(duration) && duration >= 0
      ? `${(duration / 1000).toFixed(1)} seconds`
      : "Not available";

  setText("#analysisDuration", durationText);
  setText("#resultModelName", metadata.model || "Gemma model");

  if (modelName) {
    modelName.textContent = metadata.model || "Gemma model";
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  if (analysisResults) {
    analysisResults.hidden = false;
  }

  analysisResults?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function setLoading(isLoading) {
  if (!analyzeButton) return;

  analyzeButton.disabled = isLoading;

  if (messageInput) {
    messageInput.disabled = isLoading;
  }

  if (isLoading) {
    analyzeButton.classList.add("is-loading");

    if (analyzeButtonText) {
      analyzeButtonText.textContent = "Analyzing message...";
    } else {
      analyzeButton.textContent = "Analyzing message...";
    }

    setStatus(
      "Gemma is reviewing the message. This can take several seconds.",
      ""
    );
  } else {
    analyzeButton.classList.remove("is-loading");

    if (analyzeButtonText) {
      analyzeButtonText.textContent = "Analyze message";
    } else {
      analyzeButton.textContent = "Analyze message";
    }
  }
}

async function analyzeMessage(message) {
  setLoading(true);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || `Analysis request failed (${response.status}).`
      );
    }

    if (!data.analysis || typeof data.analysis !== "object") {
      throw new Error("The server returned an invalid analysis.");
    }

    renderAnalysis(data.analysis, {
      model: data.model,
      elapsedMs: data.elapsedMs
    });

    setStatus(
      "Analysis complete. Review the evidence and recommended actions.",
      "success"
    );

    await loadHistory();
  } catch (error) {
    console.error("ScamShield analysis error:", error);

    setStatus(
      error.message ||
        "Could not analyze the message. Check the server and try again.",
      "error"
    );
  } finally {
    setLoading(false);
    updateCharacterCount();
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!messageInput) return;

  const message = messageInput.value.trim();

  if (!message) {
    setStatus("Please enter a message to analyze.", "error");
    messageInput.focus();
    return;
  }

  if (message.length > MAX_LENGTH) {
    setStatus(
      `Please keep the message under ${MAX_LENGTH.toLocaleString()} characters.`,
      "error"
    );
    messageInput.focus();
    return;
  }

  await analyzeMessage(message);
}

function renderHistory(history) {
  if (!historyList) return;

  historyList.replaceChildren();

  if (!Array.isArray(history) || history.length === 0) {
    historyList.appendChild(
      createElement(
        "div",
        "history-empty",
        "No analyses yet. Analyze a message to start your history."
      )
    );
    return;
  }

  history.forEach((record) => {
    const item = createElement("div", "history-item");
    const left = createElement("div", "history-left");

    const message = createElement(
      "div",
      "history-message",
      record.messagePreview || "Message analyzed"
    );

    let dateLabel = "Date unavailable";

    if (record.createdAt) {
      const date = new Date(record.createdAt);

      if (!Number.isNaN(date.getTime())) {
        dateLabel = date.toLocaleString();
      }
    }

    const date = createElement(
      "span",
      "history-date",
      dateLabel
    );

    left.append(message, date);

    const right = createElement("div", "history-right");

    const risk = normalizeRisk(record.riskLevel);

    const riskBadge = createElement(
      "span",
      "history-risk",
      risk
    );

    riskBadge.dataset.risk = risk;

    const complexity = createElement(
      "span",
      "history-complexity",
      `Complexity: ${normalizeComplexity(record.analysisComplexity)}`
    );

    right.append(riskBadge, complexity);
    item.append(left, right);

    historyList.appendChild(item);
  });
}

async function loadHistory() {
  if (!historyList) return;

  historyList.replaceChildren(
    createElement("div", "history-loading", "Loading analysis history...")
  );

  try {
    const response = await fetch("/api/history");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Could not load history.");
    }

    renderHistory(data.history);
  } catch (error) {
    console.error("History loading error:", error);

    historyList.replaceChildren(
      createElement(
        "div",
        "history-error",
        "History could not be loaded. Use Refresh to try again."
      )
    );
  }
}

async function loadHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error("Health check failed.");
    }

    if (modelName) {
      modelName.textContent = data.model || "Gemma model";
    }

    const skillStatus = $("#skillStatus");

    if (skillStatus) {
      skillStatus.textContent = data.skillLoaded
        ? "Analysis skill loaded"
        : "Analysis skill unavailable";
    }

    const serverStatus = $("#serverStatus");

    if (serverStatus) {
      serverStatus.textContent = data.apiKeyConfigured
        ? "AI service connected"
        : "AI configuration required";
    }
  } catch (error) {
    console.error("Health check error:", error);

    if (modelName) {
      modelName.textContent = "Connection unavailable";
    }
  }
}

function setupSampleButtons() {
  document.querySelectorAll("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const sampleName = button.dataset.sample;
      const sample = sampleMessages[sampleName];

      if (!sample || !messageInput) return;

      messageInput.value = sample;
      updateCharacterCount();

      setStatus("Sample message loaded. You can edit it before analysis.");

      messageInput.focus();
      messageInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    });
  });
}

function setupNavigation() {
  document.querySelectorAll('a[href="#scanner"]').forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(() => messageInput?.focus(), 350);
    });
  });

  const refreshHistory = $("#refreshHistory");

  refreshHistory?.addEventListener("click", loadHistory);
}

function initialize() {
  form?.addEventListener("submit", handleSubmit);

  messageInput?.addEventListener("input", () => {
    updateCharacterCount();

    if (formStatus?.classList.contains("error")) {
      setStatus("");
    }
  });

  setupSampleButtons();
  setupNavigation();
  updateCharacterCount();

  loadHealth();
  loadHistory();
}

document.addEventListener("DOMContentLoaded", initialize);

/* ==========================================
   PHISHING URL SCANNER
   Connects to POST /api/scan-url
========================================== */

(() => {
  const urlForm = document.getElementById("urlScanForm");

  // Do nothing if the URL scanner HTML is not present.
  if (!urlForm) return;

  const urlInput = document.getElementById("urlInput");
  const scanButton = document.getElementById("urlScanButton");
  const scanButtonText = document.getElementById("urlScanButtonText");
  const status = document.getElementById("urlScanStatus");
  const results = document.getElementById("urlScanResults");

  const riskIndicator = document.getElementById("urlRiskIndicator");
  const riskLevel = document.getElementById("urlRiskLevel");
  const hostname = document.getElementById("urlHostname");
  const score = document.getElementById("urlScore");
  const protocol = document.getElementById("urlProtocol");
  const indicatorCount = document.getElementById("urlIndicatorCount");
  const indicatorsContainer = document.getElementById("urlIndicators");
  const disclaimer = document.getElementById("urlDisclaimer");

  function showStatus(message, type = "") {
    status.textContent = message;
    status.dataset.type = type;
  }

  function resetResults() {
    results.hidden = true;
    indicatorsContainer.replaceChildren();
  }

  function makeIndicatorCard(indicator) {
    const card = document.createElement("div");
    card.className = "evidence-item";

    const title = document.createElement("strong");
    title.textContent = indicator.title || "Security indicator";

    const explanation = document.createElement("p");
    explanation.textContent =
      indicator.explanation || "No additional explanation provided.";

    card.append(title, explanation);
    return card;
  }

  urlForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const url = urlInput.value.trim();

    if (!url) {
      showStatus("Please enter a website URL.", "error");
      return;
    }

    scanButton.disabled = true;
    scanButtonText.textContent = "Scanning...";
    showStatus("Inspecting URL structure...", "loading");
    resetResults();

    try {
      const response = await fetch("/api/scan-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to scan this URL.");
      }

      const level = String(data.riskLevel || "LOW").toUpperCase();

      // Display the scanner's risk level and details.
      riskIndicator.dataset.risk = level;
      riskLevel.textContent = level;
      hostname.textContent = data.hostname || "Unknown host";
      score.textContent = `Heuristic score: ${data.score ?? 0}`;
      protocol.textContent = data.protocol
        ? `Protocol: ${data.protocol.replace(":", "").toUpperCase()}`
        : "";

      // Build indicator cards safely using textContent.
      indicatorsContainer.replaceChildren();

      const detected = Array.isArray(data.indicators)
        ? data.indicators
        : [];

      if (detected.length > 0) {
        detected.forEach((indicator) => {
          indicatorsContainer.appendChild(makeIndicatorCard(indicator));
        });
      } else {
        const message = document.createElement("p");
        message.className = "history-empty";
        message.textContent =
          "No warning indicators were detected by these heuristic rules. This does not prove the URL is safe.";
        indicatorsContainer.appendChild(message);
      }

      indicatorCount.textContent =
        `${detected.length} ${detected.length === 1 ? "signal" : "signals"}`;

      disclaimer.textContent = data.disclaimer ||
        "This heuristic assessment is not proof that a URL is safe or malicious.";

      results.hidden = false;
      showStatus("URL scan complete.", "success");
    } catch (error) {
      showStatus(
        error.message || "Could not scan the URL. Check that the server is running.",
        "error"
      );
    } finally {
      scanButton.disabled = false;
      scanButtonText.textContent = "Scan URL";
    }
  });
})();
