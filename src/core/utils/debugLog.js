const DEBUG_ENDPOINT = "http://127.0.0.1:7582/ingest/21ed1b4b-ba8f-497b-a099-3cab007e91c9";
const DEBUG_SESSION_ID = "31363e";

export function debugLog(location, message, data = {}, hypothesisId = "general") {
  const payload = {
    sessionId: DEBUG_SESSION_ID,
    runId: data.runId || "pre-fix",
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now()
  };

  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": DEBUG_SESSION_ID
    },
    body: JSON.stringify(payload)
  }).catch(() => {});
  // #endregion
}
