"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Check } from "lucide-react"

interface SpeakerSelectProps {
  speakers: string[]
  value: string
  onChange: (name: string) => void
  onAddSpeaker: (name: string) => void
  placeholder?: string
}

export function SpeakerSelect({
  speakers,
  value,
  onChange,
  onAddSpeaker,
  placeholder = "발언자 선택",
}: SpeakerSelectProps) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")

  function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed) return
    onAddSpeaker(trimmed)
    onChange(trimmed)
    setNewName("")
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {speakers.map((name) => {
          const selected = value === name
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {selected && <Check className="h-3 w-3" />}
              {name}
            </button>
          )
        })}

        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-3 w-3" />
            이름 추가
          </button>
        )}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
                if (e.key === "Escape") {
                  setAdding(false)
                  setNewName("")
                }
              }}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              등록
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false)
                setNewName("")
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
            >
              취소
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
