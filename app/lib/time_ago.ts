export function timeAgo(dateInput: Date | string): string {
  if (!dateInput) return "";

  const now = new Date();
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const intervals = {
    year: Math.floor(seconds / (60 * 60 * 24 * 365)),
    month: Math.floor(seconds / (60 * 60 * 24 * 30)),
    day: Math.floor(seconds / (60 * 60 * 24)),
    hour: Math.floor(seconds / (60 * 60)),
    minute: Math.floor(seconds / 60),
  };

  if (intervals.year > 1) {
    return `${intervals.year} years ago`;
  } else if (intervals.month > 1) {
    return `${intervals.month} months ago`;
  } else if (intervals.day > 1) {
    return `${intervals.day} days ago`;
  } else if (intervals.hour > 1) {
    return `${intervals.hour} hours ago`;
  } else if (intervals.minute > 1) {
    return `${intervals.minute} minutes ago`;
  } else {
    return "just now";
  }
}
