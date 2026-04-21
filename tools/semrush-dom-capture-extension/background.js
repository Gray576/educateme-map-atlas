/* global chrome, setTimeout */

const LATEST_SUMMARY_KEY = "semrushDomCapture.latestSummary";
const PENDING_RELOAD_KEY = "semrushDomCapture.pendingReload";
const RELOAD_CAPTURE_DELAY_MS = 2500;
const SEND_RETRY_DELAY_MS = 1500;
const SEND_RETRY_COUNT = 5;

async function setStorageItem(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

async function getStorageItem(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

async function removeStorageItem(key) {
  await chrome.storage.local.remove(key);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendCaptureMessageToTab(tabId, reason) {
  let lastError = null;

  for (let attempt = 0; attempt < SEND_RETRY_COUNT; attempt += 1) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        type: "performCapture",
        autoDownload: true,
        reason,
      });

      if (response?.ok) {
        return response;
      }

      lastError = new Error(response?.error || "Unknown capture failure");
    } catch (error) {
      lastError = error;
    }

    await sleep(SEND_RETRY_DELAY_MS);
  }

  throw lastError || new Error("Could not send capture message to tab");
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message?.type === "downloadCapture") {
      const json = JSON.stringify(message.payload, null, 2);
      const url = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;

      const downloadId = await chrome.downloads.download({
        url,
        filename: message.filename,
        saveAs: false,
        conflictAction: "uniquify",
      });

      sendResponse({ ok: true, downloadId });
      return;
    }

    if (message?.type === "storeCaptureSummary") {
      await setStorageItem(LATEST_SUMMARY_KEY, message.summary);
      sendResponse({ ok: true });
      return;
    }

    if (message?.type === "getLatestSummary") {
      const summary = await getStorageItem(LATEST_SUMMARY_KEY);
      sendResponse({ ok: true, summary: summary || null });
      return;
    }

    if (message?.type === "clearLatestSummary") {
      await removeStorageItem(LATEST_SUMMARY_KEY);
      sendResponse({ ok: true });
      return;
    }

    if (message?.type === "scheduleReloadCapture") {
      await setStorageItem(PENDING_RELOAD_KEY, {
        tabId: message.tabId,
        scheduledAt: new Date().toISOString(),
      });
      await chrome.tabs.reload(message.tabId);
      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false, error: "Unknown background message" });
  })().catch((error) => {
    sendResponse({ ok: false, error: String(error?.message || error) });
  });

  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  void (async () => {
    const pending = await getStorageItem(PENDING_RELOAD_KEY);

    if (!pending || pending.tabId !== tabId) {
      return;
    }

    await sleep(RELOAD_CAPTURE_DELAY_MS);

    try {
      await sendCaptureMessageToTab(tabId, "reload");
    } finally {
      await removeStorageItem(PENDING_RELOAD_KEY);
    }
  })();
});
