'use client';

import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COMPONENT_LABELS, type ComponentKey } from '@/hooks/use-event-templates';

/**
 * Step 3's Component Order — drag and drop.
 *
 * The mockup showed a static numbered strip with no way to change it. This is
 * the same strip, made draggable, because "Arrange the order in which components
 * will appear" is not something a read-only list can do.
 *
 * Three decisions worth keeping:
 *
 *  - **Components switched OFF stay in the list, dimmed.** Removing them would
 *    lose their position, so turning one back on would drop it at the bottom.
 *    They are shown struck-through with an eye-off icon so the difference
 *    between "not shown" and "not ordered" is visible.
 *
 *  - **A keyboard sensor is wired, not just the pointer one.** A reorder control
 *    that only works with a mouse is a reorder control half the operators cannot
 *    use — dnd-kit gives this for free and announces the moves to screen readers.
 *
 *  - **`activationConstraint` of 6px.** Without it a plain CLICK registers as a
 *    drag, and the tiles feel like they jump when you merely touch one.
 */
export function ComponentOrderList({
    order,
    components,
    onChange,
}: {
    order: ComponentKey[];
    components: Record<ComponentKey, number>;
    onChange: (next: ComponentKey[]) => void;
}) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const from = order.indexOf(active.id as ComponentKey);
        const to = order.indexOf(over.id as ComponentKey);
        if (from === -1 || to === -1) return;

        onChange(arrayMove(order, from, to));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={order} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap gap-2">
                    {order.map((key, index) => (
                        <SortableChip
                            key={key}
                            id={key}
                            index={index}
                            label={COMPONENT_LABELS[key]}
                            enabled={!!Number(components?.[key] ?? 1)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

function SortableChip({
    id,
    index,
    label,
    enabled,
}: {
    id: ComponentKey;
    index: number;
    label: string;
    enabled: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            {...attributes}
            {...listeners}
            className={cn(
                'flex cursor-grab select-none items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors',
                'active:cursor-grabbing',
                isDragging
                    ? 'z-10 border-primary bg-primary/10 shadow-md'
                    : 'border-border bg-card hover:border-primary/40',
                !enabled && 'opacity-50'
            )}
            title={
                enabled
                    ? 'Drag to reorder'
                    : `${label} is switched off — it keeps its position for when you turn it back on.`
            }
        >
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
                {index + 1}
            </span>
            <span className={cn('font-medium text-foreground', !enabled && 'line-through')}>{label}</span>
            {!enabled && <EyeOff className="h-3 w-3 shrink-0 text-muted-foreground" />}
        </div>
    );
}
