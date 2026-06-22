/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Landmark, 
  PhoneCall, 
  Globe, 
  BookOpen, 
  ArrowUpRight,
  Tv,
  Sparkles,
  Link2,
  Mail,
  MessageCircle
} from 'lucide-react';

export default function SupportGroups() {
  return (
    <div className="bg-[#f0ad73] border border-[#d8975e] rounded-2xl p-4 sm:p-6 shadow-xl text-black flex flex-col h-full animate-fadeIn" id="support-groups-section">
      
      {/* Header section */}
      <div className="mb-6" id="support-groups-header">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 flex items-center gap-2 mb-2">
          <Landmark className="w-6 h-6 text-indigo-950 shrink-0" />
          공인 치유 전문가 및 전문 기관 도움받기
        </h3>
        <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-bold">
          도박 문제는 혼자 안고 침묵하면 반드시 더 큰 위기로 이어집니다. 아래의 신뢰도 높은 예방 치유 전문 기관들과 추천 유용한 치유 콘텐츠를 만나보세요.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-6" id="support-groups-content-list">
        


        {/* 1. Box 1: Red Styled (한국도박문제예방치유원) */}
        <div className="border-2 border-red-200 rounded-3xl p-5 bg-red-50/90 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between" id="box-kcgp-red">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg shrink-0 select-none">🟥</span>
              <h4 className="text-base font-black text-red-950 tracking-tight font-extrabold">한국도박문제예방치유원</h4>
            </div>
            
            {/* Verbatim details */}
            <div className="space-y-2 mt-2">
              <div className="text-xs text-red-950 font-bold leading-relaxed flex items-start gap-2">
                <span className="text-red-600 shrink-0 select-none">👉</span>
                <span>전국 단위의 공식 기관으로, 도박 문제 상담 및 치료 연계를 지원합니다.</span>
              </div>
              
              {/* Comment / Quote speech bubble style */}
              <div className="bg-red-100/60 border border-red-200/50 rounded-xl p-3 mt-3 text-xs text-red-950 font-semibold leading-relaxed flex items-start gap-1.5 italic">
                <span className="text-red-600 shrink-0 select-none">💬</span>
                <span>“지금 당장 상황이 급하거나 혼자 감당이 어렵다면 가장 먼저 연결해볼 수 있는 곳입니다.”</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5 pt-3.5 border-t border-red-200/60 font-bold text-xs">
            <a
              href="https://www.kcgp.or.kr/portal/main/main.do"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-red-900 text-white rounded-xl text-center hover:bg-red-950 transition duration-150 flex items-center justify-center gap-1.5 shadow-sm"
              id="link-kcgp-portal"
            >
              <Globe className="w-3.5 h-3.5" />
              한국도박문제예방치유원
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://blog.naver.com/kcgp1336"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-red-100 border border-red-300 text-red-950 rounded-xl text-center hover:bg-red-200 transition duration-150 flex items-center justify-center gap-1.5 shadow-sm"
              id="link-kcgp-blog"
            >
              <BookOpen className="w-3.5 h-3.5 text-red-900" />
              블로그 (한국도박문제예방치유원)
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="tel:1336"
              className="px-3 py-2.5 bg-red-500/25 border border-red-300 text-red-950 rounded-xl text-center hover:bg-red-550 transition duration-150 flex items-center justify-center gap-1.5"
              id="link-kcgp-phone"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-900" />
              📞 1336 (도박문제 상담전화)
            </a>
          </div>
        </div>

        {/* 2. Box 2: Orange Styled (보건복지부) */}
        <div className="border-2 border-orange-200 rounded-3xl p-5 bg-orange-50/90 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between" id="box-mohw-orange">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg shrink-0 select-none">🟧</span>
              <h4 className="text-base font-black text-orange-950 tracking-tight font-extrabold">보건복지부 / 지역 중독관리통합지원센터</h4>
            </div>
            
            {/* Verbatim details */}
            <div className="space-y-2 mt-2">
              <div className="text-xs text-orange-950 font-bold leading-relaxed flex items-start gap-2">
                <span className="text-orange-600 shrink-0 select-none">👉</span>
                <span>각 지역에서 운영되는 공공 지원기관으로 정신건강, 중독 문제 전반을 함께 지원합니다.</span>
              </div>
              
              <div className="bg-orange-100/60 border border-orange-200/50 rounded-xl p-3 mt-3 text-xs text-orange-950 font-semibold leading-relaxed flex items-start gap-1.5 italic">
                <span className="text-orange-600 shrink-0 select-none">💬</span>
                <span>“도박 문제는 단순한 습관이 아니라 ‘중독’으로 접근해야 하는 경우가 많습니다.”</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="grid grid-cols-1 gap-2 mt-5 pt-3.5 border-t border-orange-200/60 font-bold text-xs">
            <a
              href="https://www.mohw.go.kr/menu.es?mid=a10706040400"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-orange-700 text-white rounded-xl text-center hover:bg-orange-850 transition duration-150 flex items-center justify-center gap-1.5 shadow-sm"
              id="link-mohw-portal"
            >
              <Globe className="w-3.5 h-3.5" />
              보건복지부 중독관리통합지원센터 안내
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 3. Box 3: Yellow Styled (민간 지원) */}
        <div className="border-2 border-amber-200 rounded-3xl p-5 bg-amber-50/90 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between" id="box-private-yellow">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg shrink-0 select-none">🟨</span>
              <h4 className="text-base font-black text-amber-950 tracking-tight font-extrabold">민간 지원 (한국도박중독치유센터)</h4>
            </div>
            
            {/* Verbatim details */}
            <div className="space-y-2 mt-2">
              <div className="text-xs text-amber-950 font-bold leading-relaxed flex items-start gap-2">
                <span className="text-amber-650 shrink-0 select-none">👉</span>
                <span>민간에서 운영되는 상담 및 회복 지원 프로그램입니다.</span>
              </div>
              
              <div className="bg-amber-100/60 border border-amber-200/50 rounded-xl p-3 mt-3 text-xs text-amber-950 font-semibold leading-relaxed flex items-start gap-1.5 italic">
                <span className="text-amber-650 shrink-0 select-none">💬</span>
                <span>“공공기관과 함께 병행해서 도움을 받을 수 있는 선택지입니다.”</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 pt-3.5 border-t border-amber-200/60 font-bold text-xs">
            <a
              href="https://www.kgatc2025.com/program"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-amber-700 text-white rounded-xl text-center hover:bg-amber-850 transition duration-150 flex items-center justify-center gap-1.5 shadow-sm"
              id="link-private-program"
            >
              <Globe className="w-3.5 h-3.5" />
              한국도박중독치유센터 프로그램
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://blog.naver.com/skstlstjdqja/224128020224"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 bg-amber-100 border border-amber-300 text-amber-950 rounded-xl text-center hover:bg-amber-200 transition duration-150 flex items-center justify-center gap-1.5 shadow-sm"
              id="link-private-blog"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-900" />
              관련 블로그 정보
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* YouTube & Webtoon Referral Content */}
        <div className="space-y-4 pt-3" id="contents-media-section">
          <span className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-indigo-950" />
            가족을 위한 핵심 추천 콘텐츠 (웹툰 & 영상)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Media Item 1 */}
            <a 
              href="https://www.youtube.com/watch?v=VKz5p5WF3xs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="border border-slate-300/60 rounded-xl p-4 bg-white/95 hover:bg-white transition duration-150 flex flex-col justify-between shadow-sm cursor-pointer hover:border-indigo-500 group"
              id="media-youtube-advice-family"
            >
              <div>
                <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 border border-rose-350 text-rose-800 rounded inline-block mb-2 group-hover:bg-rose-200 transition-colors">
                  유튜브 영상
                </span>
                <h5 className="text-[11.5px] font-black text-slate-950 leading-snug tracking-tight">
                  도박 중독자의 가족은 어떤 태도를 취해야 할까?
                </h5>
                <p className="text-[10px] text-slate-650 font-bold mt-1.5 leading-relaxed">
                  중독자의 변화를 끌어내기 위한 가족의 올바른 정서적 태도와 대처 방안을 수록한 전문 조언 영상입니다.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-950 mt-4 pt-2 border-t border-slate-100/60 flex items-center justify-end gap-1">
                영상 시청하기 <Link2 className="w-3 h-3 text-indigo-950" />
              </span>
            </a>

            {/* Media Item 2 */}
            <a 
              href="https://webtoon.kakao.com/content/%EB%8F%84%EB%B0%95%EC%A4%91%EB%8F%85%EC%9E%90%EC%9D%98-%EA%B0%80%EC%A1%B1/2719?tab=episode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="border border-slate-300/60 rounded-xl p-4 bg-white/95 hover:bg-white transition duration-150 flex flex-col justify-between shadow-sm cursor-pointer hover:border-indigo-500 group"
              id="media-webtoon-gambler-family"
            >
              <div>
                <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 rounded inline-block mb-2 group-hover:bg-amber-200 transition-colors">
                  카카오 웹툰
                </span>
                <h5 className="text-[11.5px] font-black text-slate-950 leading-snug tracking-tight">
                  도박중독자의 가족(웹툰)
                </h5>
                <p className="text-[10px] text-slate-650 font-bold mt-1.5 leading-relaxed">
                  도박이 가져오는 가정 붕괴와 극복을 향한 눈물겨운 여정을 깊이 있고 현실감 있게 풀어낸 연재 웹툰입니다.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-950 mt-4 pt-2 border-t border-slate-100/60 flex items-center justify-end gap-1">
                웹툰 보러가기 <Link2 className="w-3 h-3 text-indigo-950" />
              </span>
            </a>

            {/* Media Item 3 */}
            <a 
              href="https://www.youtube.com/watch?v=qpT0WyJGAjs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="border border-slate-300/60 rounded-xl p-4 bg-white/95 hover:bg-white transition duration-150 flex flex-col justify-between shadow-sm cursor-pointer hover:border-indigo-500 group"
              id="media-youtube-uquiz-gambling"
            >
              <div>
                <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 border border-rose-350 text-rose-800 rounded inline-block mb-2 group-hover:bg-rose-200 transition-colors">
                  유퀴즈 유튜브
                </span>
                <h5 className="text-[11.5px] font-black text-slate-950 leading-snug tracking-tight">
                  유퀴즈 도박중독 편
                </h5>
                <p className="text-[10px] text-slate-650 font-bold mt-1.5 leading-relaxed">
                  치료 전문 교수가 이야기하는 눈이 멀어버린 뇌 호르몬 원리와, 절체절명의 위기에서 벗어나기 위한 조언을 담은 대담입니다.
                </p>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-950 mt-4 pt-2 border-t border-slate-100/60 flex items-center justify-end gap-1">
                영상 시청하기 <Link2 className="w-3 h-3 text-indigo-950" />
              </span>
            </a>

          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/60 p-4 rounded-xl text-center text-xs text-amber-950 font-bold leading-relaxed" id="footer-greetings-box">
          <p className="mb-1 text-slate-800">이 페이지의 정보는 치료를 대신하지 않으며, 참고용 정보 제공을 목적으로 합니다.</p>
          <p className="text-orange-600 font-extrabold">
            필요한 경우 반드시 전문 상담기관의 도움을 받으시기 바랍니다.
          </p>
        </div>

      </div>
    </div>
  );
}
