/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Settings, 
  Activity, 
  BookOpen, 
  Landmark, 
  ShieldCheck, 
  Info,
  Sparkles,
  BarChart2,
  CalendarCheck2,
  Mail,
  MessageCircle,
  X,
  AlertTriangle
} from 'lucide-react';

import { GamblerStatus, SalaryManagement, NoGamblingCalendar, DebtTracker, BehaviorChecklistState } from './types';
import StatusDiagnosis from './components/StatusDiagnosis';
import SolutionCenter from './components/SolutionCenter';
import StorySharing from './components/StorySharing';
import SupportGroups from './components/SupportGroups';

export default function App() {
  const [currentPage, setCurrentPage] = useState<number>(0); // 0: 치유 실천관, 1: 나의 이야기 사례, 2: 중독 지원 단체
  
  // Tab within Page 0 (치유 실천관) to split Diagnosis vs Action tools to save screen density
  const [p0ActiveTab, setP0ActiveTab] = useState<'diagnosis' | 'action'>('diagnosis');

  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(() => {
    return localStorage.getItem('dandan_disclaimer_agreed') !== 'true';
  });

  const navigationGuardRef = useRef<(() => boolean) | null>(null);

  const checkNavigationGuard = (): boolean => {
    if (navigationGuardRef.current) {
      return navigationGuardRef.current();
    }
    return true;
  };

  // ==========================================
  // Persistent States (localStorage synced)
  // ==========================================
  const [gamblerStatus, setGamblerStatus] = useState<GamblerStatus>(() => {
    const saved = localStorage.getItem('dandan_status');
    return saved ? JSON.parse(saved) : {
      job: '',
      debt: 0,
      monthlyIncome: 0,
      monthlyGamblingExpense: 0,
      lastBetDate: '',
      notes: '',
      hasEntered: false,
      relationship: [],
      hasCreditIssue: false,
      hasIllegalPrivateDebt: false,
      hasAcquaintanceDebt: false,
      hasCriminalRecord: false
    };
  });

  const [salaryMgmt, setSalaryMgmt] = useState<SalaryManagement>(() => {
    const saved = localStorage.getItem('dandan_salary');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.checkedDates) {
          parsed.checkedDates = [];
        }
        return parsed;
      } catch (e) {
        // Safe fallback
      }
    }
    return {
      isManagedByFamily: false,
      payoutPeriod: 'daily',
      payoutAmount: 0,
      payoutTime: '09:00',
      payoutDayOfWeek: 1,
      allowNotification: true,
      checkedDates: []
    };
  });

  const [noGamblingCalendar, setNoGamblingCalendar] = useState<NoGamblingCalendar>(() => {
    const saved = localStorage.getItem('dandan_calendar');
    return saved ? JSON.parse(saved) : {
      startDate: new Date().toISOString().split('T')[0],
      checkedDates: [],
      challenges: [
        { days: 10, title: '첫 번째 도약', rewardDescription: '🎉 무도박 10일 돌파! 당사자가 가장 좋아하는 삼겹살 외식을 선물하고 "수고 많았다"며 진심으로 꼭 안아주세요.', isRewarded: false },
        { days: 30, title: '신뢰의 디딤돌', rewardDescription: '👞 무도박 30일 달성! 오랜 시간 주위 유혹을 견딘 당사자에게 깔끔한 옷 한 벌이나 운동화를 상장과 함께 수여해 구원하세요.', isRewarded: false },
        { days: 100, title: '뇌 회로의 평화', rewardDescription: '🩹 무도박 100일 금단 돌파! 감동적인 손편지를 써주며, 당사자 이름으로 가족 통화 대안 계좌에 조그맣게 저축하기 시작하세요.', isRewarded: false },
        { days: 365, title: '기적의 단도박 1주년', rewardDescription: '🏆 영광스러운 단도박 1년 달성! 가족 연계 졸업 상장을 만들고 오랜 터널을 견딘 가족들과 온전한 치유의 기념 여행을 떠나보세요.', isRewarded: false }
      ]
    };
  });

  const [debtTracker, setDebtTracker] = useState<DebtTracker>(() => {
    const saved = localStorage.getItem('dandan_debt');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.gamblerTotalDebt === 'number') {
          if (parsed.acquaintanceDebts) {
            parsed.acquaintanceDebts = parsed.acquaintanceDebts.filter(
              (d: any) => d && d.name && d.name.trim() !== ''
            );
          }
          return parsed;
        }
      } catch (e) {
        // ignore and fallback
      }
    }
    return {
      gamblerTotalDebt: 0,
      gamblerMonthlyRepayment: 0,
      gamblerAlreadyPaid: 0,
      familyPaidTotal: 0,
      familyThisMonthDeducted: 0,
      familyLastMonthDeducted: 0,
      familyAccumulatedDeducted: 0,
      acquaintanceDebts: []
    };
  });

  const [behaviorChecklist, setBehaviorChecklist] = useState<BehaviorChecklistState>(() => {
    const saved = localStorage.getItem('dandan_behavior_checklist');
    return saved ? JSON.parse(saved) : { checkedIds: [], checkedDate: new Date().toISOString().split('T')[0] };
  });

  // ==========================================
  // Save effects
  // ==========================================
  useEffect(() => {
    localStorage.setItem('dandan_status', JSON.stringify(gamblerStatus));
  }, [gamblerStatus]);

  useEffect(() => {
    localStorage.setItem('dandan_salary', JSON.stringify(salaryMgmt));
  }, [salaryMgmt]);

  useEffect(() => {
    localStorage.setItem('dandan_calendar', JSON.stringify(noGamblingCalendar));
  }, [noGamblingCalendar]);

  useEffect(() => {
    localStorage.setItem('dandan_debt', JSON.stringify(debtTracker));
  }, [debtTracker]);

  useEffect(() => {
    localStorage.setItem('dandan_behavior_checklist', JSON.stringify(behaviorChecklist));
  }, [behaviorChecklist]);


  // Custom directional slide transition calculations
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const goToPage = (pageIdx: number) => {
    if (!checkNavigationGuard()) return;
    if (pageIdx > currentPage) {
      setSlideDirection('right');
    } else {
      setSlideDirection('left');
    }
    setCurrentPage(pageIdx);
  };

  const slideVariants = {
    enter: (direction: string) => ({
      x: direction === 'right' ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: 'easeOut' }
    },
    exit: (direction: string) => ({
      x: direction === 'right' ? -300 : 300,
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeIn' }
    })
  };

  return (
    <div className="min-h-screen bg-[#D6E8F5] text-black flex flex-col font-sans selection:bg-indigo-500/30 selection:text-black" id="app-root-container">
      
      {/* 🚀 Sleek Header / Navigation bar */}
      <header className="sticky top-0 z-50 bg-[#e09d63] border-b border-[#c88a55] shadow-md shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-black tracking-tight flex items-center gap-2 leading-none">
                리커버리 노트
                <span className="text-[9px] font-bold py-0.5 px-2 bg-emerald-950 text-emerald-100 rounded-full">공익 지원포털</span>
              </h1>
              <p className="text-[10px] text-slate-900 font-bold mt-1">도박 중독 극복을 위한 가족 동행 가이드</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/10 border border-slate-900/20 px-3 py-1 rounded-lg text-[10px] text-slate-900 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-900 animate-pulse" />
            자금 통제와 가족간 연대가 해답입니다
          </div>
        </div>

        {/* Horizontal Navigation Link Tabs */}
        <div className="border-t border-[#c88a55]/50 bg-white/40">
          <div className="max-w-4xl mx-auto px-4 flex justify-between">
            <button
              onClick={() => goToPage(0)}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition relative flex items-center justify-center gap-1.5 cursor-pointer ${
                currentPage === 0
                  ? 'border-slate-900 text-black font-extrabold'
                  : 'border-transparent text-slate-800 hover:text-black'
              }`}
              id="main-nav-btn-0"
            >
              <Activity className="w-4 h-4" />
              1. 치유 실천도구
            </button>
            <button
              onClick={() => goToPage(1)}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition relative flex items-center justify-center gap-1.5 cursor-pointer ${
                currentPage === 1
                  ? 'border-slate-900 text-black font-extrabold'
                  : 'border-transparent text-slate-800 hover:text-black'
              }`}
              id="main-nav-btn-1"
            >
              <BookOpen className="w-4 h-4" />
              2. 우리들의 치유기
            </button>
            <button
              onClick={() => goToPage(2)}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition relative flex items-center justify-center gap-1.5 cursor-pointer ${
                currentPage === 2
                  ? 'border-slate-900 text-black font-extrabold'
                  : 'border-transparent text-slate-800 hover:text-black'
              }`}
              id="main-nav-btn-2"
            >
              <Landmark className="w-4 h-4" />
              3. 도움받기
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 Horizontal Sliding Page Workspace (Scrollable Body) */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-4 overflow-hidden flex flex-col">
        <div className="relative flex-grow flex flex-col min-h-0">
          <AnimatePresence initial={false} custom={slideDirection} mode="wait">
            
            {/* PAGE 1: DIAGNOSIS & RECOVERY PRACTICAL CENTER */}
            {currentPage === 0 && (
              <motion.div
                key="page-diagnosis-center"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full flex-grow flex flex-col gap-5 min-h-0"
              >
                {/* Internal sub-selection inside Page 1 to split Diagnosis and Action Center cleanly */}
                <div className="bg-[#e09d63]/80 border border-[#c88a55] rounded-xl p-1.5 flex gap-1 shadow-inner shrink-0">
                  <button
                    onClick={() => {
                      if (!checkNavigationGuard()) return;
                      setP0ActiveTab('diagnosis');
                    }}
                    className={`flex-1 py-1.5 md:py-2.5 text-center text-[11px] sm:text-xs font-black rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer leading-tight ${
                      p0ActiveTab === 'diagnosis'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-transparent text-slate-900 hover:text-black'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex flex-col items-center">
                      <span className="whitespace-nowrap">[단계 1] 중독자 현재상황</span>
                      <span className="whitespace-nowrap">기록 및 진단</span>
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      if (!checkNavigationGuard()) return;
                      setP0ActiveTab('action');
                    }}
                    className={`flex-1 py-1.5 md:py-2.5 text-center text-[11px] sm:text-xs font-black rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer leading-tight ${
                      p0ActiveTab === 'action'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-transparent text-slate-900 hover:text-black'
                    }`}
                  >
                    <CalendarCheck2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex flex-col items-center">
                      <span className="whitespace-nowrap">[단계 2] 가족중심</span>
                      <span className="whitespace-nowrap">해결책&도구</span>
                    </span>
                  </button>
                </div>

                <div className="flex-grow min-h-0 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {p0ActiveTab === 'diagnosis' ? (
                      <motion.div
                        key="sub-diagnosis"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <StatusDiagnosis 
                          status={gamblerStatus} 
                          onUpdateStatus={setGamblerStatus} 
                          onNextStep={() => setP0ActiveTab('action')}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sub-solution"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SolutionCenter
                          salaryMgmt={salaryMgmt}
                          onUpdateSalaryMgmt={setSalaryMgmt}
                          calendar={noGamblingCalendar}
                          onUpdateCalendar={setNoGamblingCalendar}
                          debtTracker={debtTracker}
                          onUpdateDebtTracker={setDebtTracker}
                          behaviorChecklist={behaviorChecklist}
                          onUpdateBehaviorChecklist={setBehaviorChecklist}
                          onRegisterNavigationGuard={(guard) => { navigationGuardRef.current = guard; }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* PAGE 2: EXTEMPORANEOUS MEMOIRS & CHRONICLES */}
            {currentPage === 1 && (
              <motion.div
                key="page-developer-story"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full flex-grow flex flex-col min-h-0"
              >
                <div className="flex-grow min-h-0 overflow-y-auto">
                  <StorySharing />
                </div>
              </motion.div>
            )}

            {/* PAGE 3: SUPPORT GROUP REFERRALS & HELPLINE NODES */}
            {currentPage === 2 && (
              <motion.div
                key="page-support-agencies"
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full flex-grow flex flex-col min-h-0"
              >
                <div className="flex-grow min-h-0 overflow-y-auto">
                  <SupportGroups />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* 📌 Soft Informational Bottom Footer Banner */}
      <footer className="bg-[#e09d63]/20 border-t border-[#c88a55]/40 py-5 px-4 text-center text-[10px] text-slate-850 tracking-tight shrink-0 flex flex-col gap-2">
        <p className="font-black text-[#e06d33] flex items-center justify-center gap-1.5">
          ※ 본 어플리케이션은 전문적인 치료용 프로그램이 아니며, 참고용 정보 제공을 목적으로 합니다.
        </p>
        <p className="text-slate-950 font-extrabold text-[11px]">
          도박 문제의 실질적인 치료와 극복을 위해 반드시 전문 상담기관의 도움을 받으시기 바랍니다.
        </p>

        {/* Developer Contact Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-1 pt-2 border-t border-[#c88a55]/20 text-[10px] font-bold text-slate-900" id="global-dev-contact-footer">
          <a
            href="mailto:redrappstudio@gmail.com"
            className="flex items-center gap-1.5 hover:text-indigo-950 hover:underline transition duration-150"
            id="global-contact-email"
          >
            <Mail className="w-3.5 h-3.5 text-slate-800 shrink-0" />
            <span>redrappstudio@gmail.com</span>
          </a>
          <span className="hidden sm:inline text-slate-700/30">|</span>
          <a
            href="https://open.kakao.com/me/redras"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-indigo-950 hover:underline transition duration-150"
            id="global-contact-kakao"
          >
            <MessageCircle className="w-3.5 h-3.5 text-slate-800 shrink-0" />
            <span>open.kakao.com/me/redras</span>
          </a>
        </div>
      </footer>

      {/* 📌 앱 최초 시작 안내사항 팝업 (디스클레이머) */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" id="disclaimer-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-[#faf6f0] border-2 border-[#d8975e] p-5 sm:p-6 max-w-lg w-full rounded-2xl shadow-2xl relative text-black flex flex-col gap-4 overflow-hidden animate-none"
              id="disclaimer-modal-card"
            >
              {/* 우상단 x 버튼 */}
              <button
                type="button"
                onClick={() => setShowDisclaimer(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#d8975e]/10 text-slate-700 hover:text-black transition-colors cursor-pointer"
                id="btn-close-disclaimer-top"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 아이콘 + 타이틀 */}
              <div className="flex items-center gap-2 pt-1 pb-1.5 border-b border-[#d8975e]/25">
                <AlertTriangle className="w-5 h-5 text-[#e06d33]" />
                <h2 className="text-lg font-black text-slate-950 tracking-tight" id="disclaimer-title">안내사항</h2>
              </div>

              {/* 본문 설명 */}
              <div className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed space-y-3.5 my-1" id="disclaimer-body">
                <p className="p-2.5 bg-yellow-50 border-l-4 border-amber-600 rounded-r-lg text-amber-950 text-xs font-bold leading-relaxed">
                  본 앱은 전문적인 치료 또는 상담 서비스를 제공하는 프로그램이 아닙니다.
                </p>
                <p>
                  이 앱은 개발자가 직접 겪은 도박 중독 경험과 회복 과정을 바탕으로 제작되었으며, 도박 중독의 위험성과 그로 인해 발생하는 피해를 알리기 위한 목적으로 운영됩니다.
                </p>
                <p>
                  도박 중독으로 어려움을 겪고 있는 분들과 가족들이 관련 정보를 접하고, 도움을 받을 수 있는 기관을 찾는 데 작은 도움이 되기를 바랍니다.
                </p>
                <p className="text-slate-950 font-black text-xs">
                  현재 중독 문제로 어려움을 겪고 계신 경우에는 반드시 전문 상담기관 또는 의료기관의 도움을 받으시기 바랍니다.
                </p>
              </div>

              {/* 동의 버튼 */}
              <div className="pt-2 border-t border-[#d8975e]/20 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('dandan_disclaimer_agreed', 'true');
                    setShowDisclaimer(false);
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition duration-150 shadow-sm cursor-pointer hover:shadow active:scale-98"
                  id="btn-agree-and-start"
                >
                  동의하고 시작하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
