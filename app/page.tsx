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

  useEffect(() => {
    fetchBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              캡숑 독모
            </h1>
            <p className="text-sm text-muted-foreground mt-2 tracking-widest">
              since 2022
            </p>
          </motion.div>
        </div>
      </header>

      {/* Books History Banner */}
      {books.length > 0 && (
        <div className="bg-secondary/50 border-y border-border">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">읽은 책</span>
              <div className="flex items-center gap-2">
                {books.slice(0, 10).map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-border whitespace-nowrap"
                  >
                    <span className="text-xs font-medium text-foreground">{book.title}</span>
                    <span className="text-xs text-muted-foreground">{book.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">아직 등록된 책이 없습니다</p>
            <p className="text-muted-foreground text-sm mt-2">첫 번째 책을 추가해보세요!</p>
            <Button
              className="mt-6"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              첫 책 추가하기
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
                <BookCard book={book} onUpdate={fetchBooks} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBookAdded={fetchBooks}
      />
    </div>
  )
}
