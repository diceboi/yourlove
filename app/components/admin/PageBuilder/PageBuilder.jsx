"use client"

import { useState } from "react"
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import BlockPalette from "./BlockPalette"
import BuilderCanvas from "./BuilderCanvas"
import BlockSettings from "./BlockSettings"
import LivePreviewModal from "./LivePreviewModal"
import { createBlock } from "./blockTypes"

export default function PageBuilder({ 
  blocks, 
  setBlocks, 
  pageData, 
  setPageData,
  showPreview,
  setShowPreview 
}) {
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [activeId, setActiveId] = useState(null)

  const selectedBlock = blocks.find(b => b.id === selectedBlockId)

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    // If dragging from palette (string id = block type)
    if (typeof active.id === 'string' && !blocks.find(b => b.id === active.id)) {
      const newBlock = createBlock(active.id)
      const overIndex = blocks.findIndex(b => b.id === over.id)
      
      if (overIndex >= 0) {
        // Insert at position
        const newBlocks = [...blocks]
        newBlocks.splice(overIndex, 0, newBlock)
        setBlocks(newBlocks)
      } else {
        // Add to end
        setBlocks([...blocks, newBlock])
      }
      setSelectedBlockId(newBlock.id)
      return
    }

    // Reordering existing blocks
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)
      setBlocks(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  const handleBlockSelect = (blockId) => {
    setSelectedBlockId(blockId)
  }

  const handleBlockUpdate = (blockId, newConfig) => {
    setBlocks(blocks.map(b => 
      b.id === blockId ? { ...b, config: newConfig } : b
    ))
  }

  const handleBlockDelete = (blockId) => {
    setBlocks(blocks.filter(b => b.id !== blockId))
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null)
    }
  }

  const handleBlockDuplicate = (blockId) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return
    
    const newBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }
    
    const index = blocks.findIndex(b => b.id === blockId)
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
    setSelectedBlockId(newBlock.id)
  }

  return (
    <>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Block Palette */}
          <div className="w-64 border-r border-[var(--border)] bg-gray-50 overflow-y-auto">
            <BlockPalette />
          </div>

          {/* Center: Canvas */}
          <div className="flex-1 overflow-y-auto bg-gray-100">
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <BuilderCanvas
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                onBlockSelect={handleBlockSelect}
                onBlockDelete={handleBlockDelete}
                onBlockDuplicate={handleBlockDuplicate}
              />
            </SortableContext>
          </div>

          {/* Right: Settings */}
          <div className="w-80 border-l border-[var(--border)] bg-white overflow-y-auto">
            <BlockSettings
              block={selectedBlock}
              pageData={pageData}
              setPageData={setPageData}
              onUpdate={handleBlockUpdate}
            />
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border-2 border-[var(--pink)] rounded-lg p-4 shadow-lg opacity-80">
              Blokk mozgatása...
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showPreview && (
        <LivePreviewModal
          blocks={blocks}
          pageData={pageData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}
