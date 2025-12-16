"use client"

import { useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import BlockRenderer from "./BlockRenderer"
import { TbGripVertical, TbTrash, TbCopy } from "react-icons/tb"

function SortableBlock({ block, isSelected, onSelect, onDelete, onDuplicate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white rounded-lg border-2 overflow-hidden
        transition-all cursor-pointer
        ${isSelected ? 'border-[var(--pink)] shadow-lg' : 'border-gray-200 hover:border-gray-300'}
        ${isDragging ? 'shadow-2xl' : ''}
      `}
      onClick={() => onSelect(block.id)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 bg-white rounded border border-gray-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <TbGripVertical className="w-4 h-4 text-gray-600" />
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate(block.id)
          }}
          className="p-1 bg-white rounded border border-gray-300 hover:bg-gray-100"
          title="Másolás"
        >
          <TbCopy className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('Biztosan törlöd ezt a blokkot?')) {
              onDelete(block.id)
            }
          }}
          className="p-1 bg-white rounded border border-red-300 hover:bg-red-50"
          title="Törlés"
        >
          <TbTrash className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {/* Block Content */}
      <div className="p-4">
        <BlockRenderer block={block} />
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--pink)]" />
      )}
    </div>
  )
}

export default function BuilderCanvas({
  blocks,
  selectedBlockId,
  onBlockSelect,
  onBlockDelete,
  onBlockDuplicate,
}) {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  })

  return (
    <div ref={setNodeRef} className="max-w-5xl mx-auto p-8 min-h-full">
      {blocks.length === 0 ? (
        <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500 text-lg font-medium mb-2">
              Nincs még blokk az oldalon
            </p>
            <p className="text-gray-400 text-sm">
              Húzz át egy blokkot a bal oldali listából
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              onSelect={onBlockSelect}
              onDelete={onBlockDelete}
              onDuplicate={onBlockDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
