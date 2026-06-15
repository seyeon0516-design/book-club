"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, MessageCircle, Plus, Send, ThumbsUp, Pencil, Check, X } from "lucide-react"
import type { Thread, Reply } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { SpeakerSelect } from "@/components/speaker-select"

interface ThreadListProps {
  bookId: number
  threads: Thread[]
  speakers: string[]
  onThreadAdded: () => void
  onAddSpeaker: (name: string) => void
}

export function ThreadList({ bookId, threads, speakers, onThreadAdded, onAddSpeaker }: ThreadListProps) {
  const [expandedThreads, setExpandedThreads] = useState<Set<number>>(new Set())
  const [showNewThread, setShowNewThread] = useState(false)
  const [newThreadSpeaker, setNewThreadSpeaker] = useState("")
  const [newThreadContent, setNewThreadContent] = useState("")
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: { speaker: string; content: string } }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // editing state
  const [editingThread, setEditingThread] = useState<number | null>(null)
  const [editThreadContent, setEditThreadContent] = useState("")
  const [editingReply, setEditingReply] = useState<number | null>(null)
  const [editReplyContent, setEditReplyContent] = useState("")

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
    if (!input?.speaker?.trim() || !input?.content?.trim()) return

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

  const likeThread = async (thread: Thread) => {
    await supabase.from("threads").update({ likes: (thread.likes || 0) + 1 }).eq("id", thread.id)
    onThreadAdded()
  }

  const likeReply = async (reply: Reply) => {
    await supabase.from("replies").update({ likes: (reply.likes || 0) + 1 }).eq("id", reply.id)
    onThreadAdded()
  }

  const saveThreadEdit = async (threadId: number) => {
    if (!editThreadContent.trim()) return
    await supabase.from("threads").update({ content: editThreadContent.trim() }).eq("id", threadId)
    setEditingThread(null)
    onThreadAdded()
  }

  const saveReplyEdit = async (replyId: number) => {
    if (!editReplyContent.trim()) return
    await supabase.from("replies").update({ content: editReplyContent.trim() }).eq("id", replyId)
    setEditingReply(null)
    onThreadAdded()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">대화 주제</h3>
        <Button variant="outline" size="sm" onClick={() => setShowNewThread(!showNewThread)} className="text-sm">
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
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">발언자</label>
              <SpeakerSelect
                speakers={speakers}
                value={newThreadSpeaker}
                onChange={setNewThreadSpeaker}
                onAddSpeaker={onAddSpeaker}
              />
            </div>
            <textarea
              placeholder="내용을 입력하세요..."
              value={newThreadContent}
              onChange={(e) => setNewThreadContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNewThread(false)}>
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
              <div className="w-full p-4 flex items-start justify-between text-left">
                <button onClick={() => toggleThread(thread.id)} className="flex-1 text-left">
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
                </button>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => likeThread(thread)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span className="text-xs">{thread.likes || 0}</span>
                  </button>
                  <button onClick={() => toggleThread(thread.id)}>
                    {expandedThreads.has(thread.id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedThreads.has(thread.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 bg-muted/30">
                      {editingThread === thread.id ? (
                        <div className="mb-4 space-y-2">
                          <textarea
                            value={editThreadContent}
                            onChange={(e) => setEditThreadContent(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingThread(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={() => saveThreadEdit(thread.id)}>
                              <Check className="h-4 w-4 mr-1" />
                              저장
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <p className="text-foreground text-sm whitespace-pre-wrap flex-1">{thread.content}</p>
                          <button
                            onClick={() => {
                              setEditingThread(thread.id)
                              setEditThreadContent(thread.content)
                            }}
                            className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      {thread.replies && thread.replies.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {thread.replies.map((reply: Reply) => (
                            <div key={reply.id} className="pl-4 border-l-2 border-primary/30">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-accent text-sm">{reply.speaker}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => likeReply(reply)}
                                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                    <span className="text-xs">{reply.likes || 0}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingReply(reply.id)
                                      setEditReplyContent(reply.content)
                                    }}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              {editingReply === reply.id ? (
                                <div className="mt-1 space-y-2">
                                  <input
                                    type="text"
                                    value={editReplyContent}
                                    onChange={(e) => setEditReplyContent(e.target.value)}
                                    className="w-full px-2 py-1 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingReply(null)}>
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button size="sm" onClick={() => saveReplyEdit(reply.id)}>
                                      <Check className="h-3.5 w-3.5 mr-1" />
                                      저장
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-foreground text-sm mt-1">{reply.content}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <SpeakerSelect
                          speakers={speakers}
                          value={replyInputs[thread.id]?.speaker || ""}
                          onChange={(name) => updateReplyInput(thread.id, "speaker", name)}
                          onAddSpeaker={onAddSpeaker}
                        />
                        <div className="flex gap-2 items-end">
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
                            disabled={
                              isSubmitting ||
                              !replyInputs[thread.id]?.speaker?.trim() ||
                              !replyInputs[thread.id]?.content?.trim()
                            }
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
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
