import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { FilterBar } from '../components/FilterBar';
import { SortBar } from '../components/SortBar';
import { CompanyCard } from '../components/CompanyCard';
import type { Company, SortOption } from '../types/company';
import { fetchCompanies } from '../api/companyApi';
import { authManager } from '../auth/authManager';
import type { AuthState } from '../types/auth';
import './TopPage.css';

// 文字列/数値から数値を確実に抽出するヘルパー関数
const parseNumericValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const match = String(value).match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
};

export const TopPage: React.FC = () => {
  // === State管理 ===
  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false, isLoggedIn: false, user: null, lineUserId: null, isFriend: false, error: null,
  });
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // フィルター・ソートのState
  const [filters, setFilters] = useState({
    selectedIndustries: [] as string[],
    femaleRatioFilter: false,
    relocationFilter: false,
    specialLeaveFilter: false,
    housingAllowanceFilter: false,
  });
  const [sort, setSort] = useState<{ key: SortOption; order: 'asc' | 'desc' }>({
    key: 'starting_salary_graduates',
    order: 'desc',
  });

  // === 初期化処理 ===
  useEffect(() => {
    const initApp = async () => {
      const state = await authManager.initialize();
      setAuthState(state);

      if (state.isInitialized && !state.error) {
        try {
          const data = await fetchCompanies({ line_user_id: state.lineUserId });
          setAllCompanies(data);
        } catch (err) {
          setApiError('企業データの読み込みに失敗しました。');
        }
      }
      setIsLoading(false);
    };
    initApp();
  }, []);

  // === データ加工処理 (useMemo) ===
  const displayedCompanies = useMemo(() => {
    let processed = [...allCompanies];

    // フィルター処理
    const { selectedIndustries, femaleRatioFilter, relocationFilter, specialLeaveFilter, housingAllowanceFilter } = filters;
    if (selectedIndustries.length > 0) {
      processed = processed.filter(c => selectedIndustries.includes(c.industry));
    }
    if (femaleRatioFilter) {
      processed = processed.filter(c => (c.gender_ratio.match(/女性:(\d+)%/) || [])[1] >= '30');
    }
    if (relocationFilter) processed = processed.filter(c => c.relocation === 'なし');
    if (specialLeaveFilter) processed = processed.filter(c => c.special_leave === 'あり');
    if (housingAllowanceFilter) processed = processed.filter(c => c.housing_allowance === 'あり');

    // ソート処理
    processed.sort((a, b) => {
      const valA = parseNumericValue(a[sort.key]);
      const valB = parseNumericValue(b[sort.key]);
      return sort.order === 'asc' ? valA - valB : valB - valA;
    });

    return processed;
  }, [allCompanies, filters, sort]);

  // === イベントハンドラ ===
  const handleSortChange = (key: SortOption, order: 'asc' | 'desc') => setSort({ key, order });

  // === レンダリング ===
  const isUserRestricted = !authState.isLoggedIn || !authState.isFriend;

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-container"><div className="loading-spinner"></div><p className="loading-text">データを読み込んでいます...</p></div>;
    }
    if (authState.error) return <div className="error-container"><p className="error-message">{authState.error}</p></div>;
    if (apiError) return <div className="error-container"><p className="error-message">{apiError}</p></div>;
    if (authState.isLoggedIn && !authState.isFriend) {
      return (
        <div className="registration-prompt">
          <div className="prompt-content">
            <h3>全コンテンツの閲覧には</h3>
            <p>LINE公式アカウントの友だち追加が必要です。追加後、再度アクセスしてください。</p>
            <a href="https://line.me/R/ti/p/YOUR_OFFICIAL_ACCOUNT_ID" className="register-button" style={{ textDecoration: 'none' }}>
              LINEで友だち追加する
            </a>
          </div>
        </div>
      );
    }
    if (displayedCompanies.length === 0) {
      return <div className="no-results"><p>該当する企業が見つかりませんでした。</p></div>;
    }
    return (
      <div className="companies-list">
        {displayedCompanies.map((company, index) => (
          <CompanyCard
            key={company.id}
            company={company}
            displayRank={index + 1}
            isRestricted={isUserRestricted && index >= 3}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="top-page">
      <Header user={authState.user} isLoggedIn={authState.isLoggedIn} />
      <HeroSection />
      <main className="main-content">
        <div className="container">
          {authState.isLoggedIn && authState.isFriend && (
            <>
              <FilterBar
                selectedIndustries={filters.selectedIndustries}
                femaleRatioFilter={filters.femaleRatioFilter}
                relocationFilter={filters.relocationFilter}
                specialLeaveFilter={filters.specialLeaveFilter}
                housingAllowanceFilter={filters.housingAllowanceFilter}
                onIndustryChange={(v) => setFilters(f => ({ ...f, selectedIndustries: v }))}
                onFemaleRatioChange={(v) => setFilters(f => ({ ...f, femaleRatioFilter: v }))}
                onRelocationChange={(v) => setFilters(f => ({ ...f, relocationFilter: v }))}
                onSpecialLeaveChange={(v) => setFilters(f => ({ ...f, specialLeaveFilter: v }))}
                onHousingAllowanceChange={(v) => setFilters(f => ({ ...f, housingAllowanceFilter: v }))}
              />
              <SortBar
                currentSort={sort.key}
                sortOrder={sort.order}
                totalCount={displayedCompanies.length}
                onSortChange={handleSortChange}
              />
            </>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};