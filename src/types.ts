/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GamblerStatus {
  job: string;
  debt: number;
  monthlyIncome: number;
  monthlyGamblingExpense: number;
  lastBetDate?: string;
  notes?: string;
  hasEntered: boolean;
  relationship?: string[];
  hasCreditIssue?: boolean;
  hasIllegalPrivateDebt?: boolean;
  hasAcquaintanceDebt?: boolean;
  hasCriminalRecord?: boolean;
}

export type PayoutPeriod = 'daily' | 'weekly';

export interface SalaryManagement {
  isManagedByFamily: boolean;
  payoutPeriod: PayoutPeriod;
  payoutAmount: number;
  payoutTime: string; // "HH:MM" format
  payoutDayOfWeek: number; // 0-6 (0: 일요일, ~ 6: 토요일)
  allowNotification: boolean;
  checkedDates?: string[]; // (추가) 생활비 이체 완료일 YYYY-MM-DD
}

export interface DayChallenge {
  days: number;
  title: string;
  rewardDescription: string;
  isRewarded: boolean;
}

export interface NoGamblingCalendar {
  startDate: string; // YYYY-MM-DD
  checkedDates: string[]; // YYYY-MM-DD 형식으로 체크된 무도박 일수
  challenges: DayChallenge[];
}

export interface AcquaintanceDebt {
  id: string;
  name: string;
  amount: number;
  monthlyPay: number;
  note: string;
}

export interface RepaymentLog {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // 만원 단위
  notes: string;
  type?: 'gambler' | 'family' | 'acquaintance';
  targetId?: string; // Optional reference to acquaintance debt id
}

export interface DebtTracker {
  // 1. 당사자의 채무액
  gamblerTotalDebt: number;
  gamblerMonthlyRepayment: number;
  gamblerAlreadyPaid: number;

  // 2. 가족의 채무 (대신 갚아준 금액 및 급여 차감 기록)
  familyPaidTotal: number;
  familyThisMonthDeducted: number;
  familyLastMonthDeducted: number;
  familyAccumulatedDeducted: number;

  // 3. 주변지인 채무
  acquaintanceDebts: AcquaintanceDebt[];

  // 4. 상환 내역 기록 (캘린더에 표시용)
  repaymentHistory?: RepaymentLog[];
}

export interface BehaviorChecklistState {
  checkedIds: number[];
  checkedDate: string; // YYYY-MM-DD
}

