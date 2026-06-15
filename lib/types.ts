export interface Reply {
  id: number
  thread_id: number
  speaker: string
  content: string
  likes: number
  created_at: string
}

export interface Thread {
  id: number
  book_id: number
  speaker: string
  content: string
  likes: number
  created_at: string
  replies?: Reply[]
}

export interface Book {
  id: number
  title: string
  author: string
  date: string
  image: string
  impressions: string
  created_at: string
  threads?: Thread[]
}

export interface BookImpression {
  id: number
  book_id: number
  speaker: string
  content: string
  created_at: string
}

export interface Speaker {
  id: number
  name: string
  created_at: string
}
