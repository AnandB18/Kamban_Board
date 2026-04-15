import type { DueBucket } from "../types/task";

interface DueDateMeta {
  bucket: DueBucket;
  label: string;
  tooltip: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function formatDisplayDate(value: string): string {
  return parseLocalDate(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(value: string): string {
  return parseLocalDate(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getDueDateMeta(dueDate: string | null): DueDateMeta {
  if (!dueDate) {
    return { bucket: "no_due", label: "No due date", tooltip: null };
  }

  const today = startOfDay(new Date());
  const due = startOfDay(parseLocalDate(dueDate));
  const diffDays = Math.round((due.getTime() - today.getTime()) / DAY_MS);

  if (diffDays < 0) {
    return {
      bucket: "overdue",
      label: `Overdue by ${Math.abs(diffDays)}d`,
      tooltip: formatFullDate(dueDate),
    };
  }

  if (diffDays === 0) {
    return {
      bucket: "today",
      label: "Due today",
      tooltip: formatFullDate(dueDate),
    };
  }

  if (diffDays <= 7) {
    return {
      bucket: "upcoming",
      label: `Due in ${diffDays}d`,
      tooltip: formatFullDate(dueDate),
    };
  }

  return {
    bucket: "later",
    label: `Due ${formatDisplayDate(dueDate)}`,
    tooltip: formatFullDate(dueDate),
  };
}
