export interface WorkItem {
  id: string;
  title: string;
  status: string;
  type: string[];
  priority?: string;
  assignees?: string[];
  labels?: string[];
  search_blob?: string;
  file?: string;
}

export interface Filters {
  types: string[];
  priorities: string[];
  assignees: string[];
  statuses: string[];
  query: string;
}

export function indexBoard(boardData: Record<string, WorkItem[]>): WorkItem[] {
  const items: WorkItem[] = [];
  for (const status of Object.keys(boardData)) {
    for (const item of boardData[status]) {
      items.push({ ...item, status });
    }
  }
  return items;
}

export function filterAndSearch(items: WorkItem[], filters: Filters): WorkItem[] {
  return items.filter(item => {
    // Type filter (OR within selected types)
    if (filters.types.length > 0) {
      const hasType = filters.types.some(t => item.type?.includes(t));
      if (!hasType) return false;
    }

    // Priority filter
    if (filters.priorities.length > 0 && !filters.priorities.includes(item.priority || '')) {
      return false;
    }

    // Assignee filter
    if (filters.assignees.length > 0) {
      const hasAssignee = filters.assignees.some(a =>
        item.assignees?.some(assignee => assignee.toLowerCase().includes(a.toLowerCase()))
      );
      if (!hasAssignee) return false;
    }

    // Status filter (OR within selected statuses)
    if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) {
      return false;
    }

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchable = [
        item.title,
        item.search_blob || '',
        item.id,
        ...(item.type || []),
        ...(item.assignees || []),
        ...(item.labels || [])
      ].join(' ').toLowerCase();

      if (!searchable.includes(query)) return false;
    }

    return true;
  });
}

export function getUniqueValues(items: WorkItem[], field: keyof WorkItem): string[] {
  const values = new Set<string>();
  items.forEach(item => {
    const val = item[field];
    if (Array.isArray(val)) {
      val.forEach(v => values.add(v));
    } else if (val) {
      values.add(val as string);
    }
  });
  return Array.from(values).sort();
}

export function highlightText(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}