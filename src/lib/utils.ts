export function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(input: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(input);
}

export function formatTimeRange(startTime?: string | null, endTime?: string | null) {
  if (startTime && endTime) {
    return `${startTime}~${endTime}`;
  }

  if (startTime) {
    return `${startTime} 起`;
  }

  return "待补时间";
}

export function parseEventDateInput(value: string) {
  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  return new Date(`${normalized}T12:00:00+08:00`);
}

export function toDateInputValue(input?: Date | null) {
  if (!input) {
    return "";
  }

  return input.toISOString().slice(0, 10);
}
