"use client"

// Egyszerűsített Text, Image, CTA, Gallery blokkok

import { useState } from "react"
import H1 from "@/app/components/UI/Texts/H1"
import H2 from "@/app/components/UI/Texts/H2"
import H3 from "@/app/components/UI/Texts/H3"
import H4 from "@/app/components/UI/Texts/H4"
import Paragraph from "@/app/components/UI/Texts/Paragraph"
import { TbH1, TbH2, TbH3, TbH4, TbAlignLeft, TbTrash, TbGripVertical, TbArrowUp, TbArrowDown, TbPhoto } from "react-icons/tb"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import MediaLibraryModal from "@/app/components/admin/MediaLibraryModal"
import Image from "next/image"

// Helper to parse content (backward compatibility)
function parseContent(value) {
  if (!value) return []
  if (typeof value === 'string') {
    return [{ type: 'paragraph', text: value }]
  }
  if (Array.isArray(value)) return value
  return []
}

// TEXT BLOCK
export function TextBlockPreview({ config }) {
  const blocks = parseContent(config.content)

  return (
    <div className="p-6 prose max-w-none space-y-4">
      {blocks.length === 0 && <p className="text-gray-400">Nincs tartalom...</p>}
      {blocks.map((block, index) => {
        const style = block.color ? { color: block.color } : {}
        switch (block.type) {
          case 'h1':
            return <H1 key={index} style={style}>{block.text || 'Címsor'}</H1>
          case 'h2':
            return <H2 key={index} style={style}>{block.text || 'Címsor'}</H2>
          case 'h3':
            return <H3 key={index} style={style}>{block.text || 'Címsor'}</H3>
          case 'h4':
            return <H4 key={index} style={style}>{block.text || 'Címsor'}</H4>
          case 'paragraph':
            return <Paragraph key={index} style={style}>{block.text || 'Bekezdés'}</Paragraph>
          default:
            return null
        }
      })}
    </div>
  )
}

