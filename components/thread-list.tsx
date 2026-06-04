"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, MessageCircle, Plus, Send } from "lucide-react"
import type { Thread, Reply } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface ThreadListProps {
  bookId: number
  threads: Thread[]
  onThreadAdded: () => void
}

export function ThreadList({ bookId, threads, onThreadAdded }: ThreadListProps) {
  const [expandedThreads, setExpandedThreads] = useState<Set<number>>(new Set())
  const [showNewThread, setShowNewThread] = useState(false)
  const [newThreadSpeaker, setNewThreadSpeaker] = useState("")
  const [newThreadContent, setNewThreadContent] = useState("")
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: { speaker: string; content: string } }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  const toggleThread = (threadId: number) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev)
      if (next.has(threadId)) {
        next.delete(threadId)
      } else {
        next.add(threadId)
      }
      return next
    })
  }

  const handleAddThread = async () => {
    if (!newThreadSpeaker.trim() || !newThreadContent.trim()) return
    
    setIsSubmitting(true)
    const { error } = await supabase.from("threads").insert({
      book_id: bookId,
      speaker: newThreadSpeaker.trim(),
      content: newThreadContent.trim(),
    })

    if (!error) {
      setNewThreadSpeaker("")
      setNewThreadContent("")
      setShowNewThread(false)
      onThreadAdded()
    }
    setIsSubmitting(false)
  }

  const handleAddReply = async (threadId: number) => {
    const input = replyInputs[threadId]
    if (!input?.speaker.trim() || !input?.content.trim()) return

    setIsSubmitting(true)
    const { error } = await supabase.from("replies").insert({
      thread_id: threadId,
      speaker: input.speaker.trim(),
      content: input.content.trim(),
    })

    if (!error) {
      setReplyInputs((prev) => ({ ...prev, [threadId]: { speaker: "", content: "" } }))
      onThreadAdded()
    }
    setIsSubmitting(false)
  }

  const updateReplyInput = (threadId: number, field: "speaker" | "content", value: string) => {
    setReplyInputs((prev) => ({
      ...prev,
      [threadId]: { ...prev[threadId], [field]: value },
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">대화 주제</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewThread(!showNewThread)}
          className="text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>

      <AnimatePresence>
        {showNewThread && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-muted rounded-lg p-4 space-y-3"
          >
            <input
              type="text"
              placeholder="발언자 이름"
              value={newThreadSpeaker}
              onChange={(e) => setNewThreadSpeaker(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              placeholder="내용을 입력하세요..."
              value={newThreadContent}
              onChange={(e) => setNewThreadContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewThread(false)}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleAddThread}
                disabled={isSubmitting || !newThreadSpeaker.trim() || !newThreadContent.trim()}
              >
                등록
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {threads.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">아직 대화가 없습니다. 첫 주제를 추가해보세요!</p>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <motion.div
              key={thread.id}
              layout
              className="bg-card border border-border rounded-lg overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleThread(thread.id)}
                className="w-full p-4 flex items-start justify-between text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-primary">{thread.speaker}</span>
                    {thread.replies && thread.replies.length > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {thread.replies.length}
                      </span>
                    )}
                  </div>
                  <p className="text-foreground text-sm line-clamp-2">{thread.content}</p>
                </div>
                {expandedThreads.has(thread.id) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                )}
              </button>

              <AnimatePresence>
                {expandedThreads.has(thread.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 bg-muted/30">
                      <p className="text-foreground text-sm whitespace-pre-wrap mb-4">{thread.content}</p>

                      {thread.replies && thread.replies.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {thread.replies.map((reply: Reply) => (
                            <div key={reply.id} className="pl-4 border-l-2 border-primary/30">
                              <span className="font-medium text-accent text-sm">{reply.speaker}</span>
                              <p className="text-foreground text-sm mt-1">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 items-end">
                        <input
                          type="text"
                          placeholder="이름"
                          value={replyInputs[thread.id]?.speaker || ""}
                          onChange={(e) => updateReplyInput(thread.id, "speaker", e.target.value)}
                          className="w-20 px-2 py-1.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="답글 입력..."
                          value={replyInputs[thread.id]?.content || ""}
                          onChange={(e) => updateReplyInput(thread.id, "content", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleAddReply(thread.id)
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddReply(thread.id)}
                          disabled={isSubmitting || !replyInputs[thread.id]?.speaker?.trim() || !replyInputs[thread.id]?.content?.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
