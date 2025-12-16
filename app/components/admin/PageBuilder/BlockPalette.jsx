"use client"

import { useDraggable } from "@dnd-kit/core"
import * as TablerIcons from "react-icons/tb"
import { BLOCK_TYPES, BLOCK_LABELS, BLOCK_ICONS } from "./blockTypes"

function DraggableBlockType({ type, label, icon }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: type,
  })

  const IconComponent = TablerIcons[icon]

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-3 p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing
        transition-all hover:border-[var(--pink)] hover:bg-pink-50
        ${isDragging ? 'opacity-50 border-[var(--pink)]' : 'border-gray-200 bg-white'}
      `}
    >
      {IconComponent && <IconComponent className="w-5 h-5 text-[var(--pink)]" />}
      <span className="font-medium text-sm">{label}</span>
    </div>
  )
}

export default function BlockPalette() {
  const blockTypes = [
    { type: BLOCK_TYPES.HERO, label: BLOCK_LABELS[BLOCK_TYPES.HERO], icon: BLOCK_ICONS[BLOCK_TYPES.HERO] },
    { type: BLOCK_TYPES.PRODUCTS, label: BLOCK_LABELS[BLOCK_TYPES.PRODUCTS], icon: BLOCK_ICONS[BLOCK_TYPES.PRODUCTS] },
    { type: BLOCK_TYPES.TEXT, label: BLOCK_LABELS[BLOCK_TYPES.TEXT], icon: BLOCK_ICONS[BLOCK_TYPES.TEXT] },
    { type: BLOCK_TYPES.IMAGE, label: BLOCK_LABELS[BLOCK_TYPES.IMAGE], icon: BLOCK_ICONS[BLOCK_TYPES.IMAGE] },
    { type: BLOCK_TYPES.CTA, label: BLOCK_LABELS[BLOCK_TYPES.CTA], icon: BLOCK_ICONS[BLOCK_TYPES.CTA] },
    { type: BLOCK_TYPES.GALLERY, label: BLOCK_LABELS[BLOCK_TYPES.GALLERY], icon: BLOCK_ICONS[BLOCK_TYPES.GALLERY] },
  ]

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-bold text-lg mb-2">Blokkok</h3>
        <p className="text-sm text-gray-600 mb-4">
          Húzd a vászonra a kívánt blokkot
        </p>
      </div>

      <div className="space-y-2">
        {blockTypes.map(({ type, label, icon }) => (
          <DraggableBlockType
            key={type}
            type={type}
            label={label}
            icon={icon}
          />
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 Tipp: A blokkok sorrendje áthúzással változtatható
        </p>
      </div>
    </div>
  )
}