// Sortable block item for drag & drop
function SortableBlockItem({ block, index, blockTypeLabels, updateBlock, deleteBlock, moveUp, moveDown, totalBlocks, presetColors }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `block-${index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`border border-gray-200 rounded-md bg-white ${isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''}`}>
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 border-b border-gray-200">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <TbGripVertical className="text-gray-400" />
        </div>
        <span className="text-xs font-medium text-gray-600 flex-1">
          {blockTypeLabels[block.type]}
        </span>
        <button
          type="button"
          onClick={() => moveUp(index)}
          disabled={index === 0}
          className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Fel"
        >
          <TbArrowUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => moveDown(index)}
          disabled={index === totalBlocks - 1}
          className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Le"
        >
          <TbArrowDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => deleteBlock(index)}
          className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
          title="Törlés"
        >
          <TbTrash className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        <textarea
          className="w-full text-sm border border-gray-200 rounded p-2 outline-none resize-none"
          value={block.text}
          onChange={(e) => updateBlock(index, 'text', e.target.value)}
          placeholder={`${blockTypeLabels[block.type]} szövege...`}
          rows={block.type === 'paragraph' ? 3 : 1}
        />

        {/* Color picker */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-600">Szín:</span>
          <div className="flex gap-1">
            {presetColors.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => updateBlock(index, 'color', preset.value)}
                className={`w-6 h-6 rounded border-2 transition-all ${block.color === preset.value ? 'border-blue-500 scale-110' : 'border-gray-300'
                  }`}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
          <input
            type="color"
            value={block.color && !block.color.startsWith('var(') ? block.color : '#000000'}
            onChange={(e) => updateBlock(index, 'color', e.target.value)}
            className="w-8 h-6 rounded border border-gray-300 cursor-pointer"
            title="Egyedi szín"
          />
          {block.color && (
            <button
              type="button"
              onClick={() => updateBlock(index, 'color', '')}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              Alapértelmezett
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function TextBlockSettings({ config, onChange }) {
  const blocks = parseContent(config.content)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addBlock = (type) => {
    const newBlocks = [...blocks, { type, text: '', color: '' }]
    onChange({ ...config, content: newBlocks })
  }

  const updateBlock = (index, field, value) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], [field]: value }
    onChange({ ...config, content: newBlocks })
  }

  const deleteBlock = (index) => {
    const newBlocks = blocks.filter((_, i) => i !== index)
    onChange({ ...config, content: newBlocks })
  }

  const moveUp = (index) => {
    if (index === 0) return
    const newBlocks = arrayMove(blocks, index, index - 1)
    onChange({ ...config, content: newBlocks })
  }

  const moveDown = (index) => {
    if (index === blocks.length - 1) return
    const newBlocks = arrayMove(blocks, index, index + 1)
    onChange({ ...config, content: newBlocks })
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = parseInt(active.id.replace('block-', ''))
      const newIndex = parseInt(over.id.replace('block-', ''))

      const newBlocks = arrayMove(blocks, oldIndex, newIndex)
      onChange({ ...config, content: newBlocks })
    }
  }

  const blockTypeLabels = {
    h1: 'H1',
    h2: 'H2',
    h3: 'H3',
    h4: 'H4',
    paragraph: 'Bekezdés'
  }

  const presetColors = [
    { name: 'Pink', value: 'var(--pink)' },
    { name: 'Zöld', value: 'var(--green)' },
    { name: 'Fekete', value: '#000000' },
    { name: 'Fehér', value: '#ffffff' },
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
        <button
          type="button"
          onClick={() => addBlock('h1')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="H1 hozzáadása"
        >
          <TbH1 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => addBlock('h2')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="H2 hozzáadása"
        >
          <TbH2 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => addBlock('h3')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="H3 hozzáadása"
        >
          <TbH3 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => addBlock('h4')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="H4 hozzáadása"
        >
          <TbH4 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => addBlock('paragraph')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bekezdés hozzáadása"
        >
          <TbAlignLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Blocks */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((_, index) => `block-${index}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {blocks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Használd a fenti gombokat tartalom hozzáadásához
              </p>
            )}

            {blocks.map((block, index) => (
              <SortableBlockItem
                key={`block-${index}`}
                block={block}
                index={index}
                blockTypeLabels={blockTypeLabels}
                updateBlock={updateBlock}
                deleteBlock={deleteBlock}
                moveUp={moveUp}
                moveDown={moveDown}
                totalBlocks={blocks.length}
                presetColors={presetColors}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Live Preview */}
      {blocks.length > 0 && (
        <div className="border-t pt-4">
          <label className="text-xs font-bold text-gray-600 mb-2 block">Élő előnézet:</label>
          <div className="border border-gray-200 rounded-md p-4 bg-white space-y-4">
            {blocks.map((block, index) => {
              const style = block.color ? { color: block.color } : {}
              switch (block.type) {
                case 'h1':
                  return <H1 key={index} classname={block.color ? '' : ''} style={style}>{block.text || 'Címsor'}</H1>
                case 'h2':
                  return <H2 key={index} classname={block.color ? '' : ''} style={style}>{block.text || 'Címsor'}</H2>
                case 'h3':
                  return <H3 key={index} classname={block.color ? '' : ''} style={style}>{block.text || 'Címsor'}</H3>
                case 'h4':
                  return <H4 key={index} classname={block.color ? '' : ''} style={style}>{block.text || 'Címsor'}</H4>
                case 'paragraph':
                  return <Paragraph key={index} classname={block.color ? '' : ''} style={style}>{block.text || 'Bekezdés'}</Paragraph>
                default:
                  return null
              }
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function TextBlockPublic({ config }) {
  const blocks = parseContent(config.content)

  if (blocks.length === 0) return null

  return (
    <div className="py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {blocks.map((block, index) => {
          const style = block.color ? { color: block.color } : {}
          switch (block.type) {
            case 'h1':
              return <H1 key={index} style={style}>{block.text}</H1>
            case 'h2':
              return <H2 key={index} style={style}>{block.text}</H2>
            case 'h3':
              return <H3 key={index} style={style}>{block.text}</H3>
            case 'h4':
              return <H4 key={index} style={style}>{block.text}</H4>
            case 'paragraph':
              return <Paragraph key={index} style={style}>{block.text}</Paragraph>
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}

// IMAGE BLOCK
export function ImageBlockPreview({ config }) {
  return (
    <div className="p-6">
      {config.image ? (
        <div>
          <img src={config.image} alt={config.imageAlt || ''} className="w-full rounded" />
          {config.caption && <p className="text-center text-sm text-gray-600 mt-2">{config.caption}</p>}
        </div>
      ) : (
        <div className="bg-gray-100 h-48 flex items-center justify-center rounded text-gray-400">
          Nincs kép
        </div>
      )}
    </div>
  )
}

export function ImageBlockSettings({ config, onChange }) {
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

  return (
    <>
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(imageUrl) => {
          if (imageUrl) {
            onChange({ ...config, image: imageUrl })
          }
          setMediaModalOpen(false)
        }}
      />

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-600 mb-2 block">Kép</label>
          {config.image ? (
            <div
              className="relative cursor-pointer group border border-gray-300 rounded-md overflow-hidden"
              onClick={() => setMediaModalOpen(true)}
            >
              <Image
                src={config.image}
                alt={config.imageAlt || 'Kép előnézet'}
                width={400}
                height={300}
                className="w-full h-auto object-cover group-hover:opacity-70 transition-opacity"
              />
              <span className="absolute bottom-2 right-2 bg-white text-xs px-2 py-1 rounded shadow">
                Kép módosítása
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMediaModalOpen(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-md p-8 hover:border-[var(--pink)] hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <TbPhoto className="w-12 h-12 text-gray-400" />
              <span className="text-sm text-gray-600">Kattints a kép kiválasztásához</span>
            </button>
          )}
        </div>

        <input
          type="text"
          className="w-full border border-gray-300 rounded p-2"
          placeholder="Alt text"
          value={config.imageAlt || ''}
          onChange={(e) => onChange({ ...config, imageAlt: e.target.value })}
        />
        <input
          type="text"
          className="w-full border border-gray-300 rounded p-2"
          placeholder="Képaláírás"
          value={config.caption || ''}
          onChange={(e) => onChange({ ...config, caption: e.target.value })}
        />
      </div>
    </>
  )
}

export function ImageBlockPublic({ config }) {
  if (!config.image) return null
  return (
    <div className="py-8 px-4 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <img src={config.image} alt={config.imageAlt || ''} className="w-full rounded-lg shadow-lg" />
        {config.caption && (
          <p className="text-center text-gray-600 mt-4">{config.caption}</p>
        )}
      </div>
    </div>
  )
}

// CTA BLOCK
export function CTABlockPreview({ config }) {
  return (
    <div className="p-6 text-center">
      <button className={`px-8 py-3 rounded-lg font-medium ${config.style === 'green' ? 'bg-[var(--green)]' :
        config.style === 'black' ? 'bg-black' : 'bg-[var(--pink)]'
        } text-white`}>
        {config.text || 'Kattints ide'}
      </button>
    </div>
  )
}

export function CTABlockSettings({ config, onChange }) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        className="w-full border border-gray-300 rounded p-2"
        placeholder="Gomb szöveg"
        value={config.text || ''}
        onChange={(e) => onChange({ ...config, text: e.target.value })}
      />
      <input
        type="text"
        className="w-full border border-gray-300 rounded p-2"
        placeholder="Link"
        value={config.link || ''}
        onChange={(e) => onChange({ ...config, link: e.target.value })}
      />
      <select
        className="w-full border border-gray-300 rounded p-2"
        value={config.style || 'pink'}
        onChange={(e) => onChange({ ...config, style: e.target.value })}
      >
        <option value="pink">Rózsaszín</option>
        <option value="green">Zöld</option>
        <option value="black">Fekete</option>
      </select>
    </div>
  )
}

export function CTABlockPublic({ config }) {
  if (!config.text || !config.link) return null
  return (
    <div className="py-12 px-4 text-center">
      <a
        href={config.link}
        className={`inline-block px-8 py-3 rounded-lg font-medium ${config.style === 'green' ? 'bg-[var(--green)] hover:bg-[var(--green-hover)]' :
          config.style === 'black' ? 'bg-black hover:bg-gray-800' : 'bg-[var(--pink)] hover:bg-[var(--pink-hover)]'
          } text-white transition-colors`}
      >
        {config.text}
      </a>
    </div>
  )
}

// GALLERY BLOCK
export function GalleryBlockPreview({ config }) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-2">
        {config.images?.length > 0 ? (
          config.images.map((img, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded overflow-hidden">
              <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
            </div>
          ))
        ) : (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
              Kép {i + 1}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function GalleryBlockSettings({ config, onChange }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Galéria blokk (egyszerűsített)</p>
      <textarea
        className="w-full border border-gray-300 rounded p-2 min-h-[100px]"
        placeholder='[{"url": "/image1.jpg", "alt": "Kép 1"}]'
        value={JSON.stringify(config.images || [])}
        onChange={(e) => {
          try {
            onChange({ ...config, images: JSON.parse(e.target.value) })
          } catch { }
        }}
      />
    </div>
  )
}

export function GalleryBlockPublic({ config }) {
  if (!config.images?.length) return null
  return (
    <div className="py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {config.images.map((img, i) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden shadow-lg">
            <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
          </div>
        ))}
      </div>
    </div>
  )
}
