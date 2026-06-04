"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Upload, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
  onBookAdded: () => void
}

export function AddBookModal({ isOpen, onClose, onBookAdded }: AddBookModalProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !date.trim()) return

    setIsSubmitting(true)
    
    const formattedDate = new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\. /g, ".").replace(/\.$/, "")

    const { error } = await supabase.from("books").insert({
      title: title.trim(),
      author: author.trim() || "작자미상",
      date: formattedDate,
      image: imagePreview || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop",
      impressions: "",
    })

    if (!error) {
      setTitle("")
      setAuthor("")
      setDate(new Date().toISOString().split("T")[0])
      setImagePreview(null)
      onBookAdded()
      onClose()
    }
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setTitle("")
    setAuthor("")
    setDate(new Date().toISOString().split("T")[0])
    setImagePreview(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-background rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">새 책 추가</h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    책 제목 *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 데미안"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    저자
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="예: 헤르만 헤세"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    모임 날짜 *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Upload className="inline h-4 w-4 mr-1" />
                    표지 이미지
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="relative aspect-[3/4] max-w-[150px] mx-auto rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="py-6">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">클릭하여 이미지 업로드</p>
                        <p className="text-xs text-muted-foreground mt-1">선택하지 않으면 기본 이미지가 사용됩니다</p>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setImagePreview(null)
                      }}
                      className="mt-2 text-sm text-muted-foreground hover:text-destructive"
                    >
                      이미지 제거
                    </button>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClose}
                  >
                    취소
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title.trim() || !date.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    추가하기
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
