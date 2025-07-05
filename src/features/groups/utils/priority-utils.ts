import type { Priority } from '../types/priority';

export function swapPriorities<T extends { id: string; priority: Priority }>(
  items: T[],
  item1Id: string,
  item2Id: string,
): T[] {
  const item1Index = items.findIndex((item) => item.id === item1Id);
  const item2Index = items.findIndex((item) => item.id === item2Id);

  if (item1Index === -1 || item2Index === -1) {
    return items;
  }

  const newItems = [...items];
  const priority1 = newItems[item1Index].priority;
  const priority2 = newItems[item2Index].priority;

  newItems[item1Index] = { ...newItems[item1Index], priority: priority2 };
  newItems[item2Index] = { ...newItems[item2Index], priority: priority1 };

  return newItems;
}

export function reorderByPosition<T extends { id: string; priority: Priority }>(
  items: T[],
  draggedId: string,
  targetPosition: number,
): T[] {
  const draggedIndex = items.findIndex((item) => item.id === draggedId);
  if (draggedIndex === -1) return items;

  const sortedItems = [...items].sort((a, b) => a.priority - b.priority);
  const draggedItem = sortedItems[draggedIndex];

  sortedItems.splice(draggedIndex, 1);
  sortedItems.splice(targetPosition, 0, draggedItem);

  return sortedItems.map((item, index) => ({
    ...item,
    priority: (index + 1) as Priority,
  }));
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 1:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 2:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 3:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 4:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 1:
      return 'Critical';
    case 2:
      return 'High';
    case 3:
      return 'Medium';
    case 4:
      return 'Low';
  }
}

export function sortByPriority<T extends { priority: Priority }>(
  items: T[],
): T[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  return [...items].sort((a, b) => a.priority - b.priority);
}
