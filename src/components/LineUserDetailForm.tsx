import { useState } from 'react';

interface LineUserDetailFormProps {
  onSubmit: (payload: { university: string; faculty: string; department: string | null; hometown: string | null; }) => Promise<void>;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export const LineUserDetailForm = ({ onSubmit, isSubmitting, errorMessage }: LineUserDetailFormProps) => {
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [hometown, setHometown] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUniversity = university.trim();
    const trimmedFaculty = faculty.trim();

    if (!trimmedUniversity || !trimmedFaculty) {
      setValidationError('大学名と学部名は必須です。');
      return;
    }

    setValidationError(null);
    await onSubmit({
      university: trimmedUniversity,
      faculty: trimmedFaculty,
      department: department.trim() || null,
      hometown: hometown.trim() || null,
    });
  };

  return (
    <div className="line-user-detail-form">
      <h2>大学情報を入力してください</h2>
      <p className="form-description">以下の情報を登録すると、最新のコンテンツをお届けできます。</p>
      <form onSubmit={handleSubmit}>
        <label>
          大学名（必須）
          <input
            type="text"
            value={university}
            onChange={(event) => setUniversity(event.target.value)}
            placeholder="例：広島大学"
            required
          />
        </label>

        <label>
          学部（必須）
          <input
            type="text"
            value={faculty}
            onChange={(event) => setFaculty(event.target.value)}
            placeholder="例：教育学部"
            required
          />
        </label>

        <label>
          学科
          <input
            type="text"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            placeholder="例：心理学科"
          />
        </label>

        <label>
          出身地
          <input
            type="text"
            value={hometown}
            onChange={(event) => setHometown(event.target.value)}
            placeholder="例：広島県広島市"
          />
        </label>

        {(validationError || errorMessage) && (
          <p className="form-error">{validationError ?? errorMessage}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '送信中...' : '登録する'}
        </button>
      </form>
    </div>
  );
};
