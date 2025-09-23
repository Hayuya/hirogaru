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
  // errorの初期値をauthStateから受け取るように変更
  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false,
    isLoggedIn: false,
    user: null,
    lineUserId: null,
    isFriend: false,
    error: null, // <-- errorの初期値を追加
  });

  // フィルター・ソート関連のState
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [femaleRatioFilter, setFemaleRatioFilter] = useState(false);
  const [relocationFilter, setRelocationFilter] = useState(false);
  const [specialLeaveFilter, setSpecialLeaveFilter] = useState(false);
  const [housingAllowanceFilter, setHousingAllowanceFilter] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>('starting_salary_graduates');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // LIFF初期化と認証情報の取得
  useEffect(() => {
    const initAuth = async () => {
      const state = await authManager.initialize();
      setAuthState(state);
    };
    initAuth();
  }, []);

  // 企業データの読み込みトリガー
  useEffect(() => {
    // LIFF初期化完了 かつ エラーがない場合にデータ取得を開始
    if (authState.isInitialized && !authState.error) {
      const handler = setTimeout(() => {
        loadCompanies(true); // 条件が変更されたらリセットして読み込み
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [selectedIndustries, femaleRatioFilter, relocationFilter, specialLeaveFilter, housingAllowanceFilter, currentSort, sortOrder, authState.isInitialized, authState.error]);

  // 企業データを取得する関数
  const loadCompanies = async (reset: boolean = false) => {
    // authState.errorがある場合は処理を中断
    if (authState.error) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const currentSkip = reset ? 0 : skip;

    try {
      const params = {
        skip: currentSkip,
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
      setCompanies(prev => (reset ? data : [...prev, ...data]));
      setSkip(currentSkip + data.length);
      setHasMore(data.length >= 20);
    } catch (error) {
      console.error('Failed to load companies:', error);
      // ここでのエラーはauthState.errorとは別で管理
      // setError('企業データの読み込みに失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // 無限スクロール用の設定
  const observer = useRef<IntersectionObserver>();
  const lastCompanyElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadCompanies(false); // 追加読み込み
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const isUserRestricted = !authState.isLoggedIn || !authState.isFriend;

  const FriendPrompt = () => (
    <div className="registration-prompt">
      <div className="prompt-content">
        <h3>全コンテンツの閲覧には</h3>
        <p>LINE公式アカウントの友だち追加が必要です。追加後、再度アクセスしてください。</p>
        <a 
          href="https://line.me/R/ti/p/YOUR_OFFICIAL_ACCOUNT_ID"
          className="register-button"
          style={{ textDecoration: 'none' }}
        >
          LINEで友だち追加する
        </a>
      </div>
    </div>
  );
  
  // ▼▼▼ ここからコンテンツ表示ロジックを修正 ▼▼▼
  const renderContent = () => {
    // 1. LIFFの初期化がまだ終わっていない場合
    if (!authState.isInitialized) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">アプリケーションを準備しています...</p>
        </div>
      );
    }

    // 2. LIFFの初期化でエラーが発生した場合
    if (authState.error) {
      return (
        <div className="error-container">
          <p className="error-message">{authState.error}</p>
        </div>
      );
    }

    // 3. 企業データ読み込み中の場合 (初回)
    if (loading && companies.length === 0) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">企業データを読み込んでいます...</p>
        </div>
      );
    }

    // 4. ログイン済みだが友だちでない場合
    if (authState.isLoggedIn && !authState.isFriend) {
      return <FriendPrompt />;
    }

    // 5. 該当企業が0件の場合
    if (companies.length === 0 && !loading) {
      return (
        <div className="no-results">
          <p>該当する企業が見つかりませんでした。</p>
        </div>
      );
    }
    
    // 6. 正常に企業リストを表示
    return (
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
    );
  };

  return (
    <div className="top-page">
      <Header user={authState.user} isLoggedIn={authState.isLoggedIn} />
      <HeroSection />
      
      <main className="main-content">
        <div className="container">
          {authState.isInitialized && !authState.error && (authState.isLoggedIn && authState.isFriend) && (
            <>
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
                  totalCount={companies.length}
                  onSortChange={(sort, order) => {
                    setCurrentSort(sort);
                    setSortOrder(order);
                  }}
                />
              )}
            </>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
};