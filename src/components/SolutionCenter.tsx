/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SalaryManagement, NoGamblingCalendar, DebtTracker, BehaviorChecklistState, DayChallenge, RepaymentLog } from '../types';
import { 
  Calendar as CalendarIcon, 
  Wallet, 
  TrendingDown, 
  BookOpen, 
  Plus, 
  Check, 
  Volume2, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ShieldAlert,
  Coins,
  AlertCircle,
  Sparkles,
  Heart,
  Trash,
  X,
  ClipboardCheck
} from 'lucide-react';

const getTodayYYYYMMDD = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface SolutionCenterProps {
  salaryMgmt: SalaryManagement;
  onUpdateSalaryMgmt: (data: SalaryManagement) => void;
  calendar: NoGamblingCalendar;
  onUpdateCalendar: (data: NoGamblingCalendar) => void;
  debtTracker: DebtTracker;
  onUpdateDebtTracker: (data: DebtTracker) => void;
  behaviorChecklist: BehaviorChecklistState;
  onUpdateBehaviorChecklist: React.Dispatch<React.SetStateAction<BehaviorChecklistState>>;
  onRegisterNavigationGuard?: (guard: (() => boolean) | null) => void;
}

export default function SolutionCenter({
  salaryMgmt,
  onUpdateSalaryMgmt,
  calendar,
  onUpdateCalendar,
  debtTracker,
  onUpdateDebtTracker,
  behaviorChecklist,
  onUpdateBehaviorChecklist,
  onRegisterNavigationGuard
}: SolutionCenterProps) {
  // Sub-tabs in Solution Center
  const [activeSubTab, setActiveSubTab] = useState<'salary' | 'calendar' | 'debt' | 'checklist'>('salary');

  // Custom Modal implementation for premium, beautifully styled inside-app dialogs
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    type?: 'success' | 'warning' | 'info' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    description: '',
    confirmText: '확인',
    cancelText: '취소',
    showCancel: false,
    type: 'info'
  });

  const showCustomModal = (config: {
    title: string;
    message: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    type?: 'success' | 'warning' | 'info' | 'error';
  }) => {
    setModal({
      isOpen: true,
      title: config.title,
      message: config.message,
      description: config.description || '',
      confirmText: config.confirmText || '확인',
      cancelText: config.cancelText || '취소',
      onConfirm: config.onConfirm,
      showCancel: !!config.showCancel,
      type: config.type || 'info'
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // ==========================================
  // Sub-tab 1: Salary Management Edit states
  // ==========================================
  const [isManaged, setIsManaged] = useState(salaryMgmt.isManagedByFamily);
  const [period, setPeriod] = useState(salaryMgmt.payoutPeriod);
  const [amount, setAmount] = useState(String(salaryMgmt.payoutAmount || ''));
  const [payoutTime, setPayoutTime] = useState(salaryMgmt.payoutTime || '09:00');
  const [payoutDay, setPayoutDay] = useState(salaryMgmt.payoutDayOfWeek);
  const [allowNotif, setAllowNotif] = useState(salaryMgmt.allowNotification);
  const dailyPaidToday = (salaryMgmt.checkedDates || []).includes(getTodayYYYYMMDD());

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSalaryMgmt({
      ...salaryMgmt,
      isManagedByFamily: isManaged,
      payoutPeriod: period,
      payoutAmount: Number(amount) || 0,
      payoutTime: payoutTime,
      payoutDayOfWeek: Number(payoutDay),
      allowNotification: allowNotif
    });
    alert('가족 자금관리 규칙이 안전하게 업데이트되었습니다.');
  };

  const handleTogglePaidToday = () => {
    const todayStr = getTodayYYYYMMDD();
    const currentChecked = salaryMgmt.checkedDates || [];
    let updated: string[];
    const isPaid = currentChecked.includes(todayStr);
    if (isPaid) {
      updated = currentChecked.filter(d => d !== todayStr);
    } else {
      updated = [...currentChecked, todayStr];
    }
    
    // 1. Update salary management checkedDates only (completely independent)
    onUpdateSalaryMgmt({
      ...salaryMgmt,
      checkedDates: updated
    });

    showCustomModal({
      title: '생활비 지급 완료 처리',
      message: isPaid 
        ? '오늘의 생활비 지급 완료 상태가 해제되었습니다.' 
        : '오늘의 최저생활비 지급 완료 처리가 안전하게 기록되었습니다.',
      type: 'success',
      confirmText: '확인'
    });
  };

  const handleSalaryDayClick = (dateStr: string) => {
    const currentChecked = salaryMgmt.checkedDates || [];
    let updated: string[];
    const isPaid = currentChecked.includes(dateStr);
    if (isPaid) {
      updated = currentChecked.filter(d => d !== dateStr);
    } else {
      updated = [...currentChecked, dateStr];
    }
    
    onUpdateSalaryMgmt({
      ...salaryMgmt,
      checkedDates: updated
    });
  };


  // ==========================================
  // Sub-tab 2: No Gambling Calendar & D-Day
  // ==========================================
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // 0-indexed
  });

  // Calculate D-Day from Start Date
  const calculateDDay = () => {
    if (!calendar.startDate) return 0;
    const start = new Date(calendar.startDate);
    start.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = today.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const dDay = calculateDDay();

  // Calendar render helper
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0: Sun, 1: Mon...
  };

  const handleDayClick = (dateStr: string) => {
    let newChecked = [...calendar.checkedDates];
    if (newChecked.includes(dateStr)) {
      newChecked = newChecked.filter(d => d !== dateStr);
    } else {
      newChecked.push(dateStr);
    }

    // Update challenges completed check
    const totalCount = newChecked.length;
    const updatedChallenges = calendar.challenges.map(ch => {
      // 만약 누적 체크 완료 일수가 챌린지 요구 일수 돌파 시
      const triggerEarn = totalCount >= ch.days;
      return {
        ...ch,
        isRewarded: triggerEarn ? ch.isRewarded : false // 자격 미달 시 보상 해제, 자작 수동 변경 가능
      };
    });

    onUpdateCalendar({
      ...calendar,
      checkedDates: newChecked,
      challenges: updatedChallenges
    });
  };

  const handleToggleReward = (index: number) => {
    const updatedChallenges = [...calendar.challenges];
    updatedChallenges[index].isRewarded = !updatedChallenges[index].isRewarded;
    onUpdateCalendar({
      ...calendar,
      challenges: updatedChallenges
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateCalendar({
      ...calendar,
      startDate: e.target.value
    });
  };

  const handleResetCalendarProgress = () => {
    showCustomModal({
      title: '🔄 새로운 단도박 도전 시작',
      message: '다시 재도전 하시겠습니까?',
      description: '처음부터 단단하게 한 걸음씩 정진해 봅시다. 저희가 항상 곁에서 뜨겁게 응원합니다! 🤝❤️',
      confirmText: '재도전',
      cancelText: '취소',
      showCancel: true,
      type: 'warning',
      onConfirm: () => {
        onUpdateCalendar({
          ...calendar,
          startDate: '', // Clear the start date so they can set a fresh restart date
          checkedDates: [],
          challenges: calendar.challenges.map(ch => ({
            ...ch,
            isRewarded: false
          }))
        });
        
        setTimeout(() => {
          showCustomModal({
            title: '✨ 당신의 새로운 출발을 응원합니다',
            message: '무도박 기록이 초기화되었으며 새로운 마음으로 다시 시작할 준비가 완료되었습니다. 새로운 시작일을 등록해 주세요.\n\n당신의 위대한 도전을 온 마음으로 응원합니다! ✨',
            type: 'success',
            confirmText: '파이팅!'
          });
        }, 150);
      }
    });
  };

  const prevMonth = () => {
    setCurrentYearMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCurrentYearMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };


  // ==========================================
  // Sub-tab 3: Debt Tracker (3 Routes) State
  // ==========================================
  const [openModalType, setOpenModalType] = useState<string | null>(null);

  // 1. 당사자의 채무액
  const [gTotal, setGTotal] = useState(String(debtTracker.gamblerTotalDebt ?? 0));
  const [gMonthly, setGMonthly] = useState(String(debtTracker.gamblerMonthlyRepayment ?? 0));
  const [gPaid, setGPaid] = useState(String(debtTracker.gamblerAlreadyPaid ?? 0));

  // 2. 가족의 채무 (대신 갚아준 돈 및 급여 차감 기록)
  const [famPaidTotal, setFamPaidTotal] = useState(String(debtTracker.familyPaidTotal ?? 0));
  const [famTodayDeduct, setFamTodayDeduct] = useState('0');

  // 3. 주변지인 채무 (array of AcquaintanceDebt)
  const [acqDebts, setAcqDebts] = useState<typeof debtTracker.acquaintanceDebts>(() => {
    const list = debtTracker.acquaintanceDebts && debtTracker.acquaintanceDebts.length > 0
      ? debtTracker.acquaintanceDebts
      : [];
    return list.filter(d => d && d.name && d.name.trim() !== '');
  });

  // 지인 추가/상환 모달 임시 입력값
  const [newAcqName, setNewAcqName] = useState('');
  const [newAcqAmount, setNewAcqAmount] = useState('0');
  const [todayAcqTargetId, setTodayAcqTargetId] = useState('');
  const [todayAcqAmount, setTodayAcqAmount] = useState('0');

  // 4. 상환 내역 기록 (캘린더 연동 및 일지)
  const [repaymentHistory, setRepaymentHistory] = useState<RepaymentLog[]>(() => {
    return debtTracker.repaymentHistory || [
      { id: 'h1', date: '2026-05-15', amount: 150, notes: '5월 정기 상환' },
      { id: 'h2', date: '2026-06-15', amount: 150, notes: '6월 정기 상환 완료' }
    ];
  });

  const [historyYearMonth, setHistoryYearMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [newLogDate, setNewLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newLogAmount, setNewLogAmount] = useState('150');
  const [newLogNotes, setNewLogNotes] = useState('정기 상환');

  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('0');
  const [editNotes, setEditNotes] = useState<string>('');

  const [todayRepayAmount, setTodayRepayAmount] = useState<string>('0');
  const [todayRepayNotes, setTodayRepayNotes] = useState<string>('금일 상환 완료');

  const [deleteConfirmAcqId, setDeleteConfirmAcqId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // gTotal 및 gMonthly 변화에 따른 gPaid 자동 계산 (채무총액 - 이번달상환액)
  React.useEffect(() => {
    const total = Number(gTotal) || 0;
    const monthly = Number(gMonthly) || 0;
    // user's intent: "지금까지 상환완료도 채무총액-이번달 상환액으로 해줘"
    setGPaid(String(Math.max(0, total - monthly)));
  }, [gTotal, gMonthly]);

  const hasUnsavedDebtChanges = () => {
    const isGTotalDiff = (Number(gTotal) || 0) !== (debtTracker.gamblerTotalDebt || 0);
    const isFamPaidDiff = (Number(famPaidTotal) || 0) !== (debtTracker.familyPaidTotal || 0);
    
    const localAcq = acqDebts.map(d => ({
      id: d.id,
      name: (d.name || '').trim(),
      amount: Number(d.amount) || 0,
      monthlyPay: Number(d.monthlyPay) || 0,
    }));
    const originalAcq = (debtTracker.acquaintanceDebts || []).filter(d => d && d.name && d.name.trim() !== '').map(d => ({
      id: d.id,
      name: (d.name || '').trim(),
      amount: d.amount || 0,
      monthlyPay: d.monthlyPay || 0,
    }));
    const isAcqDiff = JSON.stringify(localAcq) !== JSON.stringify(originalAcq);

    const localRepay = repaymentHistory.map(h => ({
      id: h.id,
      date: h.date,
      amount: Number(h.amount) || 0,
      notes: h.notes,
      type: h.type,
      targetId: h.targetId
    }));
    const originalRepay = (debtTracker.repaymentHistory || []).map(h => ({
      id: h.id,
      date: h.date,
      amount: Number(h.amount) || 0,
      notes: h.notes,
      type: h.type,
      targetId: h.targetId
    }));
    const isRepayDiff = JSON.stringify(localRepay) !== JSON.stringify(originalRepay);

    return isGTotalDiff || isFamPaidDiff || isAcqDiff || isRepayDiff;
  };

  const handleAddAcqDebt = () => {
    setAcqDebts(prev => [
      ...prev,
      { id: String(Date.now()), name: '', amount: 0, monthlyPay: 0, note: '' }
    ]);
  };

  const handleRemoveAcqDebt = (id: string) => {
    if (acqDebts.length === 1) {
      setAcqDebts([{ id: '1', name: '', amount: 0, monthlyPay: 0, note: '' }]);
    } else {
      setAcqDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleEditAcqDebt = (id: string, field: 'name' | 'note' | 'amount' | 'monthlyPay', value: any) => {
    setAcqDebts(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          [field]: field === 'amount' || field === 'monthlyPay' ? (value === '' ? '' : Number(value)) : value
        };
      }
      return d;
    }));
  };

  const handleAddRepaymentLog = () => {
    if (!newLogDate) {
      alert('상환 날짜를 선택해주세요.');
      return;
    }
    const amt = Number(newLogAmount) || 0;
    if (amt <= 0) {
      alert('상환액을 입력해주세요.');
      return;
    }
    const newLog: RepaymentLog = {
      id: String(Date.now()),
      date: newLogDate,
      amount: amt,
      notes: newLogNotes.trim() || '상환 완료'
    };
    setRepaymentHistory(prev => [...prev, newLog]);
    setNewLogNotes('정기 상환');
    alert('상환 내역이 임시 추가되었습니다. 최종 저장을 위해 하단의 최종 저장 버튼을 누르면 완전히 반영됩니다.');
  };

  const handleRemoveRepaymentLog = (id: string) => {
    setRepaymentHistory(prev => prev.filter(item => item.id !== id));
  };

  const prevHistoryMonth = () => {
    setHistoryYearMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextHistoryMonth = () => {
    setHistoryYearMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // dynamic computations for different debt tracks
  const currentMonthPrefix = getTodayYYYYMMDD().substring(0, 7);

  // 1. Gambler Debt (당사자 채무)
  const computedPaid = repaymentHistory
    .filter(log => !log.type || log.type === 'gambler')
    .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

  const computedMonthlyPaid = repaymentHistory
    .filter(log => (!log.type || log.type === 'gambler') && log.date.startsWith(currentMonthPrefix))
    .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

  // 2. Family Debt (가족 대위변제 공제액)
  const computedFamAccumulated = repaymentHistory
    .filter(log => log.type === 'family')
    .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

  const computedFamMonthlyPaid = repaymentHistory
    .filter(log => log.type === 'family' && log.date.startsWith(currentMonthPrefix))
    .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

  // 3. Acquaintance Debt (지인 채무)
  const computedAcqTotal = acqDebts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const computedAcqAccumulated = repaymentHistory
    .filter(log => log.type === 'acquaintance')
    .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

  const computedAcqMonthlyPaid = repaymentHistory
    .filter(log => log.type === 'acquaintance' && log.date.startsWith(currentMonthPrefix))
    .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

  React.useEffect(() => {
    if (onRegisterNavigationGuard) {
      onRegisterNavigationGuard(() => {
        if (activeSubTab === 'debt' && hasUnsavedDebtChanges()) {
          const proceed = window.confirm(
            '채무 정보의 변경 내용이 있습니다. 저장하고 이동하시겠습니까?\n\n- [확인]: 변경 내용을 ‘저장’하고 이동\n- [취소]: 저장하지 않고 ‘바로 이동’'
          );
          if (proceed) {
            onUpdateDebtTracker({
              gamblerTotalDebt: Number(gTotal) || 0,
              gamblerMonthlyRepayment: computedMonthlyPaid,
              gamblerAlreadyPaid: computedPaid,
              familyPaidTotal: Number(famPaidTotal) || 0,
              familyThisMonthDeducted: computedFamMonthlyPaid,
              familyLastMonthDeducted: 0,
              familyAccumulatedDeducted: computedFamAccumulated,
              acquaintanceDebts: acqDebts.map(d => ({
                ...d,
                amount: Number(d.amount) || 0,
                monthlyPay: Number(d.monthlyPay) || 0
              })),
              repaymentHistory: repaymentHistory
            });
            alert('채무 정보 저장 및 갱신이 완료되었습니다.');
          }
        }
        return true; 
      });
    }
    return () => {
      if (onRegisterNavigationGuard) {
        onRegisterNavigationGuard(null);
      }
    };
  }, [
    onRegisterNavigationGuard,
    activeSubTab,
    gTotal,
    famPaidTotal,
    acqDebts,
    repaymentHistory,
    computedMonthlyPaid,
    computedPaid,
    computedFamMonthlyPaid,
    computedFamAccumulated,
    debtTracker
  ]);

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDebtTracker({
      gamblerTotalDebt: Number(gTotal) || 0,
      gamblerMonthlyRepayment: computedMonthlyPaid,
      gamblerAlreadyPaid: computedPaid,
      familyPaidTotal: Number(famPaidTotal) || 0,
      familyThisMonthDeducted: computedFamMonthlyPaid,
      familyLastMonthDeducted: 0,
      familyAccumulatedDeducted: computedFamAccumulated,
      acquaintanceDebts: acqDebts.map(d => ({
        ...d,
        amount: Number(d.amount) || 0,
        monthlyPay: Number(d.monthlyPay) || 0
      })),
      repaymentHistory: repaymentHistory
    });
    alert('새로운 삼중 채무 트래킹 정보가 동기화되었습니다.');
  };

  const handleSubTabChange = (targetTab: 'salary' | 'calendar' | 'debt' | 'checklist') => {
    if (activeSubTab === 'debt' && hasUnsavedDebtChanges()) {
      const proceed = window.confirm(
        '채무 정보의 변경 내용이 있습니다. 저장하고 이동하시겠습니까?\n\n- [확인]: 변경 내용을 ‘저장’하고 이동\n- [취소]: 저장하지 않고 ‘바로 이동’'
      );
      if (proceed) {
        onUpdateDebtTracker({
          gamblerTotalDebt: Number(gTotal) || 0,
          gamblerMonthlyRepayment: computedMonthlyPaid,
          gamblerAlreadyPaid: computedPaid,
          familyPaidTotal: Number(famPaidTotal) || 0,
          familyThisMonthDeducted: computedFamMonthlyPaid,
          familyLastMonthDeducted: 0,
          familyAccumulatedDeducted: computedFamAccumulated,
          acquaintanceDebts: acqDebts.map(d => ({
            ...d,
            amount: Number(d.amount) || 0,
            monthlyPay: Number(d.monthlyPay) || 0
          })),
          repaymentHistory: repaymentHistory
        });
        alert('채무 정보 저장 및 갱신이 완료되었습니다.');
      }
    }
    setActiveSubTab(targetTab);
  };

  const handleResetAllDebt = () => {
    setGTotal('0');
    setGMonthly('0');
    setGPaid('0');
    setFamPaidTotal('0');
    setFamTodayDeduct('0');
    setAcqDebts([]);
    setRepaymentHistory([]);
    
    onUpdateDebtTracker({
      gamblerTotalDebt: 0,
      gamblerMonthlyRepayment: 0,
      gamblerAlreadyPaid: 0,
      familyPaidTotal: 0,
      familyThisMonthDeducted: 0,
      familyLastMonthDeducted: 0,
      familyAccumulatedDeducted: 0,
      acquaintanceDebts: [],
      repaymentHistory: []
    });
    alert('모든 채무 정보가 초기화되었습니다.');
  };


  // ==========================================
  // Sub-tab 4: Behavior Checklist
  // ==========================================
  const checklistItems = [
    { id: 1, text: "휴대폰을 교묘히 숨기거나 비밀번호를 자주 바꾸고 화면을 보이지 않으려 한다." },
    { id: 2, text: "돈이나 대출 상환, 가계 자금 현황 같은 금전적인 대화/이야기를 극도로 피한다." },
    { id: 3, text: "사소한 대화에도 갑자기 날이 선 듯 매우 예민하고 신경질적으로 행동한다." },
    { id: 4, text: "가족에게 핑계를 대며 자금 용도나 행적에 대해 거짓말을 하거나 말을 얼버무린다." },
    { id: 5, text: "외출이나 갑작스러운 긴 통화 이유를 물어보면 명확하게 대답하지 않는다." },
    { id: 6, text: "눈에 띄게 대출이나 카드, 고금리 융자, 한도 등에 관련된 이야기를 하거나 문자 알림이 뜬다." },
    { id: 7, text: "평소보다 부쩍 긴장해 있거나 피로해 보이며, 잠을 거의 자지 않은 것 같다." },
    { id: 8, text: "계좌이체, 카드결제 등 계좌 거래내역 확인 요청을 거부한다." },
    { id: 9, text: "어떤 이유가 되었든, 액수에 상관없이 다급하게 돈을 융통해 달라고 요구한다." },
    { id: 10, text: "지갑 내 현금 혹은 가정의 귀중품이 불분명한 이유로 간헐적으로 사라지거나 분실된다." }
  ];

  const handleToggleCheckItemId = (id: number) => {
    onUpdateBehaviorChecklist(prev => {
      const isChecked = (prev.checkedIds || []).includes(id);
      const newChecked = isChecked 
        ? (prev.checkedIds || []).filter(x => x !== id)
        : [...(prev.checkedIds || []), id];
      return {
        ...prev,
        checkedIds: newChecked,
        checkedDate: getTodayYYYYMMDD()
      };
    });
  };

  const handleResetChecklist = () => {
    showCustomModal({
      title: '🧹 전체 체크 해제',
      message: '오늘의 이상행동 점검 내역을 전부 미체크(기본) 상태로 초기화하시겠습니까?',
      confirmText: '초기화',
      cancelText: '취소',
      showCancel: true,
      type: 'warning',
      onConfirm: () => {
        onUpdateBehaviorChecklist({
          checkedIds: [],
          checkedDate: getTodayYYYYMMDD()
        });
      }
    });
  };

  const formatKRWAmount = (amount: number) => {
    if (amount >= 100000000) {
      const eok = Math.floor(amount / 100000000);
      const rest = amount % 100000000;
      const man = Math.floor(rest / 10000);
      return `${eok}억${man > 0 ? ' ' + man + '만' : ''}원`;
    }
    if (amount >= 10000) {
      const man = Math.floor(amount / 10000);
      const rest = amount % 10000;
      return `${man}만${rest > 0 ? ' ' + rest.toLocaleString() : ''}원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  const formatWageAmount = (won: number) => {
    if (won >= 100000000) {
      const eok = Math.floor(won / 100000000);
      const rest = won % 100000000;
      const man = Math.floor(rest / 10000);
      return `${eok}억${man > 0 ? ' ' + man + '만' : ''}원`;
    }
    if (won >= 10000) {
      const man = Math.floor(won / 10000);
      const rest = won % 10000;
      return `${man}만${rest > 0 ? ' ' + rest.toLocaleString() : ''}원`;
    }
    return `${won.toLocaleString()}원`;
  };

  return (
    <div className="bg-[#f0ad73] border border-[#d8975e] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col h-full text-black" id="solution-center-section">
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-black flex items-center gap-2 mb-1 whitespace-nowrap break-keep uppercase tracking-tight">
          <Sparkles className="w-5 h-5 text-indigo-950 shrink-0" />
          가족과 함께하는 일상 극복 솔루션
        </h3>
        <p className="text-xs sm:text-sm text-slate-900 font-extrabold leading-relaxed break-keep">
          단순한 금지나 감시가 아닌, 급여 관리·무도박 기록·채무 관리·교감 일기를 통해 가족과 함께 지속 가능한 회복을 만들어갑니다.
        </p>
      </div>

      {/* Mini Tabs for Sub Components */}
      <div className="bg-[#e29e64] border border-[#cc8e56] rounded-2xl p-1.5 grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0 mb-4 shadow-inner">
        <button
          onClick={() => handleSubTabChange('salary')}
          className={`w-full py-2.5 px-1 sm:px-2.5 text-[10px] sm:text-xs font-black rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border leading-none ${
            activeSubTab === 'salary' 
              ? 'bg-slate-900 border-slate-950 text-white shadow-md' 
              : 'bg-white/45 border-orange-200 text-slate-900 hover:text-black hover:bg-white/70'
          }`}
          id="tab-salary"
        >
          <Wallet className="w-3.5 h-3.5" />
          가족 생활비 관리
        </button>
        <button
          onClick={() => handleSubTabChange('calendar')}
          className={`w-full py-2.5 px-1 sm:px-2.5 text-[10px] sm:text-xs font-black rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border leading-none ${
            activeSubTab === 'calendar' 
              ? 'bg-slate-900 border-slate-950 text-white shadow-md' 
              : 'bg-white/45 border-orange-200 text-slate-900 hover:text-black hover:bg-white/70'
          }`}
          id="tab-calendar"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          단도박 체크 & 디데이
        </button>
        <button
          onClick={() => handleSubTabChange('debt')}
          className={`w-full py-2.5 px-1 sm:px-2.5 text-[10px] sm:text-xs font-black rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border leading-none ${
            activeSubTab === 'debt' 
              ? 'bg-slate-900 border-slate-950 text-white shadow-md' 
              : 'bg-white/45 border-orange-200 text-slate-900 hover:text-black hover:bg-white/70'
          }`}
          id="tab-debt"
        >
          <TrendingDown className="w-3.5 h-3.5" />
          채무 관리
        </button>
        <button
          onClick={() => handleSubTabChange('checklist')}
          className={`w-full py-2.5 px-1 sm:px-2.5 text-[10px] sm:text-xs font-black rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border leading-none ${
            activeSubTab === 'checklist' 
              ? 'bg-slate-900 border-slate-950 text-white shadow-md' 
              : 'bg-white/45 border-orange-200 text-slate-900 hover:text-black hover:bg-white/70'
          }`}
          id="tab-checklist"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          이상행동 체크리스트
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        
        {/* ====================================================
            1. FAMILY SALARY MANAGEMENT
        ==================================================== */}
        {activeSubTab === 'salary' && (
          <div className="space-y-6" id="salary-mgmt-subview">
            <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 flex gap-3 text-amber-950">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed font-bold">
                <span className="font-extrabold block mb-1">💡 개발자 꿀팁 (급여 가족 위탁의 중요성)</span>
                도박 증독을 겪는 뇌는 눈앞에 한 판을 더 할 자금이 있거나 큰돈이 수중에 들어올 때 자제력을 100% 잃습니다. 
                치유의 필수 조치는 <strong>월급 통장의 명의/비밀번호/실물 카드를 가족이 완전히 소유하고 통제하는 것</strong>입니다. 
                당사자에게는 하루 또는 주 단위로 교통비와 한 끼 식비 수준의 최소 생활비만 직접 지급하는 규칙을 정해 유혹을 물리적으로 완전 차단해야 합니다.
              </div>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-white/60 border border-amber-600/20 rounded-xl">
                <div>
                  <span className="text-xs font-black text-slate-950 block">급여 통장 가족 전담 관리 여부</span>
                  <span className="text-[11px] text-slate-800 font-bold">당사자의 급여 관리를 완전히 가족에게 이전했습니까?</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isManaged} 
                    onChange={(e) => setIsManaged(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              {isManaged && (
                <div className="space-y-4 border border-amber-600/20 rounded-xl p-4 bg-white/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">최소 생활비 지급 주기</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPeriod('daily')}
                          className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                            period === 'daily'
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-300 text-slate-700 hover:text-black'
                          }`}
                        >
                          매일 지급
                        </button>
                        <button
                          type="button"
                          onClick={() => setPeriod('weekly')}
                          className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                            period === 'weekly'
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-300 text-slate-700 hover:text-black'
                          }`}
                        >
                          매주 지급
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">회당 지급 생활비 (원 단위)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="예: 10000"
                          className="w-full bg-white border border-slate-300 rounded-lg pl-3 pr-10 py-1.5 text-xs text-black font-semibold placeholder-slate-500 shadow-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-900 font-bold">원</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">송금 리마인드 알림 시각</label>
                      <input
                        type="time"
                        value={payoutTime}
                        onChange={(e) => setPayoutTime(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-black font-semibold shadow-sm"
                      />
                    </div>

                    {period === 'weekly' && (
                      <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">매주 지급 요일</label>
                        <select
                          value={payoutDay}
                          onChange={(e) => setPayoutDay(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-black font-semibold shadow-sm"
                        >
                          <option value={1}>월요일</option>
                          <option value={2}>화요일</option>
                          <option value={3}>수요일</option>
                          <option value={4}>목요일</option>
                          <option value={5}>금요일</option>
                          <option value={6}>토요일</option>
                          <option value={0}>일요일</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-amber-600/10">
                    <input
                      type="checkbox"
                      id="allowNotif"
                      checked={allowNotif}
                      onChange={(e) => setAllowNotif(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="allowNotif" className="text-xs font-bold text-slate-900 cursor-pointer select-none">
                      송금 시각 리마인드 알림 수신 동의
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                교통비/식비 지급 및 예산 계획 저장
              </button>
            </form>

            {isManaged && (
              <div className="space-y-4">
                <div className="border border-amber-600/20 rounded-xl p-4 bg-white/40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-slate-950">
                      오늘의 교통비/식비 지급 상태판
                    </span>
                    <span className="text-[10px] text-indigo-950 font-extrabold bg-indigo-900/10 border border-indigo-900/20 px-2.5 py-0.5 rounded-full">
                      {period === 'daily' ? '매일' : '매주'} {formatWageAmount(Number(amount) || 0)} 규칙
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-bold mb-4">
                    매일 아침 유혹을 비우고 신뢰를 입금합니다. 당사자는 최소한의 금액으로 하루의 온전함을 버텨냅니다.
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleTogglePaidToday}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        dailyPaidToday
                          ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow'
                          : 'bg-white hover:bg-slate-50 border-2 border-slate-300 text-indigo-900 hover:text-indigo-950'
                      }`}
                    >
                      {dailyPaidToday ? (
                        <>
                          <Check className="w-4 h-4" /> 오늘자 최소 생활비 지급 완료됨
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4 text-indigo-900" /> 오늘 생활비 이체 및 지급 체크하기
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 생활비 지급 이력 달력 */}
                <div className="border border-amber-600/20 rounded-xl p-4 bg-white/40">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black text-black">
                      {currentYearMonth.year}년 {(currentYearMonth.month + 1)}월 생활비 이체 및 지급 이력판
                    </h4>
                    <div className="flex gap-1.5">
                      <button 
                        type="button"
                        onClick={prevMonth} 
                        className="p-1 hover:bg-white/50 rounded transition cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-900" />
                      </button>
                      <button 
                        type="button"
                        onClick={nextMonth} 
                        className="p-1 hover:bg-white/50 rounded transition cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-900" />
                      </button>
                    </div>
                  </div>

                  {/* Day Labels */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-900 mb-2">
                    <span className="text-rose-700">일</span>
                    <span>월</span>
                    <span>화</span>
                    <span>수</span>
                    <span>목</span>
                    <span>금</span>
                    <span className="text-blue-700">토</span>
                  </div>

                  {/* Grid Cells */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty spaces before first day */}
                    {Array.from({ length: getFirstDayOfMonth(currentYearMonth.year, currentYearMonth.month) }).map((_, idx) => (
                      <div key={`empty-salary-${idx}`} className="aspect-square"></div>
                    ))}
                    
                    {/* Real Days of the Month */}
                    {Array.from({ length: getDaysInMonth(currentYearMonth.year, currentYearMonth.month) }).map((_, idx) => {
                      const day = idx + 1;
                      const monthPad = String(currentYearMonth.month + 1).padStart(2, '0');
                      const dayPad = String(day).padStart(2, '0');
                      const dateStr = `${currentYearMonth.year}-${monthPad}-${dayPad}`;
                      const isChecked = (salaryMgmt.checkedDates || []).includes(dateStr);
                      const isToday = getTodayYYYYMMDD() === dateStr;

                      return (
                        <button
                          key={`day-salary-${day}`}
                          type="button"
                          onClick={() => handleSalaryDayClick(dateStr)}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center transition border text-[11px] relative cursor-pointer ${
                            isChecked 
                              ? 'bg-emerald-700 border-emerald-700 text-white font-bold shadow-sm' 
                              : isToday 
                                ? 'bg-indigo-100 border-indigo-400 text-indigo-950 font-black'
                                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-black font-semibold'
                          }`}
                        >
                          <span>{day}</span>
                          {isChecked && <Check className="w-3 h-3 text-white absolute bottom-1 font-black" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-900 font-bold mt-3 text-right">
                    📅 생활비를 이체하여 보낸 날을 탭하면 지급 성공 기호와 함께 이력이 영구 기록됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'calendar' && (
          <div className="space-y-6" id="calendar-subview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/40 border border-amber-600/20 rounded-xl p-4 text-black">
              <div>
                <label className="block text-[11px] font-black text-slate-900 mb-1">
                  무도박 여정 시작일
                </label>
                <input
                  type="date"
                  value={calendar.startDate}
                  onChange={handleStartDateChange}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-black font-bold shadow-sm"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-slate-900 block font-black leading-tight animate-pulse">무도박 진행 일수</span>
                <span className="text-xl font-black text-indigo-950 tracking-tight">
                  {calendar.startDate ? `D + ${dDay} 일째` : '시작일을 넣어주세요'}
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-slate-900 block font-black leading-tight">실제 체크(성공) 일수</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl font-black text-emerald-900 tracking-tight">
                    총 {calendar.checkedDates.length} 일 달성
                  </span>
                  <button
                    type="button"
                    onClick={handleResetCalendarProgress}
                    className="bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-350 text-rose-700 font-extrabold px-2 py-1 rounded text-[9px] cursor-pointer transition flex items-center gap-1 shadow-sm"
                    title="무도박 및 진행일수 전체 재도전 및 포맷"
                  >
                    🔄 재도전
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Widget */}
            <div className="border border-amber-600/20 rounded-xl p-4 bg-white/40">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black text-black">
                  {currentYearMonth.year}년 {(currentYearMonth.month + 1)}월 무도박 승리 체크 보드
                </h4>
                <div className="flex gap-1.5">
                  <button 
                    onClick={prevMonth} 
                    className="p-1 hover:bg-white/50 rounded transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-900" />
                  </button>
                  <button 
                    onClick={nextMonth} 
                    className="p-1 hover:bg-white/50 rounded transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-900" />
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-900 mb-2">
                <span className="text-rose-700">일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span className="text-blue-700">토</span>
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty spaces before first day */}
                {Array.from({ length: getFirstDayOfMonth(currentYearMonth.year, currentYearMonth.month) }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square"></div>
                ))}
                
                {/* Real Days of the Month */}
                {Array.from({ length: getDaysInMonth(currentYearMonth.year, currentYearMonth.month) }).map((_, idx) => {
                  const day = idx + 1;
                  const monthPad = String(currentYearMonth.month + 1).padStart(2, '0');
                  const dayPad = String(day).padStart(2, '0');
                  const dateStr = `${currentYearMonth.year}-${monthPad}-${dayPad}`;
                  const isChecked = calendar.checkedDates.includes(dateStr);
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;

                  return (
                    <button
                      key={`day-${day}`}
                      onClick={() => handleDayClick(dateStr)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center transition border text-[11px] relative cursor-pointer ${
                        isChecked 
                          ? 'bg-emerald-700 border-emerald-700 text-white font-bold shadow-sm' 
                          : isToday 
                            ? 'bg-indigo-100 border-indigo-400 text-indigo-950 font-black'
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-black font-semibold'
                      }`}
                    >
                      <span>{day}</span>
                      {isChecked && <Check className="w-3 h-3 text-white absolute bottom-1 font-black" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-900 font-bold mt-3 text-right">
                📅 성공하여 도박을 이긴 날을 직접 탭하여 초록색으로 채워주세요! 가족들의 연대 힘이 됩니다.
              </p>
            </div>

            {/* Achievement Rewards Milestone Alert */}
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-950 block uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-950" />
                성공 목표 달성 보상 & 격려 알림
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {calendar.challenges.map((ch, idx) => {
                  const isQualified = calendar.checkedDates.length >= ch.days;
                  return (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
                        ch.isRewarded 
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold' 
                          : isQualified 
                            ? 'bg-indigo-900/10 border-indigo-900/20 text-indigo-950 font-bold'
                            : 'bg-white/40 border border-amber-600/10 text-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-xs font-black tracking-tight block text-slate-950">
                          🎯 {ch.title} ({ch.days}일 무도박 성공)
                        </span>
                        {isQualified ? (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-700 text-white animate-pulse">
                            달성 완료!
                          </span>
                        ) : (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white border border-slate-300 text-slate-800">
                            체크 {calendar.checkedDates.length}/{ch.days}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-900 mb-3 leading-relaxed font-bold">
                        {ch.rewardDescription}
                      </p>

                      <div className="flex justify-between items-center pt-2.5 border-t border-amber-600/10">
                        <span className="text-[10px] text-slate-900 font-bold">보상 챙겨주기 알림 설정</span>
                        <button
                          type="button"
                          onClick={() => handleToggleReward(idx)}
                          disabled={!isQualified}
                          className={`text-[10px] font-black px-2.5 py-1 rounded transition max-w-[120px] ${
                            !isQualified 
                              ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed' 
                              : ch.isRewarded 
                                ? 'bg-emerald-700 hover:bg-emerald-650 text-white cursor-pointer' 
                                : 'bg-indigo-900 hover:bg-indigo-950 text-white cursor-pointer'
                          }`}
                        >
                          {ch.isRewarded ? '🎁 선물/칭찬 지급 완료' : '🎁 선물 준비 필요'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            3. DEBT MANAGEMENT SUBTAB
        ==================================================== */}
        {activeSubTab === 'debt' && (
          <div className="space-y-4 text-black" id="debt-subview">
            {/* Caution Banner */}
            <div className="bg-rose-100 border border-rose-300 rounded-xl p-4 flex gap-3 text-rose-950 font-bold">
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-extrabold block mb-1 text-rose-955">💡 우리들의 치유기: 대변(대신 갚아줌)의 위험성</span>
                절대로 당사자의 도박 빚을 가족이 무조건 대신 다 갚아주고 그냥 넘어가서는 안 됩니다. 
                스스로 책임지지 않은 빚은 당사자의 재도박 본능을 강하게 자극합니다. 
                가족이 대신 상환했다면, 반드시 단도박 상태를 유지하며 <strong>매달 급여인출이나 차감을 정기적으로 기록</strong>하여 당사자가 흘린 땀의 무게를 깨닫게 해야 합니다.
              </div>
            </div>

            <form onSubmit={handleSaveDebt} className="space-y-4">
              {/* 1. 당사자의 총 채무액 요약 패널 */}
              <div className="bg-white/75 border border-slate-350 rounded-2xl p-4.5 shadow-sm text-black relative">
                <div className="mb-3 border-b border-amber-600/10 pb-2">
                  <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <span className="text-rose-700">1.</span> 당사자의 총 채무액 정보
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2.5 text-xs font-bold text-slate-900">
                  <div className="bg-white/40 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block leading-tight mb-0.5">당사자 채무 총액</span>
                    <span className="text-sm text-rose-700 font-extrabold">{Number(gTotal) || 0} 만원</span>
                  </div>
                  <div className="bg-white/40 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block leading-tight mb-0.5">이번달 상환액</span>
                    <span className="text-sm text-slate-950 font-extrabold">{computedMonthlyPaid} 만원</span>
                  </div>
                  <div className="bg-white/40 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block leading-tight mb-0.5">지금까지 상환완료</span>
                    <span className="text-sm text-emerald-700 font-extrabold">{computedPaid} 만원</span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-100/80 border border-slate-200 rounded-xl text-[11px] flex flex-wrap justify-between items-center gap-2 font-bold text-slate-900">
                  <div>
                    현재 남은 채무: <span className="text-rose-700 font-black">{formatKRWAmount((Math.max(0, (Number(gTotal) || 0) - computedPaid)) * 10000)}</span>
                  </div>
                  <div>
                    상환 진행 완료율: <span className="text-emerald-700 font-black">
                      {Number(gTotal) > 0 ? `${Math.min(100, Math.round((computedPaid / Number(gTotal)) * 100))}%` : '0%'}
                    </span>
                  </div>
                  <div>
                    남은 기간: <span className="text-indigo-950 font-black">
                      {(() => {
                        const rem = (Number(gTotal) || 0) - computedPaid;
                        const mon = computedMonthlyPaid;
                        if (rem <= 0) return '완납 완료';
                        if (mon <= 0) return '상환 기록 필요';
                        return `${Math.ceil(rem / mon)}개월`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenModalType('gambler')}
                    className="bg-slate-900 hover:bg-slate-950 text-white text-[11px] font-black py-2.5 px-1 rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer text-center"
                    title="당사자의 도박 빚 총액과 정기 상환액을 기입합니다"
                  >
                    🖊️ 총 채무액
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTodayRepayAmount('0');
                      setTodayRepayNotes('금일 상환 완료');
                      setOpenModalType('today');
                    }}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-black py-2.5 px-1 rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer text-center"
                    title="오늘 납부한 금액을 즉시 입력하여 캘린더와 본 창에 연계 삭감합니다"
                  >
                    💵 금일 상환액
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenModalType('history')}
                    className="bg-indigo-900 hover:bg-indigo-950 text-white text-[11px] font-black py-2.5 px-1 rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer text-center"
                    title="상환 기록을 열람하고 전반적 날짜별 이력을 소거/수정합니다"
                  >
                    📅 상환내역보기
                  </button>
                </div>
              </div>

              {/* 2. 가족의 대위변제금액 공제내역 요약 패널 */}
              <div className="bg-white/75 border border-slate-350 rounded-2xl p-4.5 shadow-sm text-black relative" id="family-debt-panel">
                <div className="mb-3 border-b border-amber-600/10 pb-2">
                  <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <span className="text-rose-700">2.</span> 가족의 대위변제금액 공제내역
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-900">
                  <div className="bg-white/40 p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block leading-tight mb-0.5">대위 변제 총액</span>
                    <span className="text-xs text-rose-700 font-extrabold">{famPaidTotal} 만원</span>
                  </div>
                  <div className="bg-white/40 p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block leading-tight mb-0.5">이번 달 차감액</span>
                    <span className="text-xs text-slate-950 font-extrabold">{computedFamMonthlyPaid} 만원</span>
                  </div>
                  <div className="bg-white/40 p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block leading-tight mb-0.5">누적 총 차감액</span>
                    <span className="text-xs text-emerald-700 font-extrabold">{computedFamAccumulated} 만원</span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-100/80 border border-slate-200 rounded-xl text-[11px] flex flex-wrap justify-between items-center gap-2 font-bold text-slate-900">
                  <div>
                    가족 정산 잔액: <span className="text-rose-700 font-black">
                      {formatKRWAmount(Math.max(0, (Number(famPaidTotal) || 0) - computedFamAccumulated) * 10000)}
                    </span>
                  </div>
                  <div>
                    공제/정산 완료율: <span className="text-indigo-950 font-black">
                      {(Number(famPaidTotal) || 0) > 0 ? `${Math.min(100, Math.round((computedFamAccumulated / (Number(famPaidTotal) || 0)) * 100))}%` : '0%'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenModalType('family')}
                    className="bg-slate-900 hover:bg-slate-950 text-white text-[11px] font-black py-2.5 px-1 rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer text-center"
                    id="family-total-input-btn"
                  >
                    🖊️ 대위변제총액
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFamTodayDeduct('0');
                      setOpenModalType('today_family');
                    }}
                    className="bg-emerald-800 hover:bg-emerald-950 text-white text-[11px] font-black py-2.5 px-1 rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer text-center"
                    title="오늘 가족 채무 차감/공제한 금액을 즉시 입력하여 연계 삭감합니다"
                    id="family-today-deduct-btn"
                  >
                    💵 금일 차감액
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenModalType('history_family')}
                    className="bg-indigo-900 hover:bg-indigo-955 text-white text-[11px] font-black py-2.5 px-1 rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer text-center"
                    title="가족 차감 기록을 열람하고 날짜별 이력을 관리합니다"
                    id="family-history-btn"
                  >
                    📅 차감내역보기
                  </button>
                </div>
              </div>

              {/* 3. 주변 지인 채무 */}
              <div className="border-2 border-slate-950/20 rounded-2xl p-5 bg-white/50 shadow-sm text-black" id="acquaintance-debt-panel">
                <div className="mb-3 border-b border-amber-600/20 pb-2">
                  <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <span className="text-rose-700">3.</span> 주변 지인 채무 리스트
                  </h4>
                </div>
                <p className="text-[11px] text-slate-800 mb-4 leading-relaxed font-bold">
                  도박 자금 마련을 위해 직장 동료, 친구, 선후배 등 지인으로부터 긴급 대여한 빚입니다. 사과와 정리가 반드시 필요하며 순차적으로 상환 계획을 수립해야 합니다.
                </p>

                {/* 1,2번과 정확히 양립하는 3단 요약 리포팅 */}
                <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-900 mb-4">
                  <div className="bg-white/40 p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block leading-tight mb-0.5">지인 채무 총액</span>
                    <span className="text-xs text-rose-700 font-extrabold">{computedAcqTotal} 만원</span>
                  </div>
                  <div className="bg-white/40 p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block leading-tight mb-0.5">이번 달 상환액</span>
                    <span className="text-xs text-slate-950 font-extrabold">{computedAcqMonthlyPaid} 만원</span>
                  </div>
                  <div className="bg-white/40 p-2 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-slate-500 block leading-tight mb-0.5">누적 총 상환액</span>
                    <span className="text-xs text-emerald-700 font-extrabold">{computedAcqAccumulated} 만원</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-100/80 border border-slate-200 rounded-xl text-[11px] flex flex-wrap justify-between items-center gap-2 font-bold text-slate-900 mb-4">
                  <div>
                    지인 정산 잔액: <span className="text-rose-700 font-black">
                      {formatKRWAmount(Math.max(0, computedAcqTotal - computedAcqAccumulated) * 10000)}
                    </span>
                  </div>
                  <div>
                    지인상환 완료율: <span className="text-indigo-950 font-black">
                      {computedAcqTotal > 0 ? `${Math.min(100, Math.round((computedAcqAccumulated / computedAcqTotal) * 100))}%` : '0%'}
                    </span>
                  </div>
                </div>

                {/* 지인 채권자 카드 리스트 렌더링 */}
                <div className="space-y-3 mb-4">
                  {acqDebts.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50/40 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 font-bold">
                      등록된 지인 채권자가 없습니다. 먼저 채권자를 추가하십시오.
                    </div>
                  ) : (
                    acqDebts.map((item, index) => {
                      const itemAccumulated = repaymentHistory
                        .filter(l => l.type === 'acquaintance' && l.targetId === item.id)
                        .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);
                      const itemRemaining = Math.max(0, (Number(item.amount) || 0) - itemAccumulated);
                      const itemRatio = (Number(item.amount) || 0) > 0 ? Math.min(100, Math.round((itemAccumulated / (Number(item.amount) || 0)) * 100)) : 0;
                      return (
                        <div key={item.id} className="relative bg-white border border-slate-300 p-3.5 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                인물 {index + 1}
                              </span>
                              <span className="font-extrabold text-slate-950 text-sm">{item.name || '미등록 채권자'}</span>
                              {itemRemaining <= 0 ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-1.5 py-0.5 rounded font-black">완납</span>
                              ) : (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] px-1.5 py-0.5 rounded font-black">상환중</span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-x-4 mt-2 text-[10px] text-slate-600 font-semibold">
                              <div>원금: <span className="font-bold text-slate-950">{item.amount || 0} 만원</span></div>
                              <div>상환액: <span className="font-bold text-emerald-800">{itemAccumulated} 만원</span></div>
                              <div>잔액: <span className="font-bold text-rose-700">{itemRemaining} 만원</span></div>
                            </div>
                            {item.note && (
                              <p className="text-[10px] text-indigo-950 font-bold mt-1.5">💡 {item.note}</p>
                            )}
                          </div>

                          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3.5 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="text-right">
                              <span className="text-[11px] block font-black text-indigo-950">{itemRatio}% 완료</span>
                              <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-200">
                                <div className="bg-indigo-900 h-full rounded-full transition-all" style={{ width: `${itemRatio}%` }}></div>
                              </div>
                            </div>
                            {deleteConfirmAcqId === item.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                                <span className="text-[9px] text-rose-700 font-extrabold px-1">정말 삭제할까요?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAcqDebts(prev => prev.filter(d => d.id !== item.id));
                                    setDeleteConfirmAcqId(null);
                                  }}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-1.5 py-1 rounded text-[9px] cursor-pointer transition"
                                >
                                  확인
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmAcqId(null)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold px-1.5 py-1 rounded text-[9px] cursor-pointer transition"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmAcqId(item.id);
                                }}
                                className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 p-2 rounded-lg transition cursor-pointer"
                                title="채권자 삭제"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 3대 버튼: 채권자 추가, 금일 상환액, 상환내역보기 */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewAcqName('');
                      setNewAcqAmount('');
                      setOpenModalType('add_acquaintance');
                    }}
                    className="bg-slate-900 hover:bg-slate-950 text-white text-[11px] font-black py-2.5 px-1 rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer text-center"
                    id="acq-add-btn"
                  >
                    🖊️ 채권자추가
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (acqDebts.length === 0) {
                        alert('등록된 지인 채권자가 없습니다. 먼저 채권자를 추가하십시오.');
                        return;
                      }
                      setTodayAcqTargetId(acqDebts[0].id);
                      setTodayAcqAmount('');
                      setOpenModalType('today_acquaintance');
                    }}
                    className="bg-emerald-800 hover:bg-emerald-950 text-white text-[11px] font-black py-2.5 px-1 rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer text-center"
                    title="오늘 지인에게 상환한 금액을 즉시 입력하여 연계 삭감합니다"
                    id="acq-today-repay-btn"
                  >
                    💵 금일 상환액
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenModalType('history_acquaintance')}
                    className="bg-indigo-900 hover:bg-indigo-950 text-white text-[11px] font-black py-2.5 px-1 rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer text-center"
                    title="지인 상환 기록 및 캘린더 일지"
                    id="acq-history-btn"
                  >
                    📅 상환내역보기
                  </button>
                </div>
              </div>

              {/* Bottom Master Submit Button */}
              <button
                type="submit"
                className="w-full bg-indigo-950 hover:bg-indigo-900 text-white text-xs py-4 rounded-xl font-black transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> 채무 정보 저장 및 갱신
              </button>

              {showResetConfirm ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-rose-50 border border-rose-200 rounded-xl p-3 mt-3 animate-in fade-in duration-200">
                  <span className="text-[10px] text-rose-800 font-extrabold text-center sm:text-left leading-tight">
                    ⚠️ 정말로 모든 채무 정보를 초기화하시겠습니까?<br />입력해둔 모든 내역(원금, 가족대위변제, 지인채무, 내역)이 리셋됩니다.
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        handleResetAllDebt();
                        setShowResetConfirm(false);
                      }}
                      className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition text-center whitespace-nowrap"
                    >
                      예, 초기화합니다
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 sm:flex-initial bg-slate-200 hover:bg-slate-350 text-slate-800 font-extrabold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition text-center whitespace-nowrap"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mt-3">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="text-slate-400 hover:text-rose-600 font-extrabold text-[10px] hover:underline transition bg-transparent border-0 cursor-pointer flex items-center gap-1 py-1 px-2"
                  >
                    ⚠️ 전체 정보 초기화
                  </button>
                </div>
              )}
            </form>
            {openModalType && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
                <div className={`bg-white rounded-2xl ${openModalType === 'history' || openModalType === 'history_family' || openModalType === 'history_acquaintance' ? 'max-w-lg' : 'max-w-sm'} w-full p-6 shadow-2xl border border-slate-200 text-black space-y-4 animate-in duration-200 fade-in zoom-in-95 max-h-[90vh] overflow-y-auto relative`}>
                  {/* Top-Right Close Button ('X') */}
                  <button
                    type="button"
                    onClick={() => setOpenModalType(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition cursor-pointer border border-slate-200 z-10"
                    aria-label="닫기"
                    id="modal-close-x-btn"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {openModalType === 'gambler' && (
                    <>
                      <div className="border-b border-rose-100 pb-2.5">
                        <h3 className="text-sm font-black text-rose-950 flex items-center gap-1.5">
                          <span>🖊️</span> 당사자의 총 채무액 상세 입력
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">당사자 본인의 총 부채 규모를 정밀 기입하세요.</p>
                      </div>
                      <div className="space-y-3.5 text-xs font-bold text-slate-800">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">당사자 채무 총액 (만원 단위)</label>
                          <input
                            type="number"
                            value={gTotal === '0' ? '' : gTotal}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setGTotal('0');
                              } else {
                                const cleaned = val.replace(/^0+/, '');
                                setGTotal(cleaned === '' ? '0' : cleaned);
                              }
                            }}
                            placeholder="0"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-400"
                          />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-3 text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setOpenModalType(null)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenModalType(null);
                            alert('총 부채액이 임시 반영되었습니다. 최종 저장을 위해 하단의 [채무 정보 저장 및 갱신] 버튼을 꼭 눌러주세요.');
                          }}
                          className="flex-1 bg-indigo-950 hover:bg-slate-900 text-white py-2.5 rounded-xl transition cursor-pointer"
                        >
                          입력 완료
                        </button>
                      </div>
                    </>
                  )}

                  {openModalType === 'today' && (
                    <>
                      <div className="border-b border-emerald-100 pb-2.5">
                        <h3 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                          <span>💵</span> 금일 상환액 기록하기
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">
                          오늘 ({getTodayYYYYMMDD()}) 상환 금액을 간편하게 추가하고 잔여 채무에 연계합니다.
                        </p>
                      </div>
                      <div className="space-y-3.5 text-xs font-bold text-slate-800">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">상환 금액 (만원 단위)</label>
                          <input
                            type="number"
                            value={todayRepayAmount === '0' ? '' : todayRepayAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setTodayRepayAmount('0');
                              } else {
                                const cleaned = val.replace(/^0+/, '');
                                setTodayRepayAmount(cleaned === '' ? '0' : cleaned);
                              }
                            }}
                            placeholder="상환 완료 금액 입력"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400"
                          />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-3 text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setOpenModalType(null)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const amt = Number(todayRepayAmount) || 0;
                            if (amt <= 0) {
                              alert('상환 금액을 입력해 주세요.');
                              return;
                            }
                            const newLog: RepaymentLog = {
                              id: String(Date.now()),
                              date: getTodayYYYYMMDD(),
                              amount: amt,
                              notes: '금일 상환 완료'
                            };
                            setRepaymentHistory(prev => [...prev, newLog]);
                            setOpenModalType(null);
                            alert('금일 상환 이력이 성공적으로 임시 등록되었습니다! 메인 화면과 대금 달력에 즉시 연동됩니다. 최하단의 [채무 정보 저장 및 갱신] 버튼을 꼭 누르셔야 최종 영구 보존됩니다.');
                          }}
                          className="flex-1 bg-emerald-800 hover:bg-emerald-950 text-white py-2.5 rounded-xl transition cursor-pointer"
                        >
                          입력 완료
                        </button>
                      </div>
                    </>
                  )}

                  {openModalType === 'history' && (
                    <>
                      <div className="border-b border-indigo-100 pb-2.5">
                        <h3 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                          <span>📅</span> 당사자 상환 내역 달력 및 관리
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">언제 얼마를 상환했는지 기록하고 달력에서 확인할 수 있습니다.</p>
                      </div>

                      {/* Mini calendar inside the history modal */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-slate-900">
                            {historyYearMonth.year}년 {historyYearMonth.month + 1}월 상환 기록
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={prevHistoryMonth}
                              className="p-1 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={nextHistoryMonth}
                              className="p-1 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Calendar days render */}
                        <div className="grid grid-cols-7 text-center text-[9px] font-bold text-slate-700 mb-1">
                          <span className="text-rose-600">일</span>
                          <span>월</span>
                          <span>화</span>
                          <span>수</span>
                          <span>목</span>
                          <span>금</span>
                          <span className="text-blue-600">토</span>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: getFirstDayOfMonth(historyYearMonth.year, historyYearMonth.month) }).map((_, idx) => (
                            <div key={`hist-empty-${idx}`} className="aspect-square"></div>
                          ))}

                          {Array.from({ length: getDaysInMonth(historyYearMonth.year, historyYearMonth.month) }).map((_, idx) => {
                            const day = idx + 1;
                            const monthPad = String(historyYearMonth.month + 1).padStart(2, '0');
                            const dayPad = String(day).padStart(2, '0');
                            const dateStr = `${historyYearMonth.year}-${monthPad}-${dayPad}`;

                            // Find repayments logged on this date
                            const dayRepayments = repaymentHistory.filter(item => item.date === dateStr);
                            const totalRepayForDay = dayRepayments.reduce((sum, item) => sum + item.amount, 0);

                            return (
                              <button
                                type="button"
                                key={`hist-day-${day}`}
                                onClick={() => setNewLogDate(dateStr)}
                                className={`aspect-square rounded-md p-1 border text-[10px] flex flex-col justify-between items-center relative transition cursor-pointer ${
                                  newLogDate === dateStr
                                    ? 'bg-rose-50 border-rose-300 font-bold'
                                    : 'bg-white border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <span className={`text-[9px] ${newLogDate === dateStr ? 'text-rose-700 font-black' : 'text-slate-800'}`}>{day}</span>
                                {totalRepayForDay > 0 && (
                                  <span className="text-[7px] font-extrabold px-1 py-0.2 rounded bg-emerald-700 text-white leading-none scale-90 whitespace-nowrap">
                                    {totalRepayForDay}만
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active day's selected log management */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <span className="text-[11px] font-black text-slate-800 block">
                          📅 {newLogDate} 상환 내역 확인 및 관리
                        </span>

                        {(() => {
                          const dayLogs = repaymentHistory.filter(item => item.date === newLogDate);
                          if (dayLogs.length === 0) {
                            return (
                              <p className="text-[10px] text-slate-400 font-bold py-2 text-center leading-relaxed">
                                이 날짜에 등록된 상환 기록이 없습니다.<br />아래 양식에서 과거 상환 내역을 추가할 수 있습니다.
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                              {dayLogs.map(item => {
                                const isEditing = editingLogId === item.id;
                                return (
                                  <div key={item.id} className="border border-slate-200 bg-white rounded-lg p-2 text-[10px] space-y-1.5 shadow-xs">
                                    {isEditing ? (
                                      <div className="space-y-1.5">
                                        <div className="grid grid-cols-2 gap-1.5">
                                          <div>
                                            <label className="text-[8px] text-slate-400 font-bold block">금액 (만원)</label>
                                            <input
                                              type="number"
                                              value={editAmount === '0' ? '' : editAmount}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') setEditAmount('0');
                                                else setEditAmount(val.replace(/^0+/, '') === '' ? '0' : val.replace(/^0+/, ''));
                                              }}
                                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-black font-extrabold text-[10px]"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[8px] text-slate-400 font-bold block">비고/메모</label>
                                            <input
                                              type="text"
                                              value={editNotes}
                                              onChange={(e) => setEditNotes(e.target.value)}
                                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-black font-semibold text-[10px]"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex justify-end gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const amt = Number(editAmount) || 0;
                                              if (amt <= 0) {
                                                alert('상환액을 입력해 주세요.');
                                                return;
                                              }
                                              setRepaymentHistory(prev => prev.map(log => 
                                                log.id === item.id 
                                                  ? { ...log, amount: amt, notes: editNotes.trim() || '상환 완료' }
                                                  : log
                                              ));
                                              setEditingLogId(null);
                                            }}
                                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-2 py-0.5 rounded text-[9px] cursor-pointer"
                                          >
                                            💾 완료
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingLogId(null)}
                                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-2 py-0.5 rounded text-[9px] cursor-pointer border border-slate-300"
                                          >
                                            ❌ 취소
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between items-center font-bold">
                                        <div className="flex flex-col">
                                          <span className="text-emerald-700 text-[11px] font-black">{item.amount} 만원</span>
                                          <span className="text-slate-500 font-semibold">{item.notes}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingLogId(item.id);
                                              setEditAmount(String(item.amount));
                                              setEditNotes(item.notes);
                                            }}
                                            className="text-slate-600 hover:text-indigo-950 hover:bg-slate-100 px-1.5 py-0.5 rounded font-bold text-[9px] cursor-pointer border border-slate-200 transition"
                                          >
                                            ✏️ 수정
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setRepaymentHistory(prev => prev.filter(log => log.id !== item.id));
                                            }}
                                            className="text-rose-600 hover:text-rose-850 hover:bg-rose-50 px-1.5 py-0.5 rounded font-bold text-[9px] cursor-pointer border border-rose-200 transition"
                                          >
                                            🗑️ 삭제
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Add repayment history log form */}
                      <div className="bg-[#f0ad73]/15 border border-[#f0ad73]/30 rounded-xl p-3 space-y-2.5">
                        <span className="text-[10px] font-black text-[#d97706] block">➕ 과거 상환 내역 추가 기록</span>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                          <div>
                            <label className="block text-slate-500 mb-1">상환 일자</label>
                            <input
                              type="date"
                              value={newLogDate}
                              onChange={(e) => setNewLogDate(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-black font-semibold text-[10px] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">금액 (만원)</label>
                            <input
                              type="number"
                              value={newLogAmount === '0' ? '' : newLogAmount}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  setNewLogAmount('0');
                                } else {
                                  const cleaned = val.replace(/^0+/, '');
                                  setNewLogAmount(cleaned === '' ? '0' : cleaned);
                                }
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-black font-black text-[10px] focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">상환 비고/메모</label>
                            <input
                              type="text"
                              value={newLogNotes}
                              onChange={(e) => setNewLogNotes(e.target.value)}
                              placeholder="예: 7월 정기상환"
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-black font-semibold text-[10px] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAddRepaymentLog}
                            className="bg-indigo-950 hover:bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            상환 등록하기
                          </button>
                        </div>
                      </div>
                      <div className="pt-2 flex text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setOpenModalType(null)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer text-center"
                        >
                          확인 완료
                        </button>
                      </div>
                    </>
                  )}

                  {openModalType === 'family' && (
                    <>
                      <div className="border-b border-indigo-100 pb-2.5">
                        <h3 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                          <span>🖊️</span> 대위변제 총 부채액 설정
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">가족이 대신 상환해 준 총 부채 한도를 설정합니다.</p>
                      </div>
                      <div className="space-y-3.5 text-xs font-bold text-slate-800">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">대위 변제 총액 (만원 단위)</label>
                          <input
                            type="number"
                            value={famPaidTotal === '0' ? '' : famPaidTotal}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setFamPaidTotal('0');
                              } else {
                                const cleaned = val.replace(/^0+/, '');
                                setFamPaidTotal(cleaned === '' ? '0' : cleaned);
                              }
                            }}
                            placeholder="0"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                          />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-3 text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setOpenModalType(null)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenModalType(null);
                            alert('가족 대위변제 총액이 임시 반영되었습니다. 최종 저장을 위해 하단의 [채무 정보 저장 및 갱신] 버튼을 눌러주세요.');
                          }}
                          className="flex-1 bg-indigo-950 hover:bg-slate-900 text-white py-2.5 rounded-xl transition cursor-pointer"
                        >
                          입력 완료
                        </button>
                      </div>
                    </>
                  )}

                  {openModalType === 'today_family' && (
                    <>
                      <div className="border-b border-emerald-100 pb-2.5">
                        <h3 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                          <span>💵</span> 가족 금일 차감액 기록
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">오늘 ({getTodayYYYYMMDD()}) 급여이체, 생활비 절감 등으로 가족 채무를 차감한 내역을 기록합니다.</p>
                      </div>
                      <div className="space-y-3.5 text-xs font-bold text-slate-800">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">오늘 차감/공제액 (만원 단위)</label>
                          <input
                            type="number"
                            value={famTodayDeduct === '0' ? '' : famTodayDeduct}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setFamTodayDeduct('0');
                              } else {
                                const cleaned = val.replace(/^0+/, '');
                                setFamTodayDeduct(cleaned === '' ? '0' : cleaned);
                              }
                            }}
                            placeholder="액수 입력"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400"
                          />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-3 text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setOpenModalType(null)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const amt = Number(famTodayDeduct) || 0;
                            if (amt <= 0) {
                              alert('차감액을 입력해 주세요.');
                              return;
                            }
                            const newLog: RepaymentLog = {
                              id: String(Date.now()),
                              date: getTodayYYYYMMDD(),
                              amount: amt,
                              notes: '가족 대위변제금 차감 공제',
                              type: 'family'
                            };
                            setRepaymentHistory(prev => [...prev, newLog]);
                            setOpenModalType(null);
                            alert('가족 대위변제 차감 이력이 임시 추가되었습니다. 최종 저장을 위해 하단의 [채무 정보 저장 및 갱신] 버튼을 꼭 눌러주세요.');
                          }}
                          className="flex-1 bg-emerald-800 hover:bg-emerald-950 text-white py-2.5 rounded-xl transition cursor-pointer"
                        >
                          입력 완료
                        </button>
                      </div>
                    </>
                  )}

                  {openModalType === 'history_family' && (
                    <>
                      <div className="border-b border-indigo-100 pb-2.5">
                        <h3 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                          <span>📅</span> 가족 대위변제 차감 달력 및 일지
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">대위변제금에서 소거/차감 완료된 이력을 모아보고 관리합니다.</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-slate-900">
                            {historyYearMonth.year}년 {historyYearMonth.month + 1}월 차감 기록
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={prevHistoryMonth}
                              className="p-1 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={nextHistoryMonth}
                              className="p-1 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 text-center text-[9px] font-bold text-slate-700 mb-1">
                          <span className="text-rose-600">일</span>
                          <span>월</span>
                          <span>화</span>
                          <span>수</span>
                          <span>목</span>
                          <span>금</span>
                          <span className="text-blue-600">토</span>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: getFirstDayOfMonth(historyYearMonth.year, historyYearMonth.month) }).map((_, idx) => (
                            <div key={`hist-fam-empty-${idx}`} className="aspect-square"></div>
                          ))}

                          {Array.from({ length: getDaysInMonth(historyYearMonth.year, historyYearMonth.month) }).map((_, idx) => {
                            const day = idx + 1;
                            const monthPad = String(historyYearMonth.month + 1).padStart(2, '0');
                            const dayPad = String(day).padStart(2, '0');
                            const dateStr = `${historyYearMonth.year}-${monthPad}-${dayPad}`;

                            const dayRepayments = repaymentHistory.filter(item => item.type === 'family' && item.date === dateStr);
                            const totalRepayForDay = dayRepayments.reduce((sum, item) => sum + item.amount, 0);

                            return (
                              <button
                                type="button"
                                key={`hist-fam-day-${day}`}
                                onClick={() => setNewLogDate(dateStr)}
                                className={`aspect-square rounded-md p-1 border text-[10px] flex flex-col justify-between items-center relative transition cursor-pointer ${
                                  newLogDate === dateStr
                                    ? 'bg-rose-50 border-rose-300 font-bold'
                                    : 'bg-white border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <span className={`text-[9px] ${newLogDate === dateStr ? 'text-rose-700 font-black' : 'text-slate-800'}`}>{day}</span>
                                {totalRepayForDay > 0 && (
                                  <span className="text-[7px] font-extrabold px-1 py-0.2 rounded bg-indigo-700 text-white leading-none scale-90 whitespace-nowrap">
                                    {totalRepayForDay}만
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <span className="text-[11px] font-black text-slate-800 block">
                          📅 {newLogDate} 차감 기록 상세
                        </span>

                        {(() => {
                          const dayLogs = repaymentHistory.filter(item => item.type === 'family' && item.date === newLogDate);
                          if (dayLogs.length === 0) {
                            return (
                              <p className="text-[10px] text-slate-400 font-bold py-2 text-center leading-relaxed">
                                등록된 가족 차감 기록이 없습니다.<br />아래 폼에서 과거 차감 내역을 등록하세요.
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                              {dayLogs.map(item => {
                                const isEditing = editingLogId === item.id;
                                return (
                                  <div key={item.id} className="border border-slate-200 bg-white rounded-lg p-2 text-[10px] space-y-1.5 shadow-xs">
                                    {isEditing ? (
                                      <div className="space-y-1.5">
                                        <div className="grid grid-cols-2 gap-1.5">
                                          <div>
                                            <label className="text-[8px] text-slate-400 font-bold block">금액 (만원)</label>
                                            <input
                                              type="number"
                                              value={editAmount === '0' ? '' : editAmount}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') setEditAmount('0');
                                                else setEditAmount(val.replace(/^0+/, '') === '' ? '0' : val.replace(/^0+/, ''));
                                              }}
                                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-black font-extrabold text-[10px]"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[8px] text-slate-400 font-bold block">차감 메모</label>
                                            <input
                                              type="text"
                                              value={editNotes}
                                              onChange={(e) => setEditNotes(e.target.value)}
                                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-black font-semibold text-[10px]"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex justify-end gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const amt = Number(editAmount) || 0;
                                              if (amt <= 0) {
                                                alert('금액을 입력하세요.');
                                                return;
                                              }
                                              setRepaymentHistory(prev => prev.map(log => 
                                                log.id === item.id 
                                                  ? { ...log, amount: amt, notes: editNotes.trim() || '가족 대위변제금 차감' }
                                                  : log
                                              ));
                                              setEditingLogId(null);
                                            }}
                                            className="bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold px-2 py-0.5 rounded text-[9px] cursor-pointer"
                                          >
                                            💾 완료
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingLogId(null)}
                                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-2 py-0.5 rounded text-[9px] cursor-pointer border border-slate-300"
                                          >
                                            ❌ 취소
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between items-center font-bold">
                                        <div className="flex flex-col">
                                          <span className="text-indigo-700 font-black text-[11px]">{item.amount} 만원</span>
                                          <span className="text-slate-500 font-semibold">{item.notes}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingLogId(item.id);
                                              setEditAmount(String(item.amount));
                                              setEditNotes(item.notes);
                                            }}
                                            className="text-slate-600 hover:text-indigo-950 hover:bg-slate-100 px-1.5 py-0.5 rounded font-bold text-[9px] cursor-pointer border border-slate-200 transition"
                                          >
                                            ✏️ 수정
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setRepaymentHistory(prev => prev.filter(log => log.id !== item.id));
                                            }}
                                            className="text-rose-600 hover:text-rose-850 hover:bg-rose-50 px-1.5 py-0.5 rounded font-bold text-[9px] cursor-pointer border border-rose-200 transition"
                                          >
                                            🗑️ 삭제
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-2">
                        <span className="text-[10px] font-black text-[#6366f1] block">➕ 가족 차감 내역 소급 등록</span>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                          <div>
                            <label className="block text-slate-500 mb-1">차감 일자</label>
                            <input
                              type="date"
                              value={newLogDate}
                              onChange={(e) => setNewLogDate(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-black font-semibold text-[10px] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[#4f46e5] mb-1">차감액 (만원)</label>
                            <input
                              type="number"
                              value={newLogAmount === '0' ? '' : newLogAmount}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  setNewLogAmount('0');
                                } else {
                                  const cleaned = val.replace(/^0+/, '');
                                  setNewLogAmount(cleaned === '' ? '0' : cleaned);
                                }
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-black font-black text-[10px] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">차감 사유/메모</label>
                            <input
                              type="text"
                              value={newLogNotes}
                              onChange={(e) => setNewLogNotes(e.target.value)}
                              placeholder="가족 대위변제 변제차감"
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-black font-semibold text-[10px] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const amt = Number(newLogAmount) || 0;
                              if (amt <= 0) {
                                alert('지정 금액을 올바르게 기입하세요.');
                                return;
                              }
                              const newLog: RepaymentLog = {
                                id: String(Date.now()),
                                date: newLogDate,
                                amount: amt,
                                notes: newLogNotes.trim() || '가족 대위변제금 차감',
                                type: 'family'
                              };
                              setRepaymentHistory(prev => [...prev, newLog]);
                              alert('가족 대위변제금 차감 이력이 소급 기입되었습니다.');
                            }}
                            className="bg-indigo-950 hover:bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            기록 기입
                          </button>
                        </div>
                      </div>
                      <div className="pt-2 flex text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setOpenModalType(null)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer text-center"
                        >
                          확인 완료
                        </button>
                      </div>
                    </>
                  )}

                  {openModalType === 'add_acquaintance' && (
                    <>
                      <div className="border-b border-indigo-100 pb-2.5">
                        <h3 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                          <span>➕</span> 신규 지인 채권자 추가
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">지인 등 긴급 대여 채권 항목을 추가하십시오.</p>
                      </div>
                      <div className="space-y-3.5 text-xs font-bold text-slate-800">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">채권자 이름/명칭</label>
                          <input
                            type="text"
                            value={newAcqName}
                            onChange={(e) => setNewAcqName(e.target.value)}
                            placeholder="예: 김동료, 이친구"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">채무 금액 (만원 단위)</label>
                          <input
                            type="number"
                            value={newAcqAmount === '0' ? '' : newAcqAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setNewAcqAmount('0');
                              } else {
                                const cleaned = val.replace(/^0+/, '');
                                setNewAcqAmount(cleaned === '' ? '0' : cleaned);
                              }
                            }}
                            placeholder="액수 입력"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                          />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-3 text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setOpenModalType(null)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newAcqName.trim()) {
                              alert('채권자 명칭을 입력하세요.');
                              return;
                            }
                            const amt = Number(newAcqAmount) || 0;
                            if (amt <= 0) {
                              alert('기본 대여액을 적어주세요.');
                              return;
                            }
                            const newDebt = {
                              id: String(Date.now()),
                              name: newAcqName.trim(),
                              amount: amt,
                              monthlyPay: 0,
                              note: ''
                            };
                            setAcqDebts(prev => [...prev, newDebt]);
                            setOpenModalType(null);
                            alert('신규 채권자가 임시 등록되었습니다! 최하단의 [채무 정보 저장 및 갱신] 버튼을 누르면 최종 적용 저장됩니다.');
                          }}
                          className="flex-1 bg-indigo-950 hover:bg-slate-900 text-white py-2.5 rounded-xl transition cursor-pointer"
                        >
                          추가 완료
                        </button>
                      </div>
                    </>
                  )}

                  {openModalType === 'today_acquaintance' && (
                    <>
                      <div className="border-b border-emerald-100 pb-2.5">
                        <h3 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
                          <span>💵</span> 지인 금일 상환 완료액 등록
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">오늘 지인에게 대여금을 갚은 내역을 각 채권자별로 설정하여 추가합니다.</p>
                      </div>
                      <div className="space-y-3.5 text-xs font-bold text-slate-800">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">상환 대상 채권자 선택</label>
                          <select
                            value={todayAcqTargetId}
                            onChange={(e) => setTodayAcqTargetId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400"
                          >
                            <option value="">-- 채권자 선택 --</option>
                            {acqDebts.map(d => (
                              <option key={d.id} value={d.id}>{d.name} (원금: {d.amount}만)</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">상환 액수 (만원 단위)</label>
                          <input
                            type="number"
                            value={todayAcqAmount === '0' ? '' : todayAcqAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setTodayAcqAmount('0');
                              } else {
                                const cleaned = val.replace(/^0+/, '');
                                setTodayAcqAmount(cleaned === '' ? '0' : cleaned);
                              }
                            }}
                            placeholder="상환액"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400"
                          />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-3 text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setOpenModalType(null)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const amt = Number(todayAcqAmount) || 0;
                            if (amt <= 0) {
                              alert('상환 금액을 세팅하세요.');
                              return;
                            }
                            if (!todayAcqTargetId) {
                              alert('상환 대상 지인을 선택하세요.');
                              return;
                            }
                            const target = acqDebts.find(d => d.id === todayAcqTargetId);
                            if (!target) {
                              alert('올바른 지인 채무를 선택하십시오.');
                              return;
                            }
                            const newLog: RepaymentLog = {
                              id: String(Date.now()),
                              date: getTodayYYYYMMDD(),
                              amount: amt,
                              notes: `${target.name}님 상환 완료`,
                              type: 'acquaintance',
                              targetId: target.id
                            };
                            setRepaymentHistory(prev => [...prev, newLog]);
                            setOpenModalType(null);
                            alert(`[${target.name}]님에 대해 ${amt}만원 지인 상환 완료 이력이 임시 등록되었습니다! 최하단의 정식 저장버튼을 통해 최종 동기화해 주십시오.`);
                          }}
                          className="flex-1 bg-emerald-800 hover:bg-emerald-950 text-white py-2.5 rounded-xl transition cursor-pointer"
                        >
                          상환 완료
                        </button>
                      </div>
                    </>
                  )}

                  {openModalType === 'history_acquaintance' && (
                    <>
                      <div className="border-b border-indigo-100 pb-2.5">
                        <h3 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                          <span>📅</span> 지인 대여금 상환 캘린더 관리
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">지인 등 대여금에 대해 상환 소거 완료했던 이력을 모아봅니다.</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-black text-slate-900">
                            {historyYearMonth.year}년 {historyYearMonth.month + 1}월 지인 상환 기록
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={prevHistoryMonth}
                              className="p-1 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={nextHistoryMonth}
                              className="p-1 hover:bg-slate-200 rounded transition cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 text-center text-[9px] font-bold text-slate-700 mb-1">
                          <span className="text-rose-600">일</span>
                          <span>월</span>
                          <span>화</span>
                          <span>수</span>
                          <span>목</span>
                          <span>금</span>
                          <span className="text-blue-600">토</span>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: getFirstDayOfMonth(historyYearMonth.year, historyYearMonth.month) }).map((_, idx) => (
                            <div key={`hist-acq-empty-${idx}`} className="aspect-square"></div>
                          ))}

                          {Array.from({ length: getDaysInMonth(historyYearMonth.year, historyYearMonth.month) }).map((_, idx) => {
                            const day = idx + 1;
                            const monthPad = String(historyYearMonth.month + 1).padStart(2, '0');
                            const dayPad = String(day).padStart(2, '0');
                            const dateStr = `${historyYearMonth.year}-${monthPad}-${dayPad}`;

                            const dayRepayments = repaymentHistory.filter(item => item.type === 'acquaintance' && item.date === dateStr);
                            const totalRepayForDay = dayRepayments.reduce((sum, item) => sum + item.amount, 0);

                            return (
                              <button
                                type="button"
                                key={`hist-acq-day-${day}`}
                                onClick={() => setNewLogDate(dateStr)}
                                className={`aspect-square rounded-md p-1 border text-[10px] flex flex-col justify-between items-center relative transition cursor-pointer ${
                                  newLogDate === dateStr
                                    ? 'bg-rose-50 border-rose-300 font-bold'
                                    : 'bg-white border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <span className={`text-[9px] ${newLogDate === dateStr ? 'text-rose-700 font-black' : 'text-slate-800'}`}>{day}</span>
                                {totalRepayForDay > 0 && (
                                  <span className="text-[7px] font-extrabold px-1 py-0.2 rounded bg-indigo-700 text-white leading-none scale-90 whitespace-nowrap">
                                    {totalRepayForDay}만
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                        <span className="text-[11px] font-black text-slate-800 block">
                          📅 {newLogDate} 지인 상환 디테일
                        </span>

                        {(() => {
                          const dayLogs = repaymentHistory.filter(item => item.type === 'acquaintance' && item.date === newLogDate);
                          if (dayLogs.length === 0) {
                            return (
                              <p className="text-[10px] text-slate-400 font-bold py-2 text-center leading-relaxed">
                                등록된 지인 상환 기록이 없습니다.<br />아래 폼에서 임의 상환내역을 채권자별로 기입해 부채를 경감하세요.
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                              {dayLogs.map(item => {
                                const isEditing = editingLogId === item.id;
                                return (
                                  <div key={item.id} className="border border-slate-200 bg-white rounded-lg p-2 text-[10px] space-y-1.5 shadow-xs">
                                    {isEditing ? (
                                      <div className="space-y-1.5">
                                        <div className="grid grid-cols-2 gap-1.5">
                                          <div>
                                            <label className="text-[8px] text-slate-400 font-bold block">금액 (만원)</label>
                                            <input
                                              type="number"
                                              value={editAmount === '0' ? '' : editAmount}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') setEditAmount('0');
                                                else setEditAmount(val.replace(/^0+/, '') === '' ? '0' : val.replace(/^0+/, ''));
                                              }}
                                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-black font-extrabold text-[10px]"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[8px] text-slate-400 font-bold block">메모</label>
                                            <input
                                              type="text"
                                              value={editNotes}
                                              onChange={(e) => setEditNotes(e.target.value)}
                                              className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-black font-semibold text-[10px]"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex justify-end gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const amt = Number(editAmount) || 0;
                                              if (amt <= 0) {
                                                alert('금액을 입력해 주세요.');
                                                return;
                                              }
                                              setRepaymentHistory(prev => prev.map(log => 
                                                log.id === item.id 
                                                  ? { ...log, amount: amt, notes: editNotes.trim() || '지인 상환 완료' }
                                                  : log
                                              ));
                                              setEditingLogId(null);
                                            }}
                                            className="bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold px-2 py-0.5 rounded text-[9px] cursor-pointer"
                                          >
                                            💾 완료
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingLogId(null)}
                                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-2 py-0.5 rounded text-[9px] cursor-pointer border border-slate-300"
                                          >
                                            ❌ 취소
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between items-center font-bold">
                                        <div className="flex flex-col">
                                          <span className="text-emerald-700 font-black text-[11px]">{item.amount} 만원</span>
                                          <span className="text-slate-500 font-semibold">{item.notes}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingLogId(item.id);
                                              setEditAmount(String(item.amount));
                                              setEditNotes(item.notes);
                                            }}
                                            className="text-slate-600 hover:text-indigo-950 hover:bg-slate-100 px-1.5 py-0.5 rounded font-bold text-[9px] cursor-pointer border border-slate-200 transition"
                                          >
                                            ✏️ 수정
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setRepaymentHistory(prev => prev.filter(log => log.id !== item.id));
                                            }}
                                            className="text-rose-600 hover:text-rose-850 hover:bg-rose-50 px-1.5 py-0.5 rounded font-bold text-[9px] cursor-pointer border border-rose-200 transition"
                                          >
                                            🗑️ 삭제
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-2">
                        <span className="text-[10px] font-black text-[#5046e6] block">➕ 지인 상환 소급 등록</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                          <div className="col-span-2">
                            <label className="block text-slate-500 mb-1">상환 대상자</label>
                            <select
                              value={todayAcqTargetId}
                              onChange={(e) => setTodayAcqTargetId(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-black font-semibold text-[10px] focus:outline-none"
                            >
                              <option value="">-- 채권자 선택 --</option>
                              {acqDebts.map(d => (
                                <option key={d.id} value={d.id}>{d.name} (채무: {d.amount}만)</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-500 mb-1">상환 일자</label>
                            <input
                              type="date"
                              value={newLogDate}
                              onChange={(e) => setNewLogDate(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-black font-semibold text-[10px] focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-550 text-[#4f46e5] mb-1">상환된 액수 (만원)</label>
                            <input
                              type="number"
                              value={newLogAmount === '0' ? '' : newLogAmount}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  setNewLogAmount('0');
                                } else {
                                  const cleaned = val.replace(/^0+/, '');
                                  setNewLogAmount(cleaned === '' ? '0' : cleaned);
                                }
                              }}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-black font-black text-[10px] focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const amt = Number(newLogAmount) || 0;
                              if (amt <= 0) {
                                alert('지정 금액을 입력하세요.');
                                return;
                              }
                              if (!todayAcqTargetId) {
                                alert('상환 대상 지인을 선택하세요.');
                                return;
                              }
                              const target = acqDebts.find(d => d.id === todayAcqTargetId);
                              if (!target) {
                                alert('올바른 상환 대상자를 선택하십시오.');
                                return;
                              }
                              const newLog: RepaymentLog = {
                                id: String(Date.now()),
                                date: newLogDate,
                                amount: amt,
                                notes: `${target.name}님 상환 완료`,
                                type: 'acquaintance',
                                targetId: target.id
                              };
                              setRepaymentHistory(prev => [...prev, newLog]);
                              alert('지인 채무 상환 기록이 소급 성립되었습니다.');
                            }}
                            className="bg-indigo-950 hover:bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            상환 소급 추가
                          </button>
                        </div>
                      </div>
                      <div className="pt-2 flex text-xs font-black">
                        <button
                          type="button"
                          onClick={() => setOpenModalType(null)}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl border border-slate-300 transition cursor-pointer text-center"
                        >
                          확인 완료
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            4. BEHAVIOR CHECKLIST (DOBAK DETECTOR)
        ==================================================== */}
        {activeSubTab === 'checklist' && (
          <div className="space-y-6 animate-in fade-in duration-200" id="checklist-subview">
            <div className="bg-rose-100 border border-rose-300 rounded-xl p-4 flex gap-3 text-rose-950 font-bold shadow-sm">
              <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs leading-relaxed">
                <span className="font-extrabold block mb-1 text-slate-950">💡 가족용 도박 및 재발 의심 징후 점검 (매일 10초 체크)</span>
                도박 재발은 소리 없이 찾아옵니다. 일방적으로 의심하거나 윽박지르는 대신, 가족이 평소 당사자를 면밀히 관찰하며 매일 간단히 체크해 보세요. 
                재발 징후를 초기에 빠르게 잡아내어 차단하는 것이 치유의 핵심입니다.
              </div>
            </div>

            {/* Checklist items dynamic card grid */}
            <div className="border border-slate-200/90 rounded-2xl p-5 bg-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    🔎 재발 의심 이상행동 점검표
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">평소와 다른 이상 거동을 발견하는 즉시 클릭하여 활성화하십시오.</p>
                </div>
              </div>

              {/* Items Render */}
              <div className="grid grid-cols-1 gap-2.5">
                {checklistItems.map((item) => {
                  const isChecked = (behaviorChecklist.checkedIds || []).includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheckItemId(item.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-rose-50/75 border-rose-400 text-rose-950 shadow-sm font-bold scale-[0.99]'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="h-4 w-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500 cursor-pointer pointer-events-none Accent-rose-600"
                        />
                      </div>
                      <div className="text-xs leading-relaxed">
                        <span className="font-extrabold text-slate-400 mr-1.5">0{item.id}.</span> 
                        <span className={isChecked ? 'text-rose-950 font-black' : 'text-slate-900 font-medium'}>
                          {item.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aggregation & Diagnosis Diagnostic Box */}
              {(() => {
                const count = (behaviorChecklist.checkedIds || []).length;
                let statusText = "";
                let statusColor = "";
                let bgBadge = "";
                let desc = "";
                let solutionText = "";

                if (count <= 2) {
                  statusText = "🟢 의심하긴 이른 단계 (정상/안심)";
                  statusColor = "text-emerald-700";
                  bgBadge = "bg-emerald-50 border-emerald-300 text-emerald-950";
                  desc = "현재 당사자의 거동이나 환경적 요소에서 뚜렷한 도박 재발 및 시도 징후는 나타나지 않고 있습니다.";
                  solutionText = "가정 내 평화를 유지하시되, 통장 명의 관리 및 소액 용돈 규칙을 꾸준히 준수하며 당사자를 격려하고 믿어주세요.";
                } else if (count <= 5) {
                  statusText = "🟡 주의 / 관심요망 (밀착 관찰 단계)";
                  statusColor = "text-amber-700";
                  bgBadge = "bg-amber-50 border-amber-300 text-amber-950";
                  desc = "당사자가 도박 충동 자극을 받고 있거나 유혹에 전전긍긍하는 고위험 신호가 보입니다.";
                  solutionText = "감정적으로 비난하기보다 최근 며칠 사이 무슨 고민이 있거나 흔들리는 부분이 있는지 차분히 대화를 유도하고, 당사자의 계좌 실시간 내역 조회를 긴밀하게 권유해 안전망을 복구하세요.";
                } else {
                  statusText = "🔴 위험 / 재발 확률 매우 높음 (즉각 개입 시급)";
                  statusColor = "text-rose-700";
                  bgBadge = "bg-rose-50 border-rose-300 text-rose-950";
                  desc = "도박을 다시 재개했거나, 급전 마련을 위해 이미 극단적인 부채 악순환에 다시 뛰어들었을 확률이 매우 높습니다.";
                  solutionText = "도박 당사자의 변명과 거짓말에 현혹되거나 대신 빚을 갚아주지 마십시오. 즉각적으로 은행 보안 매체 소지를 차단하고 스마트폰 자금 융통 방식을 원천 회수하십시오. 이후 전문가 상담 또는 한국도박문제예방치유원(1336) 등 공인기관에 즉각적인 상생 개입 조치를 연계해야 합니다.";
                }

                return (
                  <div className={`mt-5 rounded-2xl border p-4.5 space-y-3 shadow-inner ${bgBadge} transition-all duration-300`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-900 text-white leading-none">
                          진단 결과
                        </span>
                        <span className="text-[11px] font-bold text-slate-800">
                          점검일: {behaviorChecklist.checkedDate || new Date().toISOString().split('T')[0]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[12px] font-black">
                          체크 개수: <strong className="text-base font-black underline decoration-2 decoration-rose-500">{count}</strong> / 10개
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900/10 space-y-2">
                      <h4 className={`text-sm font-black ${statusColor} leading-snug`}>
                        {statusText}
                      </h4>
                      <p className="text-xs leading-relaxed font-bold opacity-90 text-slate-950">
                        {desc}
                      </p>
                      <div className="p-3 bg-white/70 rounded-xl border border-dashed border-slate-900/5 mt-2">
                        <span className="text-[10px] font-black text-slate-900 block mb-0.5">⚠️ 가족 수칙 및 맞춤 권고 대안</span>
                        <p className="text-[11px] leading-relaxed font-bold text-slate-800">
                          {solutionText}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Reset button moved to the very bottom */}
              <div className="flex justify-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetChecklist}
                  className="bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 font-extrabold px-3 py-2 rounded-xl text-[10.5px] cursor-pointer transition flex items-center gap-1.5 shadow-sm"
                >
                  🧹 오늘의 체크 내역 전체 해제 (초기화)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Premium custom modal dialog popup fallback to window.confirm/alert inside sandboxed iframes */}
      <AnimatePresence>
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 max-w-sm w-full mx-auto overflow-hidden text-slate-900"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Visual Icon Alert Accent */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  modal.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  modal.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  modal.type === 'error' ? 'bg-rose-100 text-rose-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  {modal.type === 'success' && <Sparkles className="w-6 h-6 animate-bounce" />}
                  {modal.type === 'warning' && <ShieldAlert className="w-6 h-6 text-amber-600" />}
                  {modal.type === 'error' && <AlertCircle className="w-6 h-6 text-rose-600" />}
                  {modal.type === 'info' && <Check className="w-6 h-6" />}
                </div>

                <div className="space-y-1.5 w-full">
                  <h4 className="text-sm font-black text-slate-950 tracking-tight leading-snug">
                    {modal.title}
                  </h4>
                  <p className="text-xs font-bold text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {modal.message}
                  </p>
                  {(modal as any).description && (
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      {(modal as any).description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full pt-1">
                  {modal.showCancel && (
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-2 px-3 border border-slate-200 text-slate-600 font-black hover:bg-slate-50 text-xs rounded-xl cursor-pointer transition"
                    >
                      {modal.cancelText}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (modal.onConfirm) {
                        modal.onConfirm();
                      }
                      closeModal();
                    }}
                    className={`flex-1 py-2 px-3 text-white font-black text-xs rounded-xl cursor-pointer transition ${
                      modal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500' :
                      modal.type === 'warning' ? 'bg-rose-600 hover:bg-rose-500' :
                      modal.type === 'error' ? 'bg-rose-650 hover:bg-rose-600' :
                      'bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    {modal.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
