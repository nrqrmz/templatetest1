import { useEffect, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  closestCorners,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ApplicationCard } from '@/components/ApplicationCard'
import { groupByStatus, planMove, type Columns, type Move } from '@/lib/board'
import { statusStyles } from '@/lib/status'
import { supabase } from '@/lib/supabase'
import { STATUSES, type Application, type Status } from '@/lib/types'
import { cn } from '@/lib/utils'

const isStatus = (id: unknown): id is Status => (STATUSES as readonly unknown[]).includes(id)

function SortableCard({ application, anyDragging }: { application: Application; anyDragging: boolean }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: application.id })
  const open = () => navigate(`/applications/${application.id}`)

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      aria-label={`${application.position} at ${application.company}. Press Enter to open, Space to pick up and move.`}
      onClick={() => !anyDragging && open()}
      onKeyDown={(event) => {
        listeners?.onKeyDown?.(event)
        if (event.key === 'Enter' && !anyDragging) open()
      }}
      style={{ transform: CSS.Transform.toString(transform), transition, touchAction: 'manipulation' }}
      className={cn(
        'cursor-grab rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <ApplicationCard application={application} hideStatus className="hover:shadow-card-hover" />
    </div>
  )
}

function Column({
  status,
  items,
  active,
  anyDragging,
}: {
  status: Status
  items: Application[]
  active: boolean
  anyDragging: boolean
}) {
  const { setNodeRef } = useDroppable({ id: status })
  return (
    <section
      aria-label={`${status} applications`}
      className={cn(
        'flex min-h-48 w-72 shrink-0 snap-start flex-col gap-3 rounded-2xl bg-muted/70 p-3 ring-1 ring-border/60 transition-shadow lg:w-auto',
        active && 'ring-2 ring-primary/60',
      )}
    >
      <header className="flex items-center gap-2 px-1">
        <span className={cn('size-2.5 rounded-full', statusStyles[status].dot)} />
        <h2 className="text-sm font-semibold capitalize">{status}</h2>
        <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {items.length}
        </span>
      </header>
      <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-3">
          {items.map((app) => (
            <SortableCard key={app.id} application={app} anyDragging={anyDragging} />
          ))}
          {items.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              {anyDragging ? 'Drop here' : 'No applications'}
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  )
}

interface Props {
  applications: Application[]
  /** Called right after a drop so the page can keep its own copy of the data in sync. */
  onMoved: (moves: Move[]) => void
  /** Called when saving failed, to load the real data again. */
  onReload: () => void
}

export default function KanbanBoard({ applications, onMoved, onReload }: Props) {
  const [columns, setColumns] = useState<Columns>(() => groupByStatus(applications))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [startStatus, setStartStatus] = useState<Status | null>(null)

  // Follow the page's data whenever it changes (initial load, reload, edits elsewhere).
  useEffect(() => {
    setColumns(groupByStatus(applications))
  }, [applications])

  // The keyboard handler lives as long as a drag does, so it reads the latest columns through a ref.
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  // Left/Right jump to the neighbouring column; Up/Down step through the cards of the current column.
  const keyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
    const { active, droppableRects, collisionRect } = context
    if (!active || !collisionRect) return
    const current = columnsRef.current
    const status = STATUSES.find((s) => current[s].some((a) => a.id === active.id))
    if (!status) return
    const centerY = collisionRect.top + collisionRect.height / 2

    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      event.preventDefault()
      const target = STATUSES[STATUSES.indexOf(status) + (event.code === 'ArrowRight' ? 1 : -1)]
      const targetRect = target && droppableRects.get(target)
      const fromRect = droppableRects.get(status)
      if (!targetRect || !fromRect) return
      const maxTop = Math.max(targetRect.top, targetRect.bottom - collisionRect.height)
      return {
        x: targetRect.left + (collisionRect.left - fromRect.left),
        y: Math.min(Math.max(collisionRect.top, targetRect.top), maxTop),
      }
    }

    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      event.preventDefault()
      const down = event.code === 'ArrowDown'
      const next = current[status]
        .filter((a) => a.id !== active.id)
        .map((a) => droppableRects.get(a.id))
        .filter((r): r is NonNullable<typeof r> => !!r)
        .map((r) => ({ r, c: r.top + r.height / 2 }))
        .filter(({ c }) => (down ? c > centerY + 1 : c < centerY - 1))
        .sort((a, b) => (down ? a.c - b.c : b.c - a.c))[0]
      if (!next) return
      return { x: collisionRect.left, y: next.c - collisionRect.height / 2 }
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Press and hold, so scrolling the board with a finger still works.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: keyboardCoordinates,
      // Space picks a card up and drops it; Enter is kept for opening the card.
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  )

  const findContainer = (id: string | number): Status | undefined => {
    if (isStatus(id)) return id
    return STATUSES.find((s) => columns[s].some((a) => a.id === id))
  }
  const activeApp = useMemo(
    () => (activeId ? STATUSES.flatMap((s) => columns[s]).find((a) => a.id === activeId) : undefined),
    [activeId, columns],
  )

  // Pointer position decides the column; inside a column, the nearest card decides the slot.
  const collisionDetection: CollisionDetection = (args) => {
    // With the keyboard there is no pointer: use the dragged card's corners instead.
    const hits = args.pointerCoordinates
      ? (() => {
          const pointerHits = pointerWithin(args)
          return pointerHits.length > 0 ? pointerHits : rectIntersection(args)
        })()
      : closestCorners(args)
    let overId = getFirstCollision(hits, 'id')
    if (overId == null) return []
    if (isStatus(overId) && columns[overId].length > 0) {
      const ids = columns[overId].map((a) => a.id)
      const nearest = closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((c) => ids.includes(String(c.id))),
      })
      overId = nearest[0]?.id ?? overId
    }
    return [{ id: overId }]
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
    setStartStatus(findContainer(active.id) ?? null)
  }

  // While dragging across columns, move the card into the column it is over.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const from = findContainer(active.id)
    const to = findContainer(over.id)
    if (!from || !to || from === to) return

    setColumns((current) => {
      const moving = current[from].find((a) => a.id === active.id)
      if (!moving) return current
      const target = current[to]
      const overIndex = target.findIndex((a) => a.id === over.id)
      const translated = active.rect.current.translated
      // Below the target card when the dragged card's center is past the target's center.
      const below = !!translated && translated.top + translated.height / 2 > over.rect.top + over.rect.height / 2
      const index = overIndex >= 0 ? overIndex + (below ? 1 : 0) : target.length
      return {
        ...current,
        [from]: current[from].filter((a) => a.id !== active.id),
        [to]: [...target.slice(0, index), { ...moving, status: to }, ...target.slice(index)],
      }
    })
  }

  function reset() {
    setActiveId(null)
    setStartStatus(null)
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    const id = String(active.id)
    const from = startStatus
    reset()
    // Dropped on nothing: put everything back and save nothing.
    if (!over) {
      setColumns(groupByStatus(applications))
      return
    }
    const to = findContainer(id)
    if (!from || !to) return

    let column = columns[to]
    // Same column: the card may have been dropped on another card, so reorder.
    if (!isStatus(over.id) && over.id !== active.id && findContainer(over.id) === to) {
      const oldIndex = column.findIndex((a) => a.id === id)
      const newIndex = column.findIndex((a) => a.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) column = arrayMove(column, oldIndex, newIndex)
    }

    // Dropped back where it was: nothing to save.
    if (from === to && column.every((a, i) => a.id === columns[to][i]?.id)) return

    const moves: Move[] = planMove(column, id).map((u) => (u.id === id ? { ...u, status: to } : u))
    setColumns((current) => ({
      ...current,
      [to]: column.map((a) => {
        const move = moves.find((m) => m.id === a.id)
        return move ? { ...a, sort_order: move.sort_order, status: to } : a
      }),
    }))
    onMoved(moves)

    const results = await Promise.all(
      moves.map((m) =>
        supabase
          .from('applications')
          .update(m.status ? { status: m.status, sort_order: m.sort_order } : { sort_order: m.sort_order })
          .eq('id', m.id),
      ),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      toast.error(`Could not save the move: ${failed.error.message}`)
      onReload()
    } else if (from !== to) {
      toast.success(`Moved to ${to}`)
    }
  }

  function handleDragCancel() {
    reset()
    setColumns(groupByStatus(applications))
  }

  const nameOf = (id: string | number) => {
    const app = STATUSES.flatMap((s) => columns[s]).find((a) => a.id === id)
    return app ? `${app.position} at ${app.company}` : 'Application'
  }
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
    // `columns` has not caught up with this event yet, so describe where the card is pointing instead.
    onDragOver: ({ active, over }) => {
      const status = over && findContainer(over.id)
      if (!over || !status) return undefined
      const index = columns[status].findIndex((a) => a.id === over.id)
      return index >= 0
        ? `${nameOf(active.id)} is over ${status}, position ${index + 1} of ${columns[status].length}.`
        : `${nameOf(active.id)} is over ${status}.`
    },
    onDragEnd: ({ active, over }) => {
      const status = over && findContainer(over.id)
      return status ? `Dropped ${nameOf(active.id)} in ${status}.` : `${nameOf(active.id)} was dropped.`
    },
    onDragCancel: ({ active }) => `Move cancelled. ${nameOf(active.id)} returned to its place.`,
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'To pick up an application, press Space. Use the arrow keys to move it, Space to drop it, or Escape to cancel.',
        },
      }}
    >
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            items={columns[status]}
            active={activeId !== null && findContainer(activeId) === status}
            anyDragging={activeId !== null}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApp ? (
          <ApplicationCard application={activeApp} hideStatus className="rotate-2 cursor-grabbing shadow-card-hover" />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
