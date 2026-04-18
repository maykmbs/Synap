import { InboxItem } from '@/types';

interface ItemCardProps {
  item: InboxItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="bg-surface rounded-lg p-4 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-primary text-sm truncate">{item.raw_text}</p>
        <span className="text-muted text-xs">{new Date(item.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
