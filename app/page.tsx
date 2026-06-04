"use client";

import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Edit2, Plus, X, ChevronRight, Calendar } from 'lucide-react';

export default function BookClub() {
  // --- 데이터 상태 관리 ---
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isAddingBook, setIsAddingBook] = useState(false);

  // --- 폼 상태 관리 ---
  const [bookForm, setBookForm] = useState({ title: '', author: '', cover: '', date: new Date().toISOString().split('T')[0] });
  const [reviewForm, setReviewForm] = useState({ userName: '', content: '', rating: 5 });
  const [quoteForm, setQuoteForm] = useState({ userName: '', text: '' });
  const [replyText, setReplyText] = useState({});

  const selectedBook = books.find(b => b.id === selectedBookId);

  // --- 책 관련 함수 ---
  const addBook = () => {
    if (!bookForm.title || !bookForm.author) return alert("제목과 저자를 입력해주세요.");
    const newBook = { ...bookForm, id: Date.now(), reviews: [], quotes: [] };
    setBooks([...books, newBook]);
    setBookForm({ title: '', author: '', cover: '', date: new Date().toISOString().split('T')[0] });
    setIsAddingBook(false);
  };

  const deleteBook = (id) => {
    setBooks(books.filter(b => b.id !== id));
    if (selectedBookId === id) setSelectedBookId(null);
  };

  // --- 감상평/구절 관련 함수 ---
  const addReview = () => {
    if (!reviewForm.userName || !reviewForm.content) return;
    const newReview = { ...reviewForm, id: Date.now(), replies: [], date: new Date().toLocaleDateString() };
    const updatedBooks = books.map(b => 
      b.id === selectedBookId ? { ...b, reviews: [...b.reviews, newReview] } : b
    );
    setBooks(updatedBooks);
    setReviewForm({ userName: '', content: '', rating: 5 });
  };

  const addQuote = () => {
    if (!quoteForm.userName || !quoteForm.text) return;
    const newQuote = { ...quoteForm, id: Date.now(), date: new Date().toLocaleDateString() };
    const updatedBooks = books.map(b => 
      b.id === selectedBookId ? { ...b, quotes: [...b.quotes, newQuote] } : b
    );
    setBooks(updatedBooks);
    setQuoteForm({ userName: '', text: '' });
  };

  const addReply = (reviewId) => {
    if (!replyText[reviewId]) return;
    const updatedBooks = books.map(b => {
      if (b.id === selectedBookId) {
        return {
          ...b,
          reviews: b.reviews.map(r => 
            r.id === reviewId ? { ...r, replies: [...r.replies, { text: replyText[reviewId], date: '방금 전' }] } : r
          )
        };
      }
      return b;
    });
    setBooks(updatedBooks);
    setReplyText({ ...replyText, [reviewId]: '' });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans antialiased pb-20">
      {/* Header */}
      <header className="max-w-4xl mx-auto pt-16 px-6 mb-12 border-b border-black pb-4">
        <h1 className="text-4xl font-black tracking-tighter italic">캡숑 독모</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        {/* Book List Section */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-xl font-bold tracking-tight">읽고 있는 책</h2>
            <button 
              onClick={() => setIsAddingBook(true)}
              className="flex items-center gap-1 text-sm border border-black px-3 py-1 hover:bg-black hover:text-white transition-all"
            >
              <Plus size={16} /> 책 추가하기
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {books.map(book => (
              <div key={book.id} className="group cursor-pointer" onClick={() => setSelectedBookId(book.id)}>
                <div className="aspect-[2/3] bg-gray-100 mb-3 overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                </div>
                <h3 className="font-bold text-sm leading-tight mb-1">{book.title}</h3>
                <p className="text-xs text-slate-500">{book.author}</p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar size={10} /> {book.date}
                </p>
                <button onClick={(e) => { e.stopPropagation(); deleteBook(book.id); }} className="text-[10px] text-red-400 mt-2 opacity-0 group-hover:opacity-100">삭제</button>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Book Detail Section */}
        {selectedBook ? (
          <div className="border-t-2 border-black pt-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-10 mb-16">
              <div className="w-40 flex-shrink-0">
                <img src={selectedBook.cover} className="w-full shadow-lg border" />
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-bold mb-2">{selectedBook.title}</h2>
                <p className="text-lg text-slate-600 mb-4">{selectedBook.author}</p>
                <div className="inline-block px-3 py-1 bg-slate-100 text-xs font-medium">모임일: {selectedBook.date}</div>
              </div>
            </div>

            {/* 별점 및 감상평 작성 */}
            <div className="grid md:grid-cols-2 gap-12">
              <section>
                <h3 className="text-lg font-bold mb-6 border-b border-slate-200 pb-2">감상평 남기기</h3>
                <div className="space-y-4 bg-white p-6 border border-slate-200 shadow-sm">
                  <div className="flex gap-2">
                    <input 
                      placeholder="이름" 
                      className="border-b border-slate-300 focus:border-black outline-none text-sm py-1 w-20"
                      value={reviewForm.userName}
                      onChange={(e) => setReviewForm({...reviewForm, userName: e.target.value})}
                    />
                    <div className="flex items-center gap-1 ml-auto">
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star} 
                          size={14} 
                          className={star <= reviewForm.rating ? "fill-black" : "text-slate-300 cursor-pointer"}
                          onClick={() => setReviewForm({...reviewForm, rating: star})}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea 
                    placeholder="책을 읽고 어떤 생각을 하셨나요?" 
                    className="w-full h-24 border border-slate-200 p-3 text-sm focus:border-black outline-none"
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
                  />
                  <button onClick={addReview} className="w-full bg-black text-white py-2 text-sm font-bold">등록하기</button>
                </div>

                <div className="mt-8 space-y-6">
                  {selectedBook.reviews.map(rev => (
                    <div key={rev.id} className="border-b border-slate-100 pb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm">{rev.userName}</span>
                        <div className="flex gap-0.5">
                          {Array(rev.rating).fill(0).map((_, i) => <Star key={i} size={10} className="fill-black" />)}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4">{rev.content}</p>
                      
                      {/* 답글 피드 */}
                      <div className="ml-4 pl-4 border-l-2 border-slate-100 space-y-3">
                        {rev.replies.map((reply, idx) => (
                          <div key={idx} className="text-xs bg-slate-50 p-2">
                            <span className="font-semibold mr-2">익명</span>
                            {reply.text}
                          </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <input 
                            className="flex-grow text-xs border-b outline-none focus:border-black py-1" 
                            placeholder="댓글 달기..." 
                            value={replyText[rev.id] || ''}
                            onChange={(e) => setReplyText({...replyText, [rev.id]: e.target.value})}
                          />
                          <button onClick={() => addReply(rev.id)} className="text-[10px] font-bold">확인</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 인상깊은 구절 섹션 */}
              <section>
                <h3 className="text-lg font-bold mb-6 border-b border-slate-200 pb-2">인상 깊은 구절</h3>
                <div className="space-y-4 bg-[#f9f9f9] p-6 border border-slate-200 mb-8">
                  <input 
                    placeholder="이름" 
                    className="bg-transparent border-b border-slate-300 focus:border-black outline-none text-sm py-1 w-20"
                    value={quoteForm.userName}
                    onChange={(e) => setQuoteForm({...quoteForm, userName: e.target.value})}
                  />
                  <textarea 
                    placeholder="가장 마음에 남았던 문장을 적어주세요." 
                    className="w-full h-20 bg-transparent border border-slate-200 p-3 text-sm focus:border-black outline-none italic"
                    value={quoteForm.text}
                    onChange={(e) => setQuoteForm({...quoteForm, text: e.target.value})}
                  />
                  <button onClick={addQuote} className="w-full border border-black py-2 text-sm font-bold hover:bg-black hover:text-white transition-colors">구절 저장</button>
                </div>

                <div className="space-y-6">
                  {selectedBook.quotes.map(q => (
                    <div key={q.id} className="relative p-6 border-l-4 border-black bg-white shadow-sm">
                      <p className="text-sm italic leading-relaxed mb-3">"{q.text}"</p>
                      <p className="text-xs text-slate-500 text-right">— {q.userName}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 border-t border-slate-100">
            책을 클릭하여 대화를 시작해보세요.
          </div>
        )}
      </main>

      {/* 책 추가 모달 */}
      {isAddingBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold">새로운 책 등록</h3>
              <button onClick={() => setIsAddingBook(false)}><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">제목</label>
                <input className="w-full border p-2 text-sm" onChange={e => setBookForm({...bookForm, title: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">저자</label>
                <input className="w-full border p-2 text-sm" onChange={e => setBookForm({...bookForm, author: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">커버 이미지 URL</label>
                <input className="w-full border p-2 text-sm" placeholder="https://..." onChange={e => setBookForm({...bookForm, cover: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">모임 날짜</label>
                <input type="date" className="w-full border p-2 text-sm" value={bookForm.date} onChange={e => setBookForm({...bookForm, date: e.target.value})} />
              </div>
              <button onClick={addBook} className="w-full bg-black text-white py-3 mt-4 font-bold">책장에 추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
