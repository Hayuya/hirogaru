import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { LineUserDetailForm } from '../components/LineUserDetailForm';
import { createLineUserDetail, getLineUserDetail } from '../api/lineUserDetailApi';
import { logLineAction } from '../api/lineActionApi';

const SORT_LABEL_MAP: Record<SortOption, string> = {
  starting_salary_graduates: '初任給',
  revenue: '売上高',
  number_of_employees: '従業員数',
  average_overtime_hours: '残業時間',
  average_years_of_service: '平均勤続年数',
  average_age: '平均年齢',
};

const OTHER_FILTER_LABEL_MAP: Record<'femaleRatio' | 'relocation' | 'specialLeave' | 'housingAllowance', string> = {
  femaleRatio: '女性比率30%以上',
  relocation: '転勤なし',
  specialLeave: '特別休暇あり',
  housingAllowance: '住宅手当あり',
};

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
  const [detailState, setDetailState] = useState<'idle' | 'loading' | 'show-form' | 'hidden' | 'error'>('idle');
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);
  const [detailSuccessMessage, setDetailSuccessMessage] = useState<string | null>(null);
  const [isSubmittingDetail, setIsSubmittingDetail] = useState(false);
  const originalOverflowRef = useRef<string | null>(null);

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
  const isDetailGateActive = detailState === 'loading' || detailState === 'show-form' || detailState === 'error';

  const loadLineUserDetail = useCallback(async (lineUserId: string) => {
    setDetailState('loading');
    setDetailErrorMessage(null);
    try {
      const detail = await getLineUserDetail(lineUserId);
      if (detail) {
        setDetailState('hidden');
      } else {
        setDetailState('show-form');
      }
    } catch (error) {
      console.error('Failed to load line user detail', error);
      setDetailErrorMessage('登録情報の取得に失敗しました。しばらく時間をおいて再度お試しください。');
      setDetailState('error');
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isDetailGateActive) {
      if (originalOverflowRef.current === null) {
        originalOverflowRef.current = document.body.style.overflow;
      }
      document.body.style.overflow = 'hidden';
    } else if (originalOverflowRef.current !== null) {
      document.body.style.overflow = originalOverflowRef.current;
      originalOverflowRef.current = null;
    }

    return () => {
      if (originalOverflowRef.current !== null) {
        document.body.style.overflow = originalOverflowRef.current;
        originalOverflowRef.current = null;
      }
    };
  }, [isDetailGateActive]);

  // === 初期化処理 ===
  useEffect(() => {
    const initApp = async () => {
      const state = await authManager.initialize();
      setAuthState(state);
      setDetailSuccessMessage(null);

      if (state.isInitialized && !state.error) {
        try {
          const data = await fetchCompanies({ line_user_id: state.lineUserId });
          setAllCompanies(data);
        } catch (err) {
          setApiError('企業データの読み込みに失敗しました。');
        }

        if (state.lineUserId) {
          void loadLineUserDetail(state.lineUserId);
        } else {
          setDetailState('hidden');
        }
      } else {
        setDetailState('hidden');
      }
      setIsLoading(false);
    };
    initApp();
  }, [loadLineUserDetail]);

  // === データ加工処理 (useMemo) ===
  const displayedCompanies = useMemo(() => {
    let processed = [...allCompanies];

    // フィルター処理
    const { selectedIndustries, femaleRatioFilter, relocationFilter, specialLeaveFilter, housingAllowanceFilter } = filters;
    if (selectedIndustries.length > 0) {
      processed = processed.filter(c => selectedIndustries.includes(c.industry));
    }
    if (femaleRatioFilter) {
      processed = processed.filter(c => {
        const match = c.gender_ratio.match(/女性:(\d+)%/);
        const ratio = match ? parseInt(match[1], 10) : 0;
        return ratio >= 30;
      });
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
  const handleSortChange = useCallback((key: SortOption, order: 'asc' | 'desc') => {
    setSort({ key, order });

    if (!authState.lineUserId) return;

    const label = SORT_LABEL_MAP[key] ?? key;
    const actionName = `button_click_sort-${label}`;
    void logLineAction({ lineUserId: authState.lineUserId, actionName });
  }, [authState.lineUserId]);

  const handleDetailSubmit = async ({
    university,
    faculty,
    department,
    hometown,
  }: {
    university: string;
    faculty: string;
    department: string | null;
    hometown: string | null;
  }) => {
    if (!authState.lineUserId) {
      setDetailErrorMessage('LINEユーザーIDを取得できませんでした。');
      return;
    }

    setIsSubmittingDetail(true);
    setDetailErrorMessage(null);

    try {
      await createLineUserDetail({
        line_user_id: authState.lineUserId,
        university,
        faculty,
        department,
        hometown,
      });
      setDetailErrorMessage(null);
      setDetailSuccessMessage('登録が完了しました。ありがとうございます。');
      setDetailState('hidden');
    } catch (error) {
      console.error('Failed to submit line user detail', error);
      setDetailErrorMessage('登録に失敗しました。お手数ですが、再度お試しください。');
    } finally {
      setIsSubmittingDetail(false);
    }
  };

  const handleRetryDetailFetch = () => {
    if (authState.lineUserId) {
      void loadLineUserDetail(authState.lineUserId);
    }
  };

  const handleCompanyDetailView = useCallback((company: Company) => {
    if (!authState.lineUserId) return;

    const actionName = `button_click-${company.company_name}`;
    void logLineAction({ lineUserId: authState.lineUserId, actionName });
  }, [authState.lineUserId]);

  const handleIndustryFilterClick = useCallback((industry: string, _willSelect: boolean) => {
    if (!authState.lineUserId) return;

    const actionName = `button_click_gyokai_category-${industry}`;
    void logLineAction({ lineUserId: authState.lineUserId, actionName });
  }, [authState.lineUserId]);

  const handleOtherFilterClick = useCallback((filterKey: 'femaleRatio' | 'relocation' | 'specialLeave' | 'housingAllowance', _willSelect: boolean) => {
    if (!authState.lineUserId) return;

    const label = OTHER_FILTER_LABEL_MAP[filterKey];
    const actionName = `button_click_others${label}`;
    void logLineAction({ lineUserId: authState.lineUserId, actionName });
  }, [authState.lineUserId]);

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
            onViewDetails={handleCompanyDetailView}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="top-page">
      {isDetailGateActive && (
        <div className="line-user-detail-overlay">
          {detailState === 'show-form' && authState.lineUserId ? (
            <LineUserDetailForm
              onSubmit={handleDetailSubmit}
              isSubmitting={isSubmittingDetail}
              errorMessage={detailErrorMessage}
            />
          ) : (
            <div className="line-user-detail-panel">
              {detailState === 'loading' && <p className="panel-message">登録情報を確認しています…</p>}
              {detailState === 'error' && (
                <>
                  <h2>登録情報の取得に失敗しました</h2>
                  <p className="panel-message">{detailErrorMessage ?? 'しばらく時間をおいて再度お試しください。'}</p>
                  <button type="button" onClick={handleRetryDetailFetch}>
                    再試行する
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <Header />
      <HeroSection />
      <main className="main-content">
        <div className="container">
          {detailSuccessMessage && (
            <div className="line-user-detail-success">
              <p>{detailSuccessMessage}</p>
            </div>
          )}

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
                onIndustryClick={handleIndustryFilterClick}
                onOtherFilterClick={handleOtherFilterClick}
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
