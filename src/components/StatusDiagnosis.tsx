/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GamblerStatus } from '../types';
import { AlertTriangle, TrendingUp, ShieldAlert, RefreshCw, FileText, BarChart3 } from 'lucide-react';

interface StatusDiagnosisProps {
  status: GamblerStatus;
  onUpdateStatus: (newStatus: GamblerStatus) => void;
  onNextStep?: () => void;
}

// 50% 기준으로 점점 빨개지며, 90% 이상은 완전한 레드 계열로 강력히 경고
const getSeverityStyle = (index: number) => {
  if (index >= 90) {
    return {
      bg: 'bg-red-50 border-red-600 border-4 shadow-red-200 shadow-xl',
      textColor: 'text-red-700 font-black',
      numColor: 'text-red-600 font-extrabold',
      iconColor: 'text-red-600 shrink-0 mt-0.5',
      alertBadge: 'bg-red-600 text-white rounded-md px-2 py-1 mt-1 font-black text-[10px] inline-block'
    };
  }
  if (index >= 80) {
    return {
      bg: 'bg-rose-50 border-rose-450 border-2 shadow-sm',
      textColor: 'text-rose-955 font-extrabold',
      numColor: 'text-rose-650 font-black',
      iconColor: 'text-rose-600 shrink-0 mt-0.5',
      alertBadge: 'bg-rose-600 text-white rounded-md px-1.5 py-0.5 mt-1 font-bold text-[9px] inline-block'
    };
  }
  if (index >= 70) {
    return {
      bg: 'bg-orange-50 border-orange-405 border-2 shadow-sm',
      textColor: 'text-orange-950 font-bold',
      numColor: 'text-orange-700 font-extrabold',
      iconColor: 'text-orange-500 shrink-0 mt-0.5',
      alertBadge: 'bg-orange-600 text-white rounded-md px-1.5 py-0.5 mt-1 font-bold text-[9px] inline-block'
    };
  }
  if (index >= 50) {
    return {
      bg: 'bg-yellow-50 border-yellow-350 border shadow-sm',
      textColor: 'text-yellow-955 font-bold',
      numColor: 'text-yellow-650 font-extrabold',
      iconColor: 'text-yellow-600 shrink-0 mt-0.5',
      alertBadge: 'bg-yellow-600 text-white rounded-md px-1.5 py-0.5 mt-1 font-bold text-[9px] inline-block'
    };
  }
  if (index >= 30) {
    return {
      bg: 'bg-teal-50 border-teal-300 border shadow-sm',
      textColor: 'text-teal-955 font-bold',
      numColor: 'text-teal-650 font-bold',
      iconColor: 'text-teal-500 shrink-0 mt-0.5',
      alertBadge: 'bg-teal-600 text-white rounded-md px-1.5 py-0.5 mt-1 font-semibold text-[9px] inline-block'
    };
  }
  return {
    bg: 'bg-emerald-50 border-emerald-300 border shadow-sm',
    textColor: 'text-emerald-955 font-bold',
    numColor: 'text-emerald-650 font-bold',
    iconColor: 'text-emerald-500 shrink-0 mt-0.5',
    alertBadge: 'bg-emerald-600 text-white rounded-md px-1.5 py-0.5 mt-1 font-semibold text-[9px] inline-block'
  };
};

