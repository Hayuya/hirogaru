import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  base_salary: '基本給',
  revenue: '売上高',
  number_of_employees: '従業員数',
  average_overtime_hours: '残業時間',
  average_years_of_service: '平均勤続年数',
  average_age: '平均年齢',
};

const OTHER_FILTER_LABEL_MAP = {
  relocation: '転勤なし',
  specialLeave: '特別休暇あり',
  housingAllowance: '住宅手当あり',
  remoteWork: 'リモートワーク可',
  flextime: 'フレックスタイム制',
  qualificationSupport: '資格取得支援あり',
};

const isTruthy = (value: any): boolean => {
    const strValue = String(value).toLowerCase();
    return strValue === 'true' || strValue === '1' || strValue === 'あり';
}

// 文字列/数値から数値を確実に抽出するヘルパー関数
const parseNumericValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const match = String(value).match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
};

interface TopPageProps {
  authState: AuthState;
}

export const TopPage: React.FC<TopPageProps> = ({ authState }) => {
  // === State管理 ===
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
    relocation: false,
    housingAllowance: false,
    remoteWork: false,
    flextime: false,
    specialLeave: false,
    qualificationSupport: false,
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
      setDetailSuccessMessage(null);

      if (authState.isInitialized && !authState.error) {
        setIsLoading(true);
        try {
          const data = await fetchCompanies({ line_user_id: authState.lineUserId });
          setAllCompanies(data);
        } catch (err) {
          setApiError('企業データの読み込みに失敗しました。');
        } finally {
          setIsLoading(false);
        }

        if (authState.lineUserId) {
          void loadLineUserDetail(authState.lineUserId);
        } else {
          setDetailState('hidden');
        }
      } else if (authState.isInitialized) {
        setDetailState('hidden');
        setIsLoading(false);
      }
    };
    initApp();
  }, [loadLineUserDetail, authState]);

  // === データ加工処理 (useMemo) ===
  const displayedCompanies = useMemo(() => {
    let processed = [...allCompanies];

    // フィルター処理
    if (filters.selectedIndustries.length > 0) {
      processed = processed.filter(c => filters.selectedIndustries.includes(c.industry));
    }
    if (filters.relocation) processed = processed.filter(c => c.relocation === 'なし');
    if (filters.specialLeave) processed = processed.filter(c => isTruthy(c.special_leave));
    if (filters.housingAllowance) processed = processed.filter(c => isTruthy(c.housing_allowance));
    if (filters.remoteWork) processed = processed.filter(c => isTruthy(c.remote_work));
    if (filters.flextime) processed = processed.filter(c => isTruthy(c.flextime));
    if (filters.qualificationSupport) processed = processed.filter(c => isTruthy(c.qualification_support));


    // ソート処理
    processed.sort((a, b) => {
      const valA = parseNumericValue(a[sort.key]);
      const valB = parseNumericValue(b[sort.key]);
      return sort.order === 'asc' ? valA - valB : valB - valA;
    });

    return processed;
  }, [allCompanies, filters, sort]);

  // === イベントハンドラ ===
  const handleLogin = () => {
    authManager.login();
  };

  const handleSortChange = useCallback((key: SortOption, order: 'asc' | 'desc') => {
    setSort({ key, order });

    if (!authState.lineUserId) return;

    const label = SORT_LABEL_MAP[key] ?? key;
    const actionName = `button_click_sort-${label}`;
    void logLineAction({ lineUserId: authState.lineUserId, actionName });
  }, [authState.lineUserId]);
  
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };


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

  const handleOtherFilterClick = useCallback((filterKey: keyof typeof OTHER_FILTER_LABEL_MAP, _willSelect: boolean) => {
    if (!authState.lineUserId) return;

    const label = OTHER_FILTER_LABEL_MAP[filterKey];
    const actionName = `button_click_others${label}`;
    void logLineAction({ lineUserId: authState.lineUserId, actionName });
  }, [authState.lineUserId]);

  // === レンダリング ===
  const shouldLockContent = !authState.isLoggedIn || !authState.isFriend;

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
      <HeroSection />
      <main className="main-content">
        <div className="container">
          {detailSuccessMessage && (
            <div className="line-user-detail-success">
              <p>{detailSuccessMessage}</p>
            </div>
          )}
          
          {authState.isLoggedIn && (
            <>
              <FilterBar
                selectedIndustries={filters.selectedIndustries}
                filters={{
                    relocation: filters.relocation,
                    housingAllowance: filters.housingAllowance,
                    remoteWork: filters.remoteWork,
                    flextime: filters.flextime,
                    specialLeave: filters.specialLeave,
                    qualificationSupport: filters.qualificationSupport,
                }}
                onIndustryChange={(v) => handleFilterChange('selectedIndustries', v)}
                onFilterChange={handleFilterChange as any}
                onIndustryClick={handleIndustryFilterClick}
                onOtherFilterClick={handleOtherFilterClick as any}
              />
              <SortBar
                currentSort={sort.key}
                sortOrder={sort.order}
                totalCount={displayedCompanies.length}
                onSortChange={handleSortChange}
              />
            </>
          )}

          {authState.isLoggedIn && !authState.isFriend && (
            <div className="registration-prompt">
              <div className="prompt-content">
                <h3>すべての企業情報を見るには</h3>
                <p>LINE公式アカウントを友だち追加し、そのLINEアカウントでログインしてください。すべての企業情報が閲覧可能になります。</p>
                <a href="https://lin.ee/eiuBq0X" className="register-button" style={{ textDecoration: 'none' }}>
                  LINEで友だち追加する
                </a>
              </div>
            </div>
          )}

          {(!authState.isInitialized || isLoading) ? (
            <div className="loading-container"><div className="loading-spinner"></div><p className="loading-text">データを読み込んでいます...</p></div>
          ) : authState.error ? (
            <div className="error-container"><p className="error-message">{authState.error}</p></div>
          ) : apiError ? (
            <div className="error-container"><p className="error-message">{apiError}</p></div>
          ) : (
            <>
              {displayedCompanies.length === 0 ? (
                <div className="no-results"><p>該当する企業が見つかりませんでした。</p></div>
              ) : (
                <div className="companies-list">
                  {displayedCompanies.map((company, index) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      displayRank={index + 1}
                      isRestricted={false}
                      onViewDetails={handleCompanyDetailView}
                    />
                  ))}
                </div>
              )}

              
              {shouldLockContent && (
                <div id="login-prompt" className="login-prompt">
                  <div className="prompt-content">
                    <h3>全企業の詳細情報を閲覧するには</h3>
                    {!authState.isLoggedIn ? (
                      <>
                        <p>
                          すべての企業情報をご覧いただくには、LINE公式アカウントの友だち追加と、そのアカウントでのログインが必要です。
                          <br />
                          まずはLINEで友だち追加後、ログインをお願いします。
                        </p>
                        <div className="prompt-buttons">
                          <a href="https://lin.ee/eiuBq0X" className="add-friend-button-main" target="_blank" rel="noopener noreferrer">
                            LINEで友だち追加
                          </a>
                          <button onClick={handleLogin} className="login-button">
                            LINEアカウントでログイン
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>
                          ログインありがとうございます。あと一歩です！
                          <br />
                          現在ログイン中のLINEアカウントで、私たちの公式アカウントを友だち追加してください。
                          <br />
                          追加後、このページを再読み込み（リロード）すると、すべての情報が表示されます。
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};