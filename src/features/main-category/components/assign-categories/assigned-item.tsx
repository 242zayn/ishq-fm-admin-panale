'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { Category } from '@/features/category/api/types';
import { cn } from '@/lib/utils';

interface AssignedItemProps {
  category: Category;
  index: number;
  total: number;
  onRemove: (category: Category) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function AssignedItem({
  category,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown
}: AssignedItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const subtitle = [
    category.slug,
    category.totalStories !== undefined ? `${category.totalStories} stories` : null,
    category.tags?.length ? category.tags.slice(0, 2).join(', ') : null
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/90 px-3.5 py-2.5 transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-850/80',
        isDragging && 'z-50 opacity-40 border-primary/60 scale-[0.98]'
      )}
    >
      <div className='flex items-center gap-3 min-w-0'>
        {/* Grip Handle */}
        <button
          type='button'
          {...attributes}
          {...listeners}
          className='flex h-8 w-6 cursor-grab items-center justify-center rounded text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing focus-visible:outline-none'
          title='Drag to reorder'
        >
          <Icons.gripVertical className='h-4 w-4' />
        </button>

        {/* Thumbnail Image */}
        <div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-800 shadow-sm'>
          {category.iconImage || category.bannerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.iconImage || category.bannerImage}
              alt={category.title}
              className='h-full w-full object-cover'
            />
          ) : (
            <Icons.categories className='h-4 w-4 text-muted-foreground' />
          )}
        </div>

        {/* Details */}
        <div className='flex flex-col min-w-0'>
          <span className='truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors'>
            {category.title}
          </span>
          <span className='truncate text-xs text-muted-foreground'>
            {subtitle || 'No tags'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className='flex items-center gap-1 shrink-0'>
        {/* Move Up */}
        <Button
          type='button'
          variant='ghost'
          size='icon'
          disabled={index === 0}
          onClick={() => onMoveUp(index)}
          className='h-7 w-7 rounded-md text-muted-foreground hover:bg-zinc-800 hover:text-foreground disabled:opacity-20'
          title='Move up'
        >
          <Icons.chevronUp className='h-3.5 w-3.5' />
        </Button>

        {/* Move Down */}
        <Button
          type='button'
          variant='ghost'
          size='icon'
          disabled={index === total - 1}
          onClick={() => onMoveDown(index)}
          className='h-7 w-7 rounded-md text-muted-foreground hover:bg-zinc-800 hover:text-foreground disabled:opacity-20'
          title='Move down'
        >
          <Icons.chevronDown className='h-3.5 w-3.5' />
        </Button>

        {/* Unassign / Remove */}
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={() => onRemove(category)}
          className='h-7 w-7 rounded-md text-red-400 hover:bg-red-500/10 hover:text-red-300'
          title='Unassign category'
        >
          <Icons.close className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  );
}

export function DraggedAssignedItemOverlay({ category }: { category: Category }) {
  return (
    <div className='flex items-center justify-between gap-3 rounded-xl border border-primary/60 bg-zinc-900/95 px-4 py-3 shadow-2xl backdrop-blur-md scale-[1.02]'>
      <div className='flex items-center gap-3'>
        <Icons.gripVertical className='h-4 w-4 text-primary' />
        <div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/40 bg-zinc-800'>
          {category.iconImage || category.bannerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.iconImage || category.bannerImage}
              alt={category.title}
              className='h-full w-full object-cover'
            />
          ) : (
            <Icons.categories className='h-4 w-4 text-primary' />
          )}
        </div>
        <div className='flex flex-col'>
          <span className='text-sm font-semibold text-primary'>{category.title}</span>
          <span className='text-xs text-muted-foreground'>{category.slug}</span>
        </div>
      </div>
    </div>
  );
}
