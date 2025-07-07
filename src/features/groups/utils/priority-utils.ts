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
    priority: index + 1,
  }));
}

export function getPriorityColor(priority: Priority): string {
  if (priority >= 1 && priority <= 99) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
  if (priority >= 100 && priority <= 299) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  }
  if (priority >= 300 && priority <= 599) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
  if (priority >= 600 && priority <= 999) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}

export function getPriorityLabel(priority: Priority): string {
  if (priority >= 1 && priority <= 99) {
    return 'Critical';
  }
  if (priority >= 100 && priority <= 299) {
    return 'High';
  }
  if (priority >= 300 && priority <= 599) {
    return 'Medium';
  }
  if (priority >= 600 && priority <= 999) {
    return 'Low';
  }
  return 'Unknown';
}

export function sortByPriority<T extends { priority: Priority }>(
  items: T[],
): T[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  return [...items].sort((a, b) => a.priority - b.priority);
}
