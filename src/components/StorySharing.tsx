/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users2, Trash2, BookOpen, Plus, Send, X, AlertTriangle, Clock, ArrowRight, HelpCircle, Bookmark, CheckCircle2, Award } from 'lucide-react';
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

  // 폼 입력 상태 - 수파베이스 실제 컬럼명과 완벽한 맵핑
  const [relation, setRelation] = useState('');
  const [age, setAge] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 수파베이스 글 목록 가져오기
  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false });

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
    if (!relation.trim()) {
      alert('중독자와의 관계를 입력해주세요.');
      return;
    }
    if (!age.trim()) {
      alert('중독 당시 나이(또는 현재 나이대)를 입력해주세요.');
      return;
    }
    if (!title.trim()) {
      alert('한 줄 극복 요약(제목)을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('사연 및 다짐 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{ 
          relation: relation.trim(),
          age: age.trim(),
          title: title.trim(),
          content: content.trim()
        }]);

      if (error) {
        alert('작성 실패: ' + error.message);
      } else {
        setRelation('');
        setAge('');
        setTitle('');
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

  // 글 삭제하기 (취소/삭제 패스워드 없는 간결한 confirm방식 복구)
  const handleDeleteStory = async (id: number) => {
    if (window.confirm('소중하게 남겨주신 이 치유기 사연 글을 정말로 삭제하시겠습니까?')) {
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
        alert('삭제 오류: ' + err.message);
      }
    }
  };

  const currentDevStory = devSubstories.find(s => s.id === activeDevId) || devSubstories[0];

  return (
    <div className="bg-[#f0ad73] border border-[#d8975e] rounded-2xl p-4 sm:p-5 shadow-lg text-black space-y-4" id="story-sharing-root">
      
      {/* 헤더 섹션 - 심플하고 세련된 치유기 타이틀 */}
      <div className="text-center space-y-1 pb-2 border-b border-[#d8975e]/30" id="story-header-container">
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight" id="story-header-title">
          10년의 치유 기록 & 극복 수기
        </h1>
        <p className="text-slate-900 text-xs sm:text-sm font-semibold max-w-xl mx-auto leading-relaxed" id="story-header-desc">
          도박이라는 고통 속에서 실제 부모님께 모든 경제권을 넘기고 회복하기까지의 10년 극복 수기입니다.
          각 회복 단계를 선택하여 읽고, 소통판에 다짐을 남기며 서로 격려해 주세요.
        </p>
      </div>

      {/* 대형 메인 탭 탐색기 */}
      <div className="flex flex-row flex-nowrap bg-[#e59f63]/40 border border-[#d8975e]/30 p-1 rounded-xl max-w-sm mx-auto shadow-inner gap-1" id="story-view-mode-tabs">
        <button
          type="button"
          onClick={() => setViewMode('memoir')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            viewMode === 'memoir'
              ? 'bg-slate-900 text-white font-extrabold shadow-sm'
              : 'text-slate-800 hover:text-black hover:bg-[#e59f63]/30 font-semibold'
          }`}
          id="btn-subtab-memoir"
        >
          <span>10년의 치유 수기</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('board')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            viewMode === 'board'
              ? 'bg-slate-900 text-white font-extrabold shadow-sm'
              : 'text-slate-800 hover:text-black hover:bg-[#e59f63]/30 font-semibold'
          }`}
          id="btn-subtab-board"
        >
          <span>우리들의 치유 게시판</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'memoir' ? (
          <motion.div
            key="memoir-section"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* 챕터 목록과 내용 영역을 Split Grid로 배치 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" id="memoir-split-panel-grid">
              
              {/* [좌측 칼럼/상단 섹션] Stage Tracker Buttons Flow */}
              <div className="lg:col-span-4 flex flex-col gap-2" id="memoir-cabinet-stages">
                <div className="flex items-center justify-between px-1" id="stages-cabinet-info">
                  <span className="text-xs font-bold text-slate-850 select-none">치유 단계를 직접 선택해 보세요</span>
                </div>

                {/* 4단계가 모바일에서 가로 한줄로 전부 깔끔하게 보이도록 grid-cols-4 배치 */}
                <div className="grid grid-cols-4 lg:flex lg:flex-col gap-1.5 lg:gap-2 w-full" id="memoir-tabs-stepper-list">
                  {devSubstories.map((story) => {
                    const isActive = story.id === activeDevId;
                    const cleanTitle = story.title.replace(/^\d+\.\s*/, '');
                    return (
                      <motion.button
                        type="button"
                        key={story.id}
                        onClick={() => setActiveDevId(story.id)}
                        whileTap={{ scale: 0.98 }}
                        className={`py-2 px-1 lg:py-3 lg:px-4 rounded-xl text-center lg:text-left transition-all border cursor-pointer focus:outline-none select-none flex items-center justify-center lg:justify-start ${
                          isActive 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-black' 
                            : 'bg-white/45 text-slate-800 border-[#d8975e]/30 hover:bg-white/70 font-semibold'
                        }`}
                        id={`tab-btn-${story.id}`}
                      >
                        <span className="text-xs sm:text-sm font-black tracking-tight">
                          {cleanTitle}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* [우측 칼럼/하단 섹션] E-Book형 치유기 뷰어 */}
              <div className="lg:col-span-8 bg-white/70 border border-[#d8975e]/35 rounded-xl shadow-sm overflow-hidden" id="memoir-cabinet-reader">
                
                {/* 내용 본체 레이아웃 */}
                <div className="p-4 sm:p-5 space-y-4" id="memoir-narrative-box">
                  
                  {/* 대형 챕터 타이틀 */}
                  <div className="space-y-1 border-b border-[#d8975e]/30 pb-2.5" id="memoir-narrative-header">
                    <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-tight">
                      {currentDevStory.title.replace(/^\d+\.\s*/, '')}
                    </h2>
                  </div>

                  {/* 정돈되고 가독성이 극대화된 실제 본문 단락들 */}
                  <div className="space-y-3 px-0.5 text-xs sm:text-sm font-semibold text-slate-950 leading-relaxed font-sans" id="memoir-paragraphs-list">
                    {currentDevStory.paragraphs.map((para, idx) => {
                      const parts = para.split(/(\([^)]+\))/g);
                      const isBgHighlighted = para.includes("부모님께 모든 경제권을 넘겼습니다.");

                      if (isBgHighlighted) {
                        return (
                          <div key={idx} className="my-3 mx-0.5 bg-white/80 border-l-4 border-amber-600 p-3.5 rounded-r-xl text-slate-950 shadow-sm leading-relaxed text-xs sm:text-sm">
                            <span className="inline-block px-1.5 py-0.5 bg-amber-600 text-white text-[9px] font-black rounded mb-2 select-none">
                              핵심 안전장치 연대 행동
                            </span>
                            <p className="whitespace-pre-wrap leading-relaxed font-extrabold text-slate-950">
                              {parts.map((part, index) => {
                                if (part.startsWith('(') && part.endsWith(')')) {
                                  const cleanText = part.slice(1, -1);
                                  return (
                                    <span key={index} className="text-red-700 font-extrabold underline decoration-2 decoration-red-700">
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
                        <p key={idx} className="whitespace-pre-wrap leading-relaxed text-slate-850 select-text font-normal text-xs sm:text-sm">
                          {parts.map((part, index) => {
                            if (part.startsWith('(') && part.endsWith(')')) {
                              const cleanText = part.slice(1, -1);
                              return (
                                <span key={index} className="text-slate-950 font-extrabold bg-[#fad4a6]/60 px-1 rounded border border-[#d8975e]/20">
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

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="board-section"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* 극복 동행 & 한줄 다짐 칠판 */}
            <div className="bg-[#fad4a6]/40 border border-[#d8975e] rounded-xl p-4 sm:p-5 space-y-4 shadow-sm" id="story-board-section">
              
              <div className="flex items-center justify-between border-b border-[#d8975e]/20 pb-3" id="board-header">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                    <Users2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-950 text-xs sm:text-sm">우리들의 치유 소통 게시판</h3>
                    <p className="text-slate-800 text-[10px] font-bold">중독자와의 관계와 당시 힘겨웠던 나이를 텍스트로 자유롭게 나누는 익명 게시판입니다.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-black rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                  id="toggle-add-form-btn"
                >
                  {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{showAddForm ? '접기' : '다짐 작성'}</span>
                </button>
              </div>

              {/* ✍️ 글쓰기 양식창 */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.form 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onSubmit={handleAddStory} 
                    className="bg-white/90 border border-[#d8975e] rounded-xl p-4 space-y-3.5 shadow-sm text-black"
                    id="story-add-form"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* 중독자와의 관계 */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                          <span>중독자와의 관계</span>
                          <span className="text-red-500 font-extrabold">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={30}
                          placeholder="예: 아내, 남편, 본인, 아들, 형 등"
                          value={relation}
                          onChange={(e) => setRelation(e.target.value)}
                          className="w-full bg-white/70 border border-[#d8975e] rounded-xl px-3 py-2 text-xs font-semibold focus:border-slate-850 focus:bg-white outline-none transition-colors text-black placeholder:text-slate-500"
                        />
                      </div>

                      {/* 중독자 당시 나이 */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                          <span>당시 나이 (또는 현재 나이대)</span>
                          <span className="text-red-500 font-extrabold">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={30}
                          placeholder="예: 30대, 28세, 40대 초반 등"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full bg-white/70 border border-[#d8975e] rounded-xl px-3 py-2 text-xs font-semibold focus:border-slate-850 focus:bg-white outline-none transition-colors text-black placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* 수기 요약 제목 */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        <span>한 줄 극복 요약 (제목)</span>
                        <span className="text-red-500 font-extrabold">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={50}
                        placeholder="예: 절망 속에서 경제권을 전면 이양하며 극복하기까지"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white/70 border border-[#d8975e] rounded-xl px-3 py-2 text-xs font-semibold focus:border-slate-850 focus:bg-white outline-none transition-colors text-black placeholder:text-slate-500"
                      />
                    </div>

                    {/* 500자 내외 사연 및 다짐 */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        <span>500자 내외 사연 및 다짐</span>
                        <span className="text-red-500 font-extrabold">*</span>
                      </label>
                      <textarea
                        rows={4}
                        maxLength={600}
                        placeholder="당시의 어려웠던 경위, 극복 계기, 또는 미래를 위한 진정성 있는 다짐을 적어주세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-white/70 border border-[#d8975e] rounded-xl p-3 text-xs sm:text-sm font-semibold focus:border-slate-850 focus:bg-white outline-none transition-colors resize-none text-black placeholder:text-slate-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5 font-bold pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3.5 py-1.5 border border-[#d8975e] hover:bg-slate-50 text-slate-700 text-xs font-black rounded-lg transition-all cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 px-4.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 text-xs font-black rounded-lg transition-all shadow active:scale-95 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? '진행 중...' : '작성 등록 완료'}</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* 📋 동행의 흔적들 목록 피드 */}
              <div className="space-y-3.5" id="stories-feed-container">
                {isLoading ? (
                  <div className="text-center py-8 bg-white/40 rounded-xl border border-[#d8975e]/50" id="feed-loading-indicator">
                    <div className="inline-block w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-900 mt-2 font-black">치유 다짐들을 연동 중입니다...</p>
                  </div>
                ) : stories.length === 0 ? (
                  <div className="bg-white/40 border border-[#d8975e]/40 border-dashed rounded-xl py-10 px-5 text-center text-slate-900 space-y-2" id="feed-empty-box">
                    <AlertTriangle className="w-6 h-6 text-slate-800 mx-auto" />
                    <p className="text-xs font-black">아직 교류된 사연이 없습니다.</p>
                    <p className="text-[11px] font-bold">첫 번째로 따뜻한 위로나 극복 의지를 표현해 주세요!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3" id="feed-items-grid">
                    {stories.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white/80 border border-[#d8975e]/60 rounded-xl p-3.5 sm:p-4 flex gap-3 shadow-xs transition-colors hover:bg-white"
                        id={`story-card-${item.id}`}
                      >
                        <div className="flex-grow space-y-1.5" id={`story-body-${item.id}`}>
                          {/* 메타 배지 */}
                          <div className="flex flex-wrap items-center gap-2 text-[10px]" id={`story-meta-row-${item.id}`}>
                            <span className="px-2 py-0.5 bg-[#fef5ef] text-[#e86f25] border border-[#e86f25]/30 font-black rounded-lg">
                              관계: {item.relation || '미지정'}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-350 font-black rounded-lg">
                              나이대: {item.age || '미지정'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold ml-auto">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : `#${item.id}`}
                            </span>
                          </div>

                          {/* 제목 */}
                          <div className="border-b border-dashed border-slate-200 pb-1 pt-0.5">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-950 leading-snug">
                              {item.title}
                            </h4>
                          </div>

                          {/* 본문 사연 */}
                          <p className="text-xs sm:text-sm text-slate-850 leading-relaxed font-semibold whitespace-pre-wrap break-words border-t-0" id={`story-content-${item.id}`}>
                            {item.content}
                          </p>
                        </div>

                        {/* 삭제 액션 */}
                        <div className="flex items-start pt-0.5" id={`story-action-${item.id}`}>
                          <button
                            type="button"
                            onClick={() => handleDeleteStory(item.id)}
                            className="p-1 px-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100 cursor-pointer"
                            title="삭제"
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