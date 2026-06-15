"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, BookOpen, Pencil, Check, Upload } from "lucide-react"
import type { Book, Thread, Reply, BookImpression } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { ThreadList } from "@/components/thread-list"
import { ImpressionList } from "@/components/impression-list"
import { Button } from "@/components/ui/button"

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop"

interface BookDetailModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  speakers: string[]
  onAddSpeaker: (name: string) => void
}

export function BookDetailModal({ book, isOpen, onClose, onUpdate, speakers, onAddSpeaker }: BookDetailModalProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [impressions, setImpressions] = useState<BookImpression[]>([])
  const [loading, setLoading] = useState(true)

  // book editing
  const [isEditingBook, setIsEditingBook] = useState(false)
  const [editTitle, setEditTitle] = useState(book.title)
  const [editAuthor, setEditAuthor] = useState(book.author)
  const [editDate, setEditDate] = useState(book.date)
  const [editImage, setEditImage] = useState<string>(book.image)

  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    const { data: threadsData } = await supabase
      .from("threads")
      .select("*")
      .eq("book_id", book.id)
      .order("created_at", { ascending: true })

    const { data: impressionsData } = await supabase
      .from("book_impressions")
      .select("*")
      .eq("book_id", book.id)
      .order("created_at", { ascending: true })

    setImpressions(impressionsData || [])

    if (threadsData && threadsData.length > 0) {
      const threadIds = threadsData.map((t) => t.id)
      const { data: repliesData } = await supabase
        .from("replies")
        .select("*")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: true })

      setThreads(
        threadsData.map((thread) => ({
          ...thread,
          replies: repliesData?.filter((r: Reply) => r.thread_id === thread.id) || [],
        })),
      )
    } else {
      setThreads([])
    }
    setLoading(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setEditImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const saveBookEdit = async () => {
    await supabase
      .from("books")
      .update({
        title: editTitle.trim(),
        author: editAuthor.trim() || "작자미상",
        date: editDate.trim(),
        image: editImage,
      })
      .eq("id", book.id)
    setIsEditingBook(false)
    onUpdate()
  }

  useEffect(() => {
    if (isOpen) {
      fetchData()
      setEditTitle(book.title)
      setEditAuthor(book.author)
      setEditDate(book.date)
      setEditImage(book.image)
      setIsEditingBook(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, book.id])

  const hasImage = book.image && book.image !== DEFAULT_IMAGE

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
              {hasImage ? (
                <Image src={book.image} alt={book.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary to-accent/20 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
              <div className="absolute top-4 right-4 flex gap-2">
                {!isEditingBook && (
                  <button
                    onClick={() => setIsEditingBook(true)}
                    className="p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                  >
                    <Pencil className="h-5 w-5 text-foreground" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>
              {!isEditingBook && (
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">{book.title}</h2>
                  <p className="text-muted-foreground mt-1 drop-shadow">
                    {book.author} | {book.date}
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isEditingBook && (
                <div className="bg-secondary/30 rounded-xl p-4 border border-border space-y-3">
                  <h3 className="font-semibold text-foreground">책 정보 수정</h3>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="책 제목"
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    placeholder="저자"
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    placeholder="날짜"
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                    <Upload className="h-4 w-4" />
                    표지 이미지 변경
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {editImage && editImage !== DEFAULT_IMAGE && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editImage} alt="미리보기" className="h-24 w-auto rounded-md object-cover" />
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingBook(false)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={saveBookEdit} disabled={!editTitle.trim()}>
                      <Check className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                  </div>
                </div>
              )}

              <ImpressionList
                bookId={book.id}
                impressions={impressions}
                speakers={speakers}
                onUpdate={fetchData}
                onAddSpeaker={onAddSpeaker}
              />

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <ThreadList
                  bookId={book.id}
                  threads={threads}
                  speakers={speakers}
                  onThreadAdded={fetchData}
                  onAddSpeaker={onAddSpeaker}
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
  speakers: string[]
  onAddSpeaker: (name: string) => void
}

export function BookCard({ book, onUpdate, speakers, onAddSpeaker }: BookCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const hasImage = book.image && book.image !== DEFAULT_IMAGE

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
          {hasImage ? (
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
        speakers={speakers}
        onAddSpeaker={onAddSpeaker}
      />
    </>
  )
}
