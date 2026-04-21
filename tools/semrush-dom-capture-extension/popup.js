/* global chrome, document */

const statusEl = document.getElementById("status");
const versionEl = document.getElementById("version");
const captureCurrentButton = document.getElementById("capture-current");
const captureReloadButton = document.getElementById("capture-reload");
const clearSummaryButton = document.getElementById("clear-summary");

renderVersion();
void hydrateLatestSummary();

captureCurrentButton.addEventListener("click", async () => {
  setStatus("Capturing current page...");

  const tab = await getActiveTab();

  if (!tab?.id || !isSemrushTab(tab)) {
    setStatus("Open a SEMrush page first.");
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "performCapture",
      autoDownload: true,
      reason: "manual",
    });

    if (!response?.ok) {
      throw new Error(response?.error || "Capture failed");
    }

    setStatus(renderSummary(response.summary));
  } catch (error) {
    setStatus(
      `Could not capture the page.\n${String(error?.message || error)}\nIf the extension was just loaded, refresh the SEMrush tab once and try again.`
    );
  }
});

captureReloadButton.addEventListener("click", async () => {
  setStatus("Scheduling reload capture...");

  const tab = await getActiveTab();

  if (!tab?.id || !isSemrushTab(tab)) {
    setStatus("Open a SEMrush page first.");
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: "scheduleReloadCapture",
    tabId: tab.id,
  });

  if (!response?.ok) {
    setStatus(`Reload capture failed.\n${response?.error || "Unknown error"}`);
    return;
  }

  setStatus("Page is reloading. Capture will start automatically after the tab finishes loading.");
});

clearSummaryButton.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "clearLatestSummary" });
  setStatus("Last summary cleared.");
});

async function hydrateLatestSummary() {
  const response = await chrome.runtime.sendMessage({ type: "getLatestSummary" });

  if (response?.ok && response.summary) {
    setStatus(renderSummary(response.summary));
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

function isSemrushTab(tab) {
  return typeof tab.url === "string" && tab.url.startsWith("https://www.semrush.com/");
}

function setStatus(text) {
  statusEl.textContent = text;
}

function renderVersion() {
  const manifest = chrome.runtime.getManifest();
  versionEl.textContent = `v${manifest.version}`;
}

function renderSummary(summary) {
  return [
    `File: ${summary.filename}`,
    `Report: ${summary.page.reportType}`,
    `DB: ${summary.page.database || "unknown"}`,
    `Query: ${summary.page.query || "n/a"}`,
    `Segments: ${summary.segmentCount}`,
    `Network entries: ${summary.networkEntriesCaptured}`,
    `Document tables: ${summary.documentTableCount}`,
    `Notes: ${summary.notes}`,
  ].join("\n");
}
