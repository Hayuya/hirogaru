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

// 文字列から数値を抽出するヘルパー関数
const parseNumericValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // "235,000円"のような形式から数値のみを抽出
  const match = value.match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
};

export const TopPage: React.FC = () => {
  // === State管理 ===
  const [authState, setAuthState] = useState<AuthState>({
    isInitialized: false, isLoggedIn: false, user: null, lineUserId: null, isFriend: false, error: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]); // APIから取得した加工前の全企業データ

  // フィルター・ソート関連のState
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [femaleRatioFilter, setFemaleRatioFilter] = useState(false);
  const [relocationFilter, setRelocationFilter] = useState(false);
  const [specialLeaveFilter, setSpecialLeaveFilter] = useState(false);
  const [housingAllowanceFilter, setHousingAllowanceFilter] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>('starting_salary_graduates');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // === useEffects ===

  // LIFF初期化
  useEffect(() => {
    authManager.initialize().then(setAuthState);
  }, []);

  // 全企業データの初回取得
  useEffect(() => {
    if (!authState.isInitialized || authState.error) {
      if (!authState.isInitialized) setLoading(true); // 初期化が終わるまでローディング
      else setLoading(false); // 初期化エラーならローディング終了
      return;
    }

    const loadInitialCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCompanies({ line_user_id: authState.lineUserId });
        setAllCompanies(data);
      } catch (err) {
        setError('企業データの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    loadInitialCompanies();
  }, [authState.isInitialized, authState.error, authState.lineUserId]);

  // ▼▼▼ useMemoを使用して、表示用データを安全に再計算 ▼▼▼
  const companies = useMemo(() => {
    let processedCompanies = [...allCompanies];

    // 1. フィルター処理
    if (selectedIndustries.length > 0) {
      processedCompanies = processedCompanies.filter(c => selectedIndustries.includes(c.industry));
    }
    if (femaleRatioFilter) {
      processedCompanies = processedCompanies.filter(c => {
        const femaleRatioMatch = c.gender_ratio.match(/女性:(\d+)%/);
        return femaleRatioMatch ? parseInt(femaleRatioMatch[1], 10) >= 30 : false;
      });
    }
    if (relocationFilter) {
      processedCompanies = processedCompanies.filter(c => c.relocation === 'なし');
    }
    if (specialLeaveFilter) {
      processedCompanies = processedCompanies.filter(c => c.special_leave === 'あり');
    }
    if (housingAllowanceFilter) {
      processedCompanies = processedCompanies.filter(c => c.housing_allowance === 'あり');
    }

    // 2. ソート処理
    processedCompanies.sort((a, b) => {
      const valA = parseNumericValue(a[currentSort]);
      const valB = parseNumericValue(b[currentSort]);

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return processedCompanies;
  }, [allCompanies, selectedIndustries, femaleRatioFilter, relocationFilter, specialLeaveFilter, housingAllowanceFilter, currentSort, sortOrder]);

  // === レンダリングロジック ===

  const isUserRestricted = !authState.isLoggedIn || !authState.isFriend;

  const FriendPrompt = () => (
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

  const renderContent = () => {
    if (loading) {
      return (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">データを読み込んでいます...</p>
          </div>
      );
    }
    if (authState.error) return <div className="error-container"><p className="error-message">{authState.error}</p></div>;
    if (error) return <div className="error-container"><p className="error-message">{error}</p></div>;
    if (authState.isLoggedIn && !authState.isFriend) return <FriendPrompt />;
    if (companies.length === 0) return <div className="no-results"><p>該当する企業が見つかりませんでした。</p></div>;
    
    return (
      <div className="companies-list">
        {companies.map((company, index) => (
          <CompanyCard
            key={company.id}
            company={company}
            displayRank={index + 1} // Mapのindexを元に動的な順位を渡す
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
              <SortBar
                currentSort={currentSort}
                sortOrder={sortOrder}
                totalCount={companies.length}
                onSortChange={(sort, order) => {
                  setCurrentSort(sort);
                  setSortOrder(order);
                }}
              />
            </>
          )}

          {renderContent()}
        </div>
      </main>
    </div>
  );
};