(() => {
  if (window.__semrushDomCaptureBridgeLoaded) {
    return;
  }

  window.__semrushDomCaptureBridgeLoaded = true;

  const EVENT_NAME = "semrush-dom-capture:network";
  const BODY_LIMIT = 50000;

  function emit(detail) {
    document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
  }

  function shouldTrack(url, contentType) {
    if (!url || !url.includes("semrush.com")) {
      return false;
    }

    if (!contentType) {
      return true;
    }

    return /(json|javascript|text|html)/i.test(contentType);
  }

  function truncate(text) {
    if (!text) {
      return "";
    }

    return text.length > BODY_LIMIT ? `${text.slice(0, BODY_LIMIT)}\n[truncated]` : text;
  }

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const request = args[0];
    const inputUrl = typeof request === "string" ? request : request?.url;
    const method = typeof request === "string" ? "GET" : request?.method || "GET";
    const startedAt = new Date().toISOString();

    const response = await originalFetch(...args);
    const cloned = response.clone();
    const contentType = cloned.headers.get("content-type") || "";

    if (shouldTrack(cloned.url || inputUrl, contentType)) {
      let bodyText = "";

      try {
        bodyText = truncate(await cloned.text());
      } catch {
        bodyText = "[unreadable body]";
      }

      emit({
        source: "fetch",
        method,
        url: cloned.url || inputUrl || "",
        status: cloned.status,
        ok: cloned.ok,
        contentType,
        startedAt,
        capturedAt: new Date().toISOString(),
        bodyText,
      });
    }

    return response;
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function patchedOpen(method, url, ...rest) {
    this.__semrushDomCaptureMethod = method;
    this.__semrushDomCaptureUrl = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function patchedSend(...args) {
    const startedAt = new Date().toISOString();

    this.addEventListener("loadend", () => {
      const contentType =
        this.getResponseHeader("content-type") ||
        this.getResponseHeader("Content-Type") ||
        "";

      if (!shouldTrack(this.__semrushDomCaptureUrl || this.responseURL, contentType)) {
        return;
      }

      let bodyText = "";

      try {
        if (typeof this.responseText === "string") {
          bodyText = truncate(this.responseText);
        } else {
          bodyText = "[non-text response]";
        }
      } catch {
        bodyText = "[unreadable body]";
      }

      emit({
        source: "xhr",
        method: this.__semrushDomCaptureMethod || "GET",
        url: this.responseURL || this.__semrushDomCaptureUrl || "",
        status: this.status,
        ok: this.status >= 200 && this.status < 400,
        contentType,
        startedAt,
        capturedAt: new Date().toISOString(),
        bodyText,
      });
    });

    return originalSend.apply(this, args);
  };
})();
