"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, Plus, Pencil, Check, X } from "lucide-react"
import type { BookImpression } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { SpeakerSelect } from "@/components/speaker-select"

interface ImpressionListProps {
  bookId: number
  impressions: BookImpression[]
  speakers: string[]
  onUpdate: () => void
  onAddSpeaker: (name: string) => void
}

export function ImpressionList({ bookId, impressions, speakers, onUpdate, onAddSpeaker }: ImpressionListProps) {
  const [showNew, setShowNew] = useState(false)
  const [newSpeaker, setNewSpeaker] = useState("")
  const [newContent, setNewContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")

  const supabase = createClient()

  const handleAdd = async () => {
    if (!newSpeaker.trim() || !newContent.trim()) return
    setIsSubmitting(true)
    const { error } = await supabase.from("book_impressions").insert({
      book_id: bookId,
      speaker: newSpeaker.trim(),
      content: newContent.trim(),
    })
    if (!error) {
      setNewSpeaker("")
      setNewContent("")
      setShowNew(false)
      onUpdate()
    }
    setIsSubmitting(false)
  }

  const saveEdit = async (id: number) => {
    if (!editContent.trim()) return
    await supabase.from("book_impressions").update({ content: editContent.trim() }).eq("id", id)
    setEditingId(null)
    onUpdate()
  }

  return (
    <div className="bg-secondary/30 rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Quote className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">감상평 및 인상깊은 문장</h3>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowNew(!showNew)}>
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-lg p-3 space-y-3 mb-3 border border-border"
          >
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">작성자</label>
              <SpeakerSelect
                speakers={speakers}
                value={newSpeaker}
                onChange={setNewSpeaker}
                onAddSpeaker={onAddSpeaker}
              />
            </div>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="인상깊었던 문장이나 감상평을 남겨주세요..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>
                취소
              </Button>
              <Button size="sm" onClick={handleAdd} disabled={isSubmitting || !newSpeaker.trim() || !newContent.trim()}>
                등록
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {impressions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          아직 작성된 내용이 없습니다. 추가 버튼을 눌러 감상평을 남겨보세요.
        </p>
      ) : (
        <div className="space-y-3">
          {impressions.map((imp) => (
            <div key={imp.id} className="bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-primary text-sm">{imp.speaker}</span>
                <button
                  onClick={() => {
                    setEditingId(imp.id)
                    setEditContent(imp.content)
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              {editingId === imp.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" onClick={() => saveEdit(imp.id)}>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{imp.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
