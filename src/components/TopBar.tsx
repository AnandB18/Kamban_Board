import type { DueBucket, TaskPriority } from "../types/task";

interface TopBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  priority: "all" | TaskPriority;
  onPriorityChange: (value: "all" | TaskPriority) => void;
  dueBucket: "all" | DueBucket;
  onDueBucketChange: (value: "all" | DueBucket) => void;
  projectQuery: string;
  onProjectQueryChange: (value: string) => void;
  onCreateClick: () => void;
}

export function TopBar({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  dueBucket,
  onDueBucketChange,
  projectQuery,
  onProjectQueryChange,
  onCreateClick,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <h1>Sprint Board</h1>
        <p>Plan, prioritize, and move work forward.</p>
      </div>
      <div className="topbar__controls">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by title"
          aria-label="Search by title"
        />
        <input
          value={projectQuery}
          onChange={(event) => onProjectQueryChange(event.target.value)}
          placeholder="Filter by project"
          aria-label="Filter by project"
        />
        <select value={priority} onChange={(event) => onPriorityChange(event.target.value as "all" | TaskPriority)}>
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <select value={dueBucket} onChange={(event) => onDueBucketChange(event.target.value as "all" | DueBucket)}>
          <option value="all">All due dates</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="upcoming">Upcoming (1-7d)</option>
          <option value="later">Later</option>
          <option value="no_due">No due date</option>
        </select>
        <button type="button" className="btn btn--primary" onClick={onCreateClick}>
          + New Task
        </button>
      </div>
    </header>
  );
}
