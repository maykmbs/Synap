import { ItemType } from '@/types';

const colors: Record<ItemType, string> = {
  finance: 'bg-green-900 text-green-300',
  task:    'bg-blue-900 text-blue-300',
  library: 'bg-purple-900 text-purple-300',
  note:    'bg-yellow-900 text-yellow-300',
};

const labels: Record<ItemType, string> = {
  finance: 'Finance',
  task:    'Task',
  library: 'Library',
  note:    'Note',
};

export default function TypeBadge({ type }: { type: ItemType }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}>
      {labels[type]}
    </span>
  );
}
