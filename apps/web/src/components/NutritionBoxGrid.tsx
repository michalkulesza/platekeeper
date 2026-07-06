import { useEffect, useRef, useState } from 'react'
import { Info } from 'react-feather'

export interface NutritionBoxGridItem {
  label: string
  value: string
  accessibilityLabel: string
}

interface NutritionBoxGridProps {
  items: NutritionBoxGridItem[]
  editing: boolean
  onChangeValue?: (index: number, value: string) => void
  disclaimerText: string
}

const DisclaimerPopover = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative group shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-6 h-6 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
        aria-label={text}
      >
        <Info className="w-4 h-4" />
      </button>
      <div
        className={`absolute right-0 top-full mt-1.5 w-60 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-600 shadow-lg z-20 group-hover:block ${
          open ? 'block' : 'hidden'
        }`}
      >
        {text}
      </div>
    </div>
  )
}

const NutritionBoxGrid = ({
  items,
  editing,
  onChangeValue,
  disclaimerText,
}: NutritionBoxGridProps) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 grid grid-cols-5 gap-2 min-w-0">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center border border-zinc-200 rounded-lg px-2 py-1.5 min-w-0"
          >
            {editing ? (
              <input
                type="number"
                value={item.value}
                onChange={(e) => onChangeValue?.(i, e.target.value)}
                placeholder="—"
                aria-label={item.accessibilityLabel}
                className="w-full bg-transparent text-zinc-900 font-semibold text-sm text-center focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            ) : (
              <span className="text-sm font-semibold text-zinc-900">
                {item.value !== '' ? item.value : '—'}
              </span>
            )}
            <span className="text-[11px] text-zinc-500 truncate max-w-full">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <DisclaimerPopover text={disclaimerText} />
    </div>
  )
}

export default NutritionBoxGrid
