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
import { type ChartStats } from '../components/TriangleChart';
import { SortNotification } from '../components/SortNotification';

const SORT_LABEL_MAP: Record<SortOption, string> = {
  attractionScore: '総合魅力度',
  starting_salary_graduates: '初任給',
  revenue: '売上高',
  number_of_employees: '従業員数',
  average_years_of_service: '平均勤続年数',
  average_age: '平均年齢',
  annual_holidays: '年間休日',
  average_paid_leave_days: '平均有給取得日数',
};

const OTHER_FILTER_LABEL_MAP = {
  relocation: '転勤なし',
  specialLeave: '特別休暇あり',
  housingAllowance: '住宅手当あり',
  remoteWork: 'リモートワーク可',
  flextime: 'フレックスタイム制',
  fixedOvertimeSystem: '固定残業代なし',
};

const isTruthy = (value: any): boolean => {
    const strValue = String(value).toLowerCase();
    return strValue === 'true' || strValue === '1' || strValue === 'あり';
}

// 文字列/数値から数値を確実に抽出するヘルパー関数
const parseNumericValue = (value: string | number | null | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const match = String(value).match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
};

// 統計情報（平均・標準偏差）を計算するヘルパー関数
const calculateStats = (data: number[]) => {
  if (data.length === 0) return { mean: 0, stdDev: 1 };
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const stdDev = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / data.length);
  return { mean, stdDev: stdDev === 0 ? 1 : stdDev }; // ゼロ除算を避ける
};

const calculateScore = (value: number, mean: number, stdDev: number): number => {
    const zScore = stdDev === 0 ? 0 : (value - mean) / stdDev;
    const clampedZ = Math.max(-1.5, Math.min(1.5, zScore));
    const normalized = (clampedZ + 1.5) / 3;
    return 20 + normalized * 80;
};

