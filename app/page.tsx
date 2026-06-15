"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, BookOpen } from "lucide-react"
import type { Book } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { BookCard } from "@/components/book-card"
import { AddBookModal } from "@/components/add-book-modal"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [speakers, setSpeakers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const supabase = createClient()

  const fetchBooks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setBooks(data)
    }
    setLoading(false)
  }

  const fetchSpeakers = async () => {
    const { data } = await supabase.from("speakers").select("*").order("created_at", { ascending: true })
    if (data) setSpeakers(data.map((s) => s.name))
  }

  const handleAddSpeaker = async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || speakers.includes(trimmed)) return
    setSpeakers((prev) => [...prev, trimmed])
    await supabase.from("speakers").insert({ name: trimmed })
  }

  useEffect(() => {
    fetchBooks()
    fetchSpeakers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="flex items-center justify-center gap-3 text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              <span aria-hidden="true">🍺</span>
              캡숑 독모
              <span aria-hidden="true">🍶</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 tracking-[0.3em] uppercase">since 2022</p>
          </motion.div>
        </div>
      </header>

      {/* Books History Banner */}
      <div className="bg-primary/5 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center justify-center h-11 w-11 rounded-full bg-primary/15 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">우리가 함께 읽은 책</p>
                <p className="text-xs text-muted-foreground">
                  지금까지 <span className="font-semibold text-primary">{books.length}</span>권을 나눴어요
                </p>
              </div>
            </div>

            {books.length > 0 && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border border-border whitespace-nowrap shadow-sm"
                    >
                      <span className="text-xs font-medium text-foreground">{book.title}</span>
                      <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                        {book.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-foreground">우리가 읽은 책들</h2>
          <Button onClick={() => setIsAddModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            책 추가
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : books.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">아직 등록된 책이 없습니다</p>
            <p className="text-muted-foreground text-sm mt-2">첫 번째 책을 추가해보세요!</p>
            <Button className="mt-6" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />첫 책 추가하기
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {books.map((book) => (
              <motion.div key={book.id} variants={itemVariants}>
                <BookCard book={book} onUpdate={fetchBooks} speakers={speakers} onAddSpeaker={handleAddSpeaker} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onBookAdded={fetchBooks} />
    </div>
  )
}
