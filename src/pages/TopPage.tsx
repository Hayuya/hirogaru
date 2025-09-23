import React, { useState, useEffect, useRef, useCallback } from 'react';
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

export const TopPage: React.FC = () => {
  // State管理
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false,
    isLoggedIn: false,
    user: null,
    lineUserId: null,
  });

  // フィルター・ソート関連のState
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [femaleRatioFilter, setFemaleRatioFilter] = useState(false);
  const [relocationFilter, setRelocationFilter] = useState(false); // 転勤なしフィルター
  const [specialLeaveFilter, setSpecialLeaveFilter] = useState(false); // 特別休暇フィルター
  const [housingAllowanceFilter, setHousingAllowanceFilter] = useState(false); // 住宅手当フィルター
  const [currentSort, setCurrentSort] = useState<SortOption>('starting_salary_graduates');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // LIFF初期化
  useEffect(() => {
    const initLiff = async () => {
      try {
        const state = await authManager.initialize();
        setAuthState(state);
      } catch (error) {
        console.error('LIFF initialization failed:', error);
      }
    };
    initLiff();
  }, []);

  // 企業データの初回読み込み（デバウンス適用）
  useEffect(() => {
    // 500msのデバウンス処理
    const handler = setTimeout(() => {
      loadCompanies(true); // フィルター変更時はリセットする
    }, 500);

    // クリーンアップ関数でタイマーをクリア
    return () => {
      clearTimeout(handler);
    };
  }, [selectedIndustries, femaleRatioFilter, relocationFilter, specialLeaveFilter, housingAllowanceFilter, currentSort, sortOrder, authState.lineUserId]);

  const loadCompanies = async (reset: boolean = false) => {
    setLoading(true);
    setError(null);
    if (reset) {
      setCompanies([]);
      setSkip(0);
      setHasMore(true);
    }

    try {
      const params = {
        skip: reset ? 0 : skip,
        limit: 20,
        line_user_id: authState.lineUserId,
        sort: currentSort,
        order: sortOrder,
        industry: selectedIndustries.length > 0 ? selectedIndustries.join(',') : undefined,
        female_ratio_over_30: femaleRatioFilter || undefined,
        relocation_none: relocationFilter || undefined,
        has_special_leave: specialLeaveFilter || undefined,
        has_housing_allowance: housingAllowanceFilter || undefined,
      };

      const data = await fetchCompanies(params);
      if (reset) {
        setCompanies(data);
      } else {
        setCompanies(prev => [...prev, ...data]);
      }
      setSkip(prev => (reset ? data.length : prev + data.length));
      setHasMore(data.length >= 20);
    } catch (error) {
      console.error('Failed to load companies:', error);
      setError('企業データの読み込みに失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 無限スクロールによる追加読み込み
  const loadMoreCompanies = () => {
    if (loading || !hasMore) return;
    loadCompanies(false);
  };
  
  const handleSortChange = (sort: SortOption, order: 'asc' | 'desc') => {
    setCurrentSort(sort);
    setSortOrder(order);
  };

  // Intersection Observer の設定
  const observer = useRef<IntersectionObserver>();
  const lastCompanyElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCompanies();
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);


  const isUserRestricted = !authState.isLoggedIn || !authState.lineUserId;

  return (
    <div className="top-page">
      <Header user={authState.user} isLoggedIn={authState.isLoggedIn} />
      <HeroSection />
      
      <main className="main-content">
        <div className="container">
          <FilterBar
            selectedIndustries={selectedIndustries}
            femaleRatioFilter={femaleRatioFilter}
            relocationFilter={relocationFilter}
            specialLeaveFilter={specialLeaveFilter}
            housingAllowanceFilter={housingAllowanceFilter}
            onIndustryChange={setSelectedIndustries}
            onFemaleRatioChange={setFemaleRatioFilter}
            onRelocationChange={setRelocationFilter}
            onSpecialLeaveChange={setSpecialLeaveFilter}
            onHousingAllowanceChange={setHousingAllowanceFilter}
          />
          
          {companies.length > 0 && (
            <SortBar
              currentSort={currentSort}
              sortOrder={sortOrder}
              totalCount={companies.length} // TODO: APIから総件数を取得するように変更するのが望ましい
              onSortChange={handleSortChange}
            />
          )}
          
          {loading && companies.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">企業データを読み込んでいます...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button className="retry-button" onClick={() => loadCompanies(true)}>
                再読み込み
              </button>
            </div>
          ) : companies.length === 0 ? (
            <div className="no-results">
              <p>該当する企業が見つかりませんでした。</p>
              <p>フィルター条件を変更してお試しください。</p>
            </div>
          ) : (
            <>
              <div className="companies-list">
                {companies.map((company, index) => {
                  const isLastElement = companies.length === index + 1;
                  return (
                    <div ref={isLastElement ? lastCompanyElementRef : null} key={company.id}>
                      <CompanyCard
                        company={company}
                        isRestricted={isUserRestricted && index >= 3}
                      />
                    </div>
                  );
                })}
              </div>
              
              {isUserRestricted && companies.length > 3 && (
                <div className="registration-prompt">
                  <div className="prompt-content">
                    <h3>すべての企業情報を見るには</h3>
                    <p>LINEでログインして、100社以上の広島企業の詳細情報にアクセスしましょう。</p>
                    <button 
                      className="register-button" 
                      onClick={() => authManager.login()}
                    >
                      LINEでログイン
                    </button>
                  </div>
                </div>
              )}
              
              {loading && companies.length > 0 && (
                <div className="loading-more">
                  <div className="loading-spinner"></div>
                </div>
              )}
              
              {!hasMore && companies.length > 0 && (
                <div className="end-of-list">
                  <p>すべての企業を表示しました</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};