const scoreToRating = (score: number): number => {
    return Math.min(5, Math.max(1, Math.round(score / 20)));
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
  const [visibleCount, setVisibleCount] = useState(5);
  const filterRef = useRef<HTMLDivElement>(null); // スクロールターゲット用のref

  // フィルター・ソート・検索のState
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    selectedIndustries: [] as string[],
    relocation: false,
    housingAllowance: false,
    remoteWork: false,
    flextime: false,
    specialLeave: false,
    fixedOvertimeSystem: false,
  });
  const [sort, setSort] = useState<{ key: SortOption; order: 'asc' | 'desc' }>({
    key: 'attractionScore',
    order: 'desc',
  });
  const [notification, setNotification] = useState<{ key: number; message: string }>({ key: 0, message: '' });
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

  // チャート用の統計データを計算
  const chartStats: ChartStats = useMemo(() => {
    if (allCompanies.length === 0) {
      return {
        salary: { mean: 200000, stdDev: 1 },
        employees: { mean: 1, stdDev: 1 },
        holidays: { mean: 120, stdDev: 1 },
      };
    }

    const salaries = allCompanies.map(c => parseNumericValue(c.base_salary)).filter(v => v > 0);
    const logEmployees = allCompanies.map(c => c.number_of_employees).filter(v => v > 0).map(v => Math.log10(v));
    const holidays = allCompanies.map(c => c.annual_holidays).filter(v => v > 0);

    return {
      salary: calculateStats(salaries),
      employees: calculateStats(logEmployees),
      holidays: calculateStats(holidays),
    };
  }, [allCompanies]);


  // === データ加工処理 (useMemo) ===
  const companiesWithScores = useMemo(() => {
    if (!allCompanies.length || !chartStats) return [];

    return allCompanies.map(company => {
      const salaryValue = parseNumericValue(company.base_salary);
      const employeesValue = company.number_of_employees;
      const holidaysValue = company.annual_holidays;

      const isPrivateSalary = salaryValue <= 0;
      const isPrivateEmployees = employeesValue <= 0;
      const isPrivateHolidays = holidaysValue <= 0;

      const scores = {
        salary: isPrivateSalary ? 60 : calculateScore(salaryValue, chartStats.salary.mean, chartStats.salary.stdDev),
        employees: isPrivateEmployees ? 60 : calculateScore(Math.log10(employeesValue), chartStats.employees.mean, chartStats.employees.stdDev),
        holidays: isPrivateHolidays ? 60 : calculateScore(holidaysValue, chartStats.holidays.mean, chartStats.holidays.stdDev),
      };

      const holidaysRating =
        !isPrivateHolidays && holidaysValue >= 125
          ? 5
          : isPrivateHolidays
          ? 2
          : scoreToRating(scores.holidays);

      const ratings = {
        salary: isPrivateSalary ? 2 : scoreToRating(scores.salary),
        employees: isPrivateEmployees ? 2 : scoreToRating(scores.employees),
        holidays: holidaysRating,
      };

      const attractionScore = parseFloat(((ratings.salary + ratings.holidays + ratings.employees) / 3).toFixed(1));

      return { ...company, attractionScore };
    });
  }, [allCompanies, chartStats]);

  const filteredCompanies = useMemo(() => {
    let processed = [...companiesWithScores];

    // フィルター処理
    if (filters.selectedIndustries.length > 0) {
      processed = processed.filter(c => filters.selectedIndustries.includes(c.industry));
    }
    if (filters.relocation) processed = processed.filter(c => c.relocation === 'なし');
    if (filters.specialLeave) processed = processed.filter(c => isTruthy(c.special_leave));
    if (filters.housingAllowance) processed = processed.filter(c => isTruthy(c.housing_allowance));
    if (filters.remoteWork) processed = processed.filter(c => isTruthy(c.remote_work));
    if (filters.flextime) processed = processed.filter(c => isTruthy(c.flextime));
    if (filters.fixedOvertimeSystem) processed = processed.filter(c => !isTruthy(c.fixed_overtime_system));

    return processed;
  }, [companiesWithScores, filters]);

  const displayedCompanies = useMemo(() => {
    let processed = [...filteredCompanies];

    // 検索処理
    if (searchQuery) {
      processed = processed.filter(c =>
        c.company_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ソート処理
    processed.sort((a, b) => {
      const valA = sort.key === 'attractionScore' ? a.attractionScore ?? 0 : parseNumericValue(a[sort.key]);
      const valB = sort.key === 'attractionScore' ? b.attractionScore ?? 0 : parseNumericValue(b[sort.key]);
      return sort.order === 'asc' ? valA - valB : valB - valA;
    });

    return processed;
  }, [filteredCompanies, searchQuery, sort]);

  // === イベントハンドラ ===
  const handleLogin = () => {
    authManager.login();
  };

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 5);
  };

  const handleScrollToFilters = () => {
    if (filterRef.current) {
      const headerOffset = 100; // ヘッダーの高さ +α のオフセット
      const elementPosition = filterRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSortChange = useCallback((key: SortOption) => {
    const order = 'desc';
    setSort({ key, order });
    setVisibleCount(5); // 表示件数をリセット

    const sortLabel = SORT_LABEL_MAP[key] ?? key;
    setNotification(prev => ({ key: prev.key + 1, message: `${sortLabel}に並べ替えました` }));

    if (!authState.lineUserId) return;

    const actionName = `button_click_sort-${sortLabel}`;
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
            <div ref={filterRef}>
              <FilterBar
                selectedIndustries={filters.selectedIndustries}
                filters={{
                    relocation: filters.relocation,
                    housingAllowance: filters.housingAllowance,
                    remoteWork: filters.remoteWork,
                    flextime: filters.flextime,
                    specialLeave: filters.specialLeave,
                    fixedOvertimeSystem: filters.fixedOvertimeSystem,
                }}
                onIndustryChange={(v) => handleFilterChange('selectedIndustries', v)}
                onFilterChange={handleFilterChange as any}
                onIndustryClick={handleIndustryFilterClick}
                onOtherFilterClick={handleOtherFilterClick as any}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchableCompanyCount={filteredCompanies.length}
              />
              <SortBar
                currentSort={sort.key}
                totalCount={displayedCompanies.length}
                onSortChange={handleSortChange}
              />
            </div>
          )}

          {/* ★ 修正点: ログイン済みだが友達でないユーザーへの案内を改善 */}
          {authState.isLoggedIn && !authState.isFriend && (
            <div className="registration-prompt">
              <div className="prompt-content">
                <h3>🚀 あと一歩です！</h3>
                <p>全ての企業情報を閲覧するには、LINE公式アカウントの友だち追加が必要です。<br/>下のボタンから友だち追加後、このページを再読み込みしてください。</p>
                <a href="https://lin.ee/eiuBq0X" className="add-friend-button-main" target="_blank" rel="noopener noreferrer">
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
                <>
                  <div className={`companies-list`}>
                    {displayedCompanies.slice(0, visibleCount).map((company, index) => (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        displayRank={index + 1}
                        isRestricted={shouldLockContent}
                        onViewDetails={handleCompanyDetailView}
                        chartStats={chartStats}
                      />
                    ))}
                  </div>
                  {displayedCompanies.length > 0 && (
                    <div className="load-more-container">
                      {visibleCount < displayedCompanies.length && (
                        <button onClick={handleLoadMore} className="load-more-button">
                          さらに表示する
                        </button>
                      )}
                      <button onClick={handleScrollToFilters} className="scroll-to-filters-button">
                        条件選択に戻る
                      </button>
                    </div>
                  )}
                </>
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
                          <br />
                          ① LINE友達追加ボタンのQRコードを読み取り、友だち追加を行ってください。
                          <br />
                          ② 友だち追加後、ログインボタンからLINEアカウントでログインしてください。
                          <br />
                          <br />
                          ※スマホのLINEトーク画面からもアクセスできます。
                          <br />
                          ※すでに友だちの場合は、すぐにログインできます。
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
                          ログインありがとうございます！
                          <br />
                          全ての詳細情報を閲覧するには、LINE公式アカウントの友だち追加が必要です。
                          <br />
                          追加後、このページを再読み込み（リロード）すると、すべての情報が表示されます。
                        </p>
                        {/* ★ 修正点: 友達追加ボタンを追加 */}
                        <div className="prompt-buttons">
                            <a href="https://lin.ee/eiuBq0X" className="add-friend-button-main" target="_blank" rel="noopener noreferrer">
                                LINEで友だち追加する
                            </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <SortNotification notificationKey={notification.key} message={notification.message} />
    </div>
  );
};