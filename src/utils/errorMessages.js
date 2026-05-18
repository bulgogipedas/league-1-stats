export function classifyError(error, context = "dashboard") {
  const message = typeof error === "string" ? error : error?.message || "";
  const lower = message.toLowerCase();

  if (lower.includes("failed to fetch") || lower.includes("network") || lower.includes("load failed")) {
    return {
      kind: "Internet connection issue",
      title: "We could not reach the data source",
      description: "Your connection may be offline, slow, or blocked by the browser. The dashboard is safe, but this section needs data before it can render.",
      action: "Check your internet connection, then try again.",
    };
  }

  if (lower.includes("unable to load") || lower.includes("404")) {
    return {
      kind: "Data file issue",
      title: "A required data file is missing",
      description: "The app could not find one of the JSON files it needs. This usually means preprocessing or deployment did not include the latest data output.",
      action: "Refresh the page. If it still happens, the site owner should rerun preprocessing and redeploy.",
    };
  }

  if (lower.includes("500") || lower.includes("502") || lower.includes("503") || lower.includes("504")) {
    return {
      kind: "Server issue",
      title: "The server is having trouble",
      description: "The request reached the server, but the server could not complete it right now.",
      action: "Try again in a moment. If the issue persists, the API or hosting service needs attention.",
    };
  }

  if (lower.includes("401") || lower.includes("403") || lower.includes("token") || lower.includes("hugging face")) {
    return {
      kind: "Configuration issue",
      title: context === "ai" ? "AI analysis is not available right now" : "This feature is not configured correctly",
      description: context === "ai"
        ? "The dashboard could not complete the AI request. This is usually caused by a missing, expired, or restricted Hugging Face token."
        : "The app is missing access or configuration for this request.",
      action: context === "ai"
        ? "The dashboard can still be used. Ask the site owner to check VITE_HF_TOKEN."
        : "Ask the site owner to check environment variables and service permissions.",
    };
  }

  return {
    kind: "Unexpected issue",
    title: "Something did not load correctly",
    description: "The dashboard hit an unexpected error while preparing this view.",
    action: "Refresh the page. If it happens again, share this page and the error details with the site owner.",
  };
}
