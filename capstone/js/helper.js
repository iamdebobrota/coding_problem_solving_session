export function escapseHtml(s) {
  if (s == null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

export function badge(value) {
  const v = escapseHtml(value);
  return `<span class="badge">${value}</span>`;
}

export function showMessage(id, message, type = "info") {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.className = `msg ${type}`;
}