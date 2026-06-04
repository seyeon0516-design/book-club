"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, BookOpen, Quote, Edit3, Check } from "lucide-react"
import type { Book, Thread, Reply } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { ThreadList } from "@/components/thread-list"
import { Button } from "@/components/ui/button"

interface BookDetailModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function BookDetailModal({ book, isOpen, onClose, onUpdate }: BookDetailModalProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [impressions, setImpressions] = useState(book.impressions || "")
  const [isEditingImpressions, setIsEditingImpressions] = useState(false)
  const [isSavingImpressions, setIsSavingImpressions] = useState(false)

  const supabase = createClient()

  const fetchThreads = async () => {
    setLoading(true)
    const { data: threadsData, error: threadsError } = await supabase
      .from("threads")
      .select("*")
      .eq("book_id", book.id)
      .order("created_at", { ascending: true })

    if (threadsError || !threadsData) {
      setLoading(false)
      return
    }

    const threadIds = threadsData.map((t) => t.id)
    
    if (threadIds.length === 0) {
      setThreads([])
      setLoading(false)
      return
    }

    const { data: repliesData } = await supabase
      .from("replies")
      .select("*")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: true })

    const threadsWithReplies = threadsData.map((thread) => ({
      ...thread,
      replies: repliesData?.filter((r: Reply) => r.thread_id === thread.id) || [],
    }))

    setThreads(threadsWithReplies)
    setLoading(false)
  }

  const saveImpressions = async () => {
    setIsSavingImpressions(true)
    const { error } = await supabase
      .from("books")
      .update({ impressions: impressions.trim() })
      .eq("id", book.id)

    if (!error) {
      setIsEditingImpressions(false)
      onUpdate()
    }
    setIsSavingImpressions(false)
  }

  useEffect(() => {
    if (isOpen) {
      fetchThreads()
      setImpressions(book.impressions || "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, book.id, book.impressions])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-background rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="relative h-48 md:h-56 flex-shrink-0">
              {book.image && book.image !== "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop" ? (
                <Image
                  src={book.image}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary to-accent/20 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">{book.title}</h2>
                <p className="text-muted-foreground mt-1 drop-shadow">{book.author} | {book.date}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Impressions Section */}
              <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Quote className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">인상깊은 문장 / 감상평</h3>
                  </div>
                  {isEditingImpressions ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={saveImpressions}
                      disabled={isSavingImpressions}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingImpressions(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      편집
                    </Button>
                  )}
                </div>
                {isEditingImpressions ? (
                  <textarea
                    value={impressions}
                    onChange={(e) => setImpressions(e.target.value)}
                    placeholder="이 책에서 인상깊었던 문장이나 감상평을 자유롭게 남겨주세요..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {impressions || "아직 작성된 내용이 없습니다. 편집 버튼을 눌러 추가해보세요."}
                  </p>
                )}
              </div>

              {/* Threads Section */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <ThreadList 
                  bookId={book.id} 
                  threads={threads} 
                  onThreadAdded={fetchThreads} 
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface BookCardProps {
  book: Book
  onUpdate: () => void
}

export function BookCard({ book, onUpdate }: BookCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-border">
          {book.image && book.image !== "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop" ? (
            <Image
              src={book.image}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary to-accent/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
              <BookOpen className="h-12 w-12 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-primary-foreground line-clamp-2">{book.title}</h3>
            <p className="text-sm text-primary-foreground/80 mt-1">{book.author}</p>
            <p className="text-xs text-primary-foreground/60 mt-1">{book.date}</p>
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-primary/90 rounded-full p-2">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </motion.div>
      
      <BookDetailModal 
        book={book} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  )
}