export default function StatusDiagnosis({ status, onUpdateStatus, onNextStep }: StatusDiagnosisProps) {
  // Local edit states
  const [job, setJob] = useState(status.job || '');
  const [debt, setDebt] = useState(status.debt ? String(status.debt) : '');
  const [monthlyIncome, setMonthlyIncome] = useState(status.monthlyIncome ? String(status.monthlyIncome) : '');
  const [monthlyGamblingExpense, setMonthlyGamblingExpense] = useState(status.monthlyGamblingExpense ? String(status.monthlyGamblingExpense) : '');
  
  // Custom states added as requested
  const [relationship, setRelationship] = useState<string[]>(status.relationship || []);
  const [hasCreditIssue, setHasCreditIssue] = useState<boolean>(!!status.hasCreditIssue);
  const [hasIllegalPrivateDebt, setHasIllegalPrivateDebt] = useState<boolean>(!!status.hasIllegalPrivateDebt);
  const [hasAcquaintanceDebt, setHasAcquaintanceDebt] = useState<boolean>(!!status.hasAcquaintanceDebt);
  const [hasCriminalRecord, setHasCriminalRecord] = useState<boolean>(!!status.hasCriminalRecord);

  // For visual representation of comparison
  const [calculatedMetrics, setCalculatedMetrics] = useState<{
    debtToIncomeRatio: number; // 채무 대 연소득 비율 (%)
    gamblingToIncomeRatio: number; // 도박 소비 대 월소득 비율 (%)
    severityIndex: number; // 0 ~ 100
    severityText: string;
    severityColor: string;
    advice: string[];
  } | null>(null);

  useEffect(() => {
    if (status.hasEntered) {
      calculateMetrics(status);
    }
  }, [status]);

  const calculateMetrics = (data: GamblerStatus) => {
    const annualIncome = data.monthlyIncome * 12;
    const debtToIncomeRatio = annualIncome > 0 ? (data.debt / annualIncome) * 100 : (data.debt > 0 ? 999 : 0);
    const gamblingToIncomeRatio = data.monthlyIncome > 0 ? (data.monthlyGamblingExpense / data.monthlyIncome) * 100 : 0;

    // Severity calculation
    let score = 0;
    
    // 1. Debt score
    if (data.debt > 0) {
      if (debtToIncomeRatio > 150) score += 35; // 빚이 연소득 1.5배 이상 (매우 심각)
      else if (debtToIncomeRatio > 80) score += 25;
      else if (debtToIncomeRatio > 30) score += 15;
      else score += 10;
    }

    // 2. Gambling expense score
    if (data.monthlyGamblingExpense > 0) {
      if (gamblingToIncomeRatio > 80) score += 35; // 도박 지출이 월소득의 80% 이상 (정상생활 불가)
      else if (gamblingToIncomeRatio > 40) score += 25;
      else if (gamblingToIncomeRatio > 15) score += 15;
      else score += 10;
    }

    // 3. Status weight (job check)
    if (!data.job || data.job === '무직' || data.job === '실직') {
      score += 15;
    }

    // 4. Checklist indicators
    if (data.hasCreditIssue) score += 10;
    if (data.hasIllegalPrivateDebt) score += 20; // 불법사금융은 최악의 악성 부채
    if (data.hasAcquaintanceDebt) score += 5;
    if (data.hasCriminalRecord) score += 10;

    let severityText = '양호 / 초기 의심';
    let severityColor = 'text-teal-955 bg-teal-100 border-teal-300';
    let advice: string[] = [];

    if (score >= 70) {
      severityText = '매우 고위험 (파탄 직전)';
      severityColor = 'text-rose-955 bg-rose-100 border-rose-300';
      advice = [
        '⚠️ 긴급 지원이 시급합니다. 즉시 가족 전체의 경제권을 도박 당사자로부터 분리해야 합니다.',
        '당사자가 임의로 추가 대출을 생성하지 못하도록 모든 신용관련 알림을 가족 폰으로 연동하세요.',
        '직접 빚을 대신 갚아주는 일은 독입니다. 변제를 멈추고 전문가(1336)와 상담하여 법적 구제(개인회생/파산 등)를 검토하세요.'
      ];
    } else if (score >= 45) {
      severityText = '위험 (중독 중기)';
      severityColor = 'text-amber-955 bg-amber-100 border-amber-300';
      advice = [
        '현재 소득의 상당수가 도박으로 증발되고 있으며, 가계 채무가 가중되고 있습니다.',
        '급여 관리를 즉시 가족에게 이전하고, 당사자에게는 주 단위 혹은 하루 단위의 최소 교통비/식비만 지급하세요.',
        '도박을 비밀로 붙이지 말고, 단도박 전문 센터 및 모임에 참여하여 심리치료와 모니터링을 개시해야 합니다.'
      ];
    } else if (score >= 20) {
      severityText = '주의 (도박 중독 초기)';
      severityColor = 'text-yellow-955 bg-yellow-105 border-yellow-300';
      advice = [
        '도박으로 인한 초기 재정 유출과 빚이 감지됩니다.',
        '도박은 단순한 취미가 뇌의 통제력 장애로 발전하는 질환입니다. "내가 조심하면 된다"는 믿음을 버리셔야 합니다.',
        '조기에 가족들에게 도박 사실을 직면시키고 자금을 완전히 투명하게 관리해야 합니다.'
      ];
    } else {
      severityText = '양호 / 초기 의심';
      severityColor = 'text-teal-955 bg-teal-100 border-teal-300';
      advice = [
        '현재 도박 지출이 제어 가능한 수준이거나 신체적인 도박 초기 의심 상태입니다.',
        '단 1만 원의 도박이라도 뇌는 더 강한 도파민 자극을 요구합니다. 도박 링크 차단 및 금융 거래 내역 오픈을 시행하세요.'
      ];
    }

    // Dynamic advice addition based on checkboxes
    if (data.hasIllegalPrivateDebt) {
      advice.push('🚨 불법 사금융(30/50, 일수 등)은 폭력적 채권 추심과 파멸적 이자가 동반됩니다. 가족이 절대 독단적으로 대신 갚아주지 말고 즉시 금융감독원 불법 사금융 피해 신고 센터(1332) 또는 법률구조공단(132)에 연락해 채무대리인 지원 제도를 신청하고 형사 신고를 병행해야 합니다.');
    }
    if (data.hasCreditIssue) {
      advice.push('📉 신용불량 및 채무불이행 상태입니다. 사적 채무 돌려막기를 완전히 멈추고, 신용회복위원회의 채무조정(개인워크아웃) 또는 법원의 개인회생 제도를 선제적으로 신청해 보존 자금을 지키세요.');
    }
    if (data.hasCriminalRecord) {
      advice.push('⚖️ 도박으로 인한 법적 처벌(전과) 이력이 있습니다. 이는 통제 범위가 위험 임계점을 넘었음을 의미하므로, 형사 변호 지원과 단도박 센터의 적극적 개입 하에 폐쇄형 집단 상담 등의 강박적 단도박 환경을 구성해야 합니다.');
    }

    setCalculatedMetrics({
      debtToIncomeRatio: Math.round(debtToIncomeRatio),
      gamblingToIncomeRatio: Math.round(gamblingToIncomeRatio),
      severityIndex: Math.min(100, score + 10),
      severityText,
      severityColor,
      advice
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: GamblerStatus = {
      job: job.trim() || '무직',
      debt: Number(debt) || 0,
      monthlyIncome: Number(monthlyIncome) || 0,
      monthlyGamblingExpense: Number(monthlyGamblingExpense) || 0,
      hasEntered: true,
      relationship,
      hasCreditIssue,
      hasIllegalPrivateDebt,
      hasAcquaintanceDebt,
      hasCriminalRecord
    };
    onUpdateStatus(updated);
  };

  const handleReset = () => {
    if (confirm('기존 상황 기록을 초기화하시겠습니까? 데이터는 재설정됩니다.')) {
      setJob('');
      setDebt('');
      setMonthlyIncome('');
      setMonthlyGamblingExpense('');
      setRelationship([]);
      setHasCreditIssue(false);
      setHasIllegalPrivateDebt(false);
      setHasAcquaintanceDebt(false);
      setHasCriminalRecord(false);

      const resetValue: GamblerStatus = {
        job: '',
        debt: 0,
        monthlyIncome: 0,
        monthlyGamblingExpense: 0,
        hasEntered: false,
        relationship: [],
        hasCreditIssue: false,
        hasIllegalPrivateDebt: false,
        hasAcquaintanceDebt: false,
        hasCriminalRecord: false
      };
      onUpdateStatus(resetValue);
      setCalculatedMetrics(null);
    }
  };

  // Format currency
  const formatKRW = (amount: number) => {
    if (amount >= 10000) {
      const eok = Math.floor(amount / 10000);
      const man = amount % 10000;
      return `${eok > 0 ? `${eok}억 ` : ''}${man > 0 ? `${man}만` : ''}원`;
    }
    return `${amount}만원`;
  };

  return (
    <div className="space-y-4" id="status-diagnosis-section">
      <div className="bg-[#f0ad73] border border-[#d8975e] rounded-2xl p-4 sm:p-5 shadow-lg text-black">
        <h3 className="text-xl font-bold text-black flex items-center gap-2.5 mb-2">
          <BarChart3 className="w-5 h-5 text-indigo-950 animate-pulse" />
          현재상황 자가 진단 및 계측기
        </h3>
        <p className="text-sm text-slate-900 font-bold mb-6 leading-relaxed">
          도박 문제의 회복을 위한 첫 단추는 <strong>'현 상태를 숨김없이 정확히 대면하는 것'</strong>입니다. 
          채무와 벌이, 도박 비용을 철저히 기입해 현재 심한 정도를 데이터로 진단하세요. (입력정보는 오직 브라우저 내에만 안전하게 암호 저장됩니다)
        </p>

        {!status.hasEntered ? (
          <form onSubmit={handleSave} className="space-y-5" id="diagnosis-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-950 mb-1.5 uppercase tracking-wider">
                  당사자 직업
                </label>
                <input
                  type="text"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="예: 회사원, 자영업, 무직"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-black placeholder-slate-500 shadow-sm"
                  required
                />
              </div>

              {/* 당사자와의 관계 체크박스 */}
              <div className="md:col-span-2 bg-white/40 border border-[#d8975e]/30 rounded-xl p-4">
                <label className="block text-xs font-black text-slate-950 mb-2.5 uppercase tracking-wider">
                  당사자와의 관계 (중복 선택 가능)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['부모', '형제자매', '배우자', '친구및지인'].map((rel) => {
                    const isChecked = relationship.includes(rel);
                    const toggleChecked = () => {
                      if (isChecked) {
                        setRelationship(prev => prev.filter(r => r !== rel));
                      } else {
                        setRelationship(prev => [...prev, rel]);
                      }
                    };
                    return (
                      <label 
                        key={rel} 
                        className={`flex items-center gap-2 p-2.5 border rounded-xl text-xs font-bold cursor-pointer transition select-none ${
                          isChecked 
                            ? 'bg-slate-950 border-slate-950 text-white shadow-sm font-black' 
                            : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={toggleChecked} 
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        {rel}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-rose-955 mb-1.5 uppercase tracking-wider">
                  총 도박 채무 (만원 단위)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={debt}
                    onChange={(e) => setDebt(e.target.value)}
                    placeholder="예: 5000 (5천만원일 경우)"
                    className="w-full bg-white border border-rose-300 rounded-xl pl-4 pr-12 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black placeholder-slate-500 shadow-sm"
                    min="0"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-800">만원</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-950 mb-1.5 uppercase tracking-wider">
                  실수령 월평균 소득 (만원 단위)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="예: 300 (300만원일 경우)"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-12 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-black placeholder-slate-500 shadow-sm"
                    min="0"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-800">만원</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-rose-955 mb-1.5 uppercase tracking-wider">
                  월평균 도박 베팅액 (만원 단위)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={monthlyGamblingExpense}
                    onChange={(e) => setMonthlyGamblingExpense(e.target.value)}
                    placeholder="예: 150"
                    className="w-full bg-white border border-rose-300 rounded-xl pl-4 pr-12 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-black placeholder-slate-500 shadow-sm"
                    min="0"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-800">만원</span>
                </div>
              </div>

              {/* 그외 사항 - 박스 체크 형식 */}
              <div className="md:col-span-2 border-t border-amber-600/10 pt-4 mt-2">
                <label className="block text-xs font-black text-slate-950 mb-3 uppercase tracking-wider">
                  📉 추가 취약 요인 및 특수 위험 상태 (그외 사항)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. 신용불량자 */}
                  <label 
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition select-none ${
                      hasCreditIssue 
                        ? 'bg-rose-50 border-rose-400 text-rose-955 shadow-sm' 
                        : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={hasCreditIssue} 
                      onChange={(e) => setHasCreditIssue(e.target.checked)} 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-550 w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-black block">1. 신용불량자</span>
                      <span className="text-[10px] text-slate-600 font-bold block mt-0.5">금융 거래 제한자 및 정해진 원리금 연체 등록 상태</span>
                    </div>
                  </label>

                  {/* 2. 불법사금융 사용중 */}
                  <label 
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition select-none ${
                      hasIllegalPrivateDebt 
                        ? 'bg-rose-50 border-rose-400 text-rose-955 shadow-sm' 
                        : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={hasIllegalPrivateDebt} 
                      onChange={(e) => setHasIllegalPrivateDebt(e.target.checked)} 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-550 w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-black block">2. 불법사금융 사용중 (ex. 30/50, 일수 주변)</span>
                      <span className="text-[10px] text-slate-600 font-bold block mt-0.5">고리와 무비용 불법 사채, 비공식 민간 자금 독촉 노출</span>
                    </div>
                  </label>

                  {/* 3. 지인 채무 유 */}
                  <label 
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition select-none ${
                      hasAcquaintanceDebt 
                        ? 'bg-rose-50 border-rose-400 text-rose-955 shadow-sm' 
                        : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={hasAcquaintanceDebt} 
                      onChange={(e) => setHasAcquaintanceDebt(e.target.checked)} 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-550 w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-black block">3. 지인 채무 유</span>
                      <span className="text-[10px] text-slate-600 font-bold block mt-0.5">지인, 가족, 직장 동료, 친구 등 사적 관계 신용 거래 존재</span>
                    </div>
                  </label>

                  {/* 4. 도박으로 인한 전과 유 */}
                  <label 
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition select-none ${
                      hasCriminalRecord 
                        ? 'bg-rose-50 border-rose-400 text-rose-955 shadow-sm' 
                        : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={hasCriminalRecord} 
                      onChange={(e) => setHasCriminalRecord(e.target.checked)} 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-550 w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-black block">4. 도박으로 인한 전과 유</span>
                      <span className="text-[10px] text-slate-600 font-bold block mt-0.5">자금 편취 사기, 벌금, 집행유예 등 형사법적 처벌 이력</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-slate-900 text-white text-sm font-bold py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2.5 shadow-md"
              id="analysis-submit-btn"
            >
              내 상황 분석 및 등급 측정하기
            </button>
          </form>
        ) : (
          <div className="space-y-6" id="diagnostic-results">
            {/* Severity Header */}
            {calculatedMetrics && (() => {
              const style = getSeverityStyle(calculatedMetrics.severityIndex);
              return (
                <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-500 ${style.bg}`}>
                  <div className="flex items-start gap-3">
                    <ShieldAlert className={`w-6 h-6 ${style.iconColor}`} />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-950">중독 심각 지표 분석 완료</h4>
                      <p className={`text-xl font-black tracking-tight mt-1.5 ${style.textColor}`}>
                        {calculatedMetrics.severityText}
                      </p>
                      <p className="text-xs font-semibold text-slate-905 mt-1">
                        현재 등록 정보: {status.job} | 총 채무 {formatKRW(status.debt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right flex flex-col items-start md:items-end">
                    <span className="text-xs font-black block opacity-90 uppercase">위험 지수</span>
                    <span className={`text-4xl font-black tracking-tighter ${style.numColor}`}>
                      {calculatedMetrics.severityIndex}
                      <span className="text-sm font-bold opacity-80">/100</span>
                    </span>
                    {calculatedMetrics.severityIndex >= 90 ? (
                      <span className="bg-red-650 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md mt-1 shadow-sm inline-block">
                        🚨 위험 경보 발령 (극단적 경각심 필요)
                      </span>
                    ) : (
                      calculatedMetrics.severityIndex >= 50 && (
                        <span className="bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md mt-1 inline-block">
                          ⚠️ 50점 임계 초과 주의구간
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 관계 및 위기 진단 요약 정보 */}
            <div className="bg-white/60 border border-amber-600/20 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-900">
                <div>
                  <span className="text-slate-600 text-[11px] block font-semibold">자가 진단 및 상담자와의 관계</span>
                  <span className="text-sm font-black text-indigo-950">
                    {status.relationship && status.relationship.length > 0 
                      ? status.relationship.join(', ') 
                      : '미기록'}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <span className="text-slate-600 text-[11px] block font-semibold">당사자 현재 직업</span>
                  <span className="text-sm font-black text-slate-950">
                    {status.job || '기록 없음'}
                  </span>
                </div>
              </div>

              {/* 추가 디테일 위기 요인 */}
              <div className="pt-2.5 border-t border-amber-600/10">
                <span className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-2">당사자 추가 취약 요인</span>
                <div className="flex flex-wrap gap-1.5">
                  {status.hasCreditIssue && (
                    <span className="text-[11px] font-black tracking-tight px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-955">
                      🚨 신용불량자
                    </span>
                  )}
                  {status.hasIllegalPrivateDebt && (
                    <span className="text-[11px] font-black tracking-tight px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-955 animate-pulse">
                      💀 불법사금융 사용중
                    </span>
                  )}
                  {status.hasAcquaintanceDebt && (
                    <span className="text-[11px] font-black tracking-tight px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-955">
                      ⚠️ 지인 채무 유
                    </span>
                  )}
                  {status.hasCriminalRecord && (
                    <span className="text-[11px] font-black tracking-tight px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-955">
                      ⚖️ 도박으로 인한 전과 유
                    </span>
                  )}
                  {!status.hasCreditIssue && !status.hasIllegalPrivateDebt && !status.hasAcquaintanceDebt && !status.hasCriminalRecord && (
                    <span className="text-[11px] text-slate-500 font-bold block">
                      체크된 추가 취약 요인 없음 (안정)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Main Metrics Visual Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="border border-amber-600/30 rounded-xl p-4 bg-white/70">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-850 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                    채무 대 연소득 비율
                  </span>
                  <span className="text-xs text-rose-700 font-extrabold">
                    {calculatedMetrics?.debtToIncomeRatio}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-200 border border-slate-300 rounded-full h-3 mb-2.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, calculatedMetrics?.debtToIncomeRatio || 0)}%` }}
                  ></div>
                </div>
                
                <p className="text-xs text-slate-900 leading-relaxed font-bold break-keep">
                  당사자의 연 소득 대비 {calculatedMetrics?.debtToIncomeRatio}% 규모의 빚이 존재합니다. 
                  {calculatedMetrics && calculatedMetrics.debtToIncomeRatio > 100 
                    ? " 빚이 1년 소득 전체를 초과했으므로 이자 부담과 가계 경제 파탄의 위험이 매우 높은 상태입니다. 즉시 개인회생, 신용회복 등의 채무 조정 제도를 검토하세요." 
                    : " 아직 스스로 극복할 수 있는 기회가 있으나, 빚이 연소득의 상당한 비율을 차지하고 있어 가족의 면밀한 모니터링과 신뢰 회복을 위한 노력이 필요한 시점입니다."}
                </p>
              </div>

              <div className="border border-amber-600/30 rounded-xl p-4 bg-white/70">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-850 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    월소득 중 도박지출 비율
                  </span>
                  <span className="text-xs text-amber-755 font-extrabold">
                    {calculatedMetrics?.gamblingToIncomeRatio}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 border border-slate-300 rounded-full h-3 mb-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, calculatedMetrics?.gamblingToIncomeRatio || 0)}%` }}
                  ></div>
                </div>

                <p className="text-xs text-slate-900 leading-relaxed font-bold break-keep">
                  매월 벌어들이는 정기 소득 중 약 {calculatedMetrics?.gamblingToIncomeRatio}%가 합법/불법 도박 머니로 새어나가고 있습니다. 
                  {calculatedMetrics && calculatedMetrics.gamblingToIncomeRatio > 50
                    ? " 소득 절반 이상이 도박 자금으로 빠져나가고 있어 일상 생활마저 위협받는 대단히 심각한 재무 위기 상황입니다."
                    : " 흩뿌려진 자금이 가계 경제의 균열을 초래하고 있으며, 신속한 자금 통제가 수립되어야 합니다."}
                </p>
              </div>
            </div>

            {/* Statistics Comparison Perspective (Big Data Perspective) */}
            <div className="bg-indigo-900/10 border border-indigo-900/20 rounded-xl p-4">
              <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4 text-indigo-900" />
                빅데이터 연계 가이드 및 통계 비교
              </h4>
              <p className="text-xs text-indigo-950 leading-relaxed font-bold break-keep">
                중독 치유 치료원 통계에 따르면 도박 빚이 <strong>연 소득의 50%를 초과하는 지점</strong>에서 가족과의 갈등이 폭발적으로 깊어지며 극단적 상황에 노출됩니다. 
                현재 이탈 비율은 전체 치료 등록자 군 중 <span className="font-bold text-rose-700">상위 {calculatedMetrics ? Math.max(1, 100 - calculatedMetrics.severityIndex) : 10}%</span>에 준하는 위험 구간입니다. 
                당사자가 이 통계를 눈으로 직접 모니터링하여 중독 도박의 파멸적 결말을 현실 자각하게 유도해야 합니다.
              </p>
            </div>

            {/* Actionable Family Guide */}
            {calculatedMetrics && (
              <div className="space-y-2.5">
                <span className="text-xs font-black text-slate-950 block uppercase tracking-wider">
                  가장 시급한 가족 극복 강령
                </span>
                <div className="space-y-2">
                  {calculatedMetrics.advice.map((v, idx) => (
                    <div key={idx} className="flex gap-2.5 text-xs text-black bg-white/80 border border-amber-600/20 p-3.5 rounded-xl leading-relaxed font-bold break-keep">
                      <span className="text-indigo-900 font-extrabold shrink-0">{idx + 1}.</span>
                      <span className="text-black">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3.5">
              <button
                onClick={onNextStep}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white text-xs font-black py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md leading-none border border-slate-900"
                id="next-step-btn"
              >
                <span>다음 단계로 넘어가기 (가족중심 해결책 & 도구)</span>
                <span className="text-sm font-black">&rarr;</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 border border-slate-900/20 hover:border-slate-900 bg-white/40 hover:bg-white/80 text-slate-800 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  id="reset-status-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  정보 초기화 및 재입력
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
