/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users2, Trash2, BookOpen, Plus, Send, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { devSubstories } from './SubstoriesData';

const SUPABASE_URL = "https://uyauptkvemjcecjvfnls.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YXVwdGt2ZW1qY2VjanZmbmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjM4ODYsImV4cCI6MjA5NzY5OTg4Nn0.41c3pPziE4mDktmHaKaQMuhyeM-7MGCLIrho3DdEWyg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function StorySharing() {
  const [activeDevId, setActiveDevId] = useState('start');
  const [viewMode, setViewMode] = useState<'memoir' | 'board'>('memoir');
  const [showAddForm, setShowAddForm] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 폼 입력 상태
  const [author, setAuthor] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 수파베이스 글 목록 가져오기
  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false }); // ID나 created_at 내림차순

      if (error) {
        console.error('Error fetching stories:', error.message);
      } else if (data) {
        setStories(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // 글 작성하기
  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('응원 메시지 내용을 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      alert('삭제 시 사용할 비밀번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{ 
          author: author.trim(), 
          content: content.trim(), 
          password: password.trim() 
        }]);

      if (error) {
        alert('작성 실패: ' + error.message);
      } else {
        setAuthor('');
        setPassword('');
        setContent('');
        setShowAddForm(false);
        fetchStories();
      }
    } catch (err: any) {
      alert('오류 발생: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 글 삭제하기
  const handleDeleteStory = async (id: number, dbPassword?: string) => {
    const inputPassword = window.prompt('작성을 취소하거나 삭제하시려면 설정한 비밀번호를 입력해주세요:');
    if (inputPassword === null) return; // 취소

    if (dbPassword && inputPassword !== dbPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (window.confirm('정말로 이 응원의 글을 삭제하시겠습니까?')) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', id);

        if (error) {
          alert('삭제 실패: ' + error.message);
        } else {
          fetchStories();
        }
      } catch (err: any) {
        alert('삭제 처리 에러: ' + err.message);
      }
    }
  };

  const currentDevStory = devSubstories.find(s => s.id === activeDevId) || devSubstories[0];

  return (
    <div className="bg-[#f0ad73] border border-[#d8975e] rounded-2xl p-4 sm:p-5 shadow-lg text-black space-y-4" id="story-sharing-root">
      {/* 🌟 헤더 섹션 */}
      <div className="mb-4" id="story-header-container">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-[#e09d63] text-black border border-[#c88a55]/40 text-[10px] font-black rounded-full uppercase tracking-wider select-none">
            MEMOIRS & RESOLVES
          </span>
        </div>
        <h3 className="text-xl font-bold text-black flex items-center gap-2.5 mb-2" id="story-header-title">
          <Users2 className="w-5 h-5 text-indigo-950 animate-pulse shrink-0" />
          나의 이야기 사례 및 다짐
        </h3>
        <p className="text-sm text-slate-900 font-bold leading-relaxed" id="story-header-desc">
          도박이라는 깊은 수렁에서 회복하고 치유하기까지의 10년의 기록을 단계별로 공유합니다. 
          따뜻한 격려와 강한 극복의 다짐을 나누어주세요.
        </p>
      </div>

      {/* 🧭 서브 탭 탐색 단추 */}
      <div className="bg-[#e09d63]/80 border border-[#c88a55] rounded-xl p-1.5 flex gap-1 shadow-inner shrink-0" id="story-view-mode-tabs">
        <button
          type="button"
          onClick={() => setViewMode('memoir')}
          className={`flex-1 py-1.5 md:py-2.5 text-center text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer leading-tight ${
            viewMode === 'memoir'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-transparent text-slate-900 hover:text-black font-black'
          }`}
          id="btn-subtab-memoir"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">10년의 치유 수기</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('board')}
          className={`flex-1 py-1.5 md:py-2.5 text-center text-xs font-black rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer leading-tight ${
            viewMode === 'board'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-transparent text-slate-900 hover:text-black font-black'
          }`}
          id="btn-subtab-board"
        >
          <Users2 className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">동행의 다짐 보드</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'memoir' ? (
          <motion.div
            key="memoir-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* 🧭 개발자 수기 본문 카드 레이아웃 */}
            <div className="bg-white/75 border border-[#d8975e]/30 rounded-2xl overflow-hidden shadow-sm text-black flex flex-col" id="memoir-cabinet-card">
              {/* 아주 유니크하고 직관적인 탭 메이커 */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#d8975e]/30 bg-[#e09d63]/20" id="memoir-tabs-strip">
                {devSubstories.map((story) => {
                  const isActive = story.id === activeDevId;
                  return (
                    <button
                      type="button"
                      key={story.id}
                      onClick={() => setActiveDevId(story.id)}
                      className={`py-3 px-2 flex flex-col items-center justify-center gap-1 transition-all text-center select-none cursor-pointer focus:outline-none border-r border-[#d8975e]/20 last:border-r-0 ${
                        isActive 
                          ? 'bg-white text-slate-950 font-black relative border-b border-transparent' 
                          : 'text-slate-800 hover:text-slate-950 hover:bg-white/30 font-bold'
                      }`}
                      id={`tab-btn-${story.id}`}
                    >
                      {/* 탭 활성화 시 강조하는 하단 라인 */}
                      {story.icon}
                      <span className="text-[11px] xs:text-xs tracking-tight">{story.title}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabUnderline" 
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-950"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 📖 선택된 수기 내용 */}
              <div className="p-4 sm:p-6 space-y-5" id="memoir-narrative-box">
                <div className="space-y-1.5 border-b border-amber-600/10 pb-4" id="memoir-narrative-header">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-600">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>실제 극복 수기 기록</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-955 tracking-tight">
                    {currentDevStory.title}: <span className="text-slate-800 font-bold">{currentDevStory.subtitle}</span>
                  </h4>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-900 font-bold leading-relaxed font-sans" id="memoir-paragraphs-list">
                  {currentDevStory.paragraphs.map((para, idx) => {
                    const parts = para.split(/(\([^)]+\))/g);
                    const isBgHighlighted = para.includes("부모님께 모든 경제권을 넘겼습니다.");

                    if (isBgHighlighted) {
                      return (
                        <div key={idx} className="my-4 bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-xl text-emerald-950 shadow-sm leading-relaxed text-xs sm:text-sm">
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-905 text-[10px] font-black rounded mb-2 uppercase tracking-wider select-none">
                            ✨ 핵심 구조적 장치 (경제권 이양)
                          </span>
                          <p className="indent-0 whitespace-pre-wrap text-[#064e3b] leading-relaxed font-black">
                            {parts.map((part, index) => {
                              if (part.startsWith('(') && part.endsWith(')')) {
                                const cleanText = part.slice(1, -1);
                                return (
                                  <span key={index} className="text-emerald-700 font-black">
                                    {cleanText}
                                  </span>
                                );
                              }
                              return part;
                            })}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <p key={idx} className="indent-0 whitespace-pre-wrap leading-relaxed text-slate-900 select-text">
                        {parts.map((part, index) => {
                          if (part.startsWith('(') && part.endsWith(')')) {
                            const cleanText = part.slice(1, -1);
                            return (
                              <span key={index} className="text-indigo-950 font-extrabold px-0.5 select-all inline underline decoration-indigo-350">
                                {cleanText}
                              </span>
                            );
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="board-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 💬 극복 동행 & 한줄 다짐 칠판 */}
            <div className="space-y-4" id="story-board-section">
              <div className="flex items-center justify-between border-b border-amber-600/10 pb-3" id="board-header">
                <div className="flex items-center gap-2">
                  <div className="bg-white/40 p-2 rounded-xl border border-white/20">
                    <Users2 className="w-4 h-4 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-955 text-sm">동행을 위한 응원의 글과 결의</h4>
                    <p className="text-slate-900 text-[10px] font-bold">함께 극복하고 이겨내기 위한 따뜻한 다짐 보드입니다.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-950 text-xs font-black rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                  id="toggle-add-form-btn"
                >
                  {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{showAddForm ? '접기' : '동참하기'}</span>
                </button>
              </div>

              {/* ✍️ 글쓰기 양식창 */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.form 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleAddStory} 
                    className="bg-white/85 border border-slate-350 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm text-black"
                    id="story-add-form"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-700">작성자(닉네임)</label>
                        <input
                          type="text"
                          maxLength={15}
                          placeholder="예: 극복의새아침"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#d8975e] outline-none transition-colors text-black"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-700">삭제 비밀번호</label>
                        <input
                          type="password"
                          maxLength={10}
                          placeholder="숫자나 영문 4자리 이상"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#d8975e] outline-none transition-colors text-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700">다짐 및 격려 내용</label>
                      <textarea
                        rows={3}
                        maxLength={500}
                        placeholder="도박 중독 없는 빛나는 삶을 위한 의지의 글이나 응원 한마디를 적어주세요. (최대 500자)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs md:text-sm font-bold focus:border-[#d8975e] outline-none transition-colors resize-none text-black"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1 font-bold">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-lg transition-all cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-4 py-2 bg-slate-900 text-white hover:bg-slate-950 disabled:bg-slate-400 text-xs font-black rounded-lg transition-all shadow active:scale-95 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? '진행 중...' : '다짐 등록'}</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* 📋 동행의 흔적들 목록 피드 */}
              <div className="space-y-3" id="stories-feed-container">
                {isLoading ? (
                  <div className="text-center py-8" id="feed-loading-indicator">
                    <div className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[11px] text-slate-900 font-bold mt-2">다짐들을 불러오는 중...</p>
                  </div>
                ) : stories.length === 0 ? (
                  <div className="bg-white/45 border border-dashed border-slate-300 rounded-2xl py-10 px-5 text-center text-slate-800 space-y-1.5" id="feed-empty-box">
                    <p className="text-xs font-black text-slate-955">아직 등록된 다짐이 없습니다.</p>
                    <p className="text-[10px] font-bold text-slate-900">첫 번째로 동참하여 따뜻한 한 마디를 건네어보세요!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3" id="feed-items-grid">
                    {stories.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white/80 border border-slate-250 hover:border-[#d8975e] rounded-xl p-3.5 flex gap-3 transition-colors duration-200 group relative animate-fadeIn"
                        id={`story-card-${item.id}`}
                      >
                        <div className="flex-grow space-y-1" id={`story-body-${item.id}`}>
                          <div className="flex items-center gap-2" id={`story-meta-${item.id}`}>
                            <span className="text-xs font-black text-slate-950">
                              {item.author}
                            </span>
                            <span className="text-[10px] text-slate-700 font-mono font-bold">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : `#${item.id}`}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-sans font-semibold whitespace-pre-wrap break-words" id={`story-content-${item.id}`}>
                            {item.content}
                          </p>
                        </div>

                        <div className="flex items-start" id={`story-action-${item.id}`}>
                          <button
                            type="button"
                            onClick={() => handleDeleteStory(item.id, item.password)}
                            className="p-1 px-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer"
                            title="삭제하기"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}