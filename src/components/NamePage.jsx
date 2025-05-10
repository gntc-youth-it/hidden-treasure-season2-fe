import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NameInputPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 페이지 로드 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // userId가 없으면 연결 페이지로 리다이렉트
  useEffect(() => {
    if (!userId) {
      navigate('/connect');
    }
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 빈 입력 체크
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // API 엔드포인트와 요청 형식이 제공된 대로 수정
      const response = await fetch('https://api.bhohwa.click/user/name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          name: name.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '이름을 저장하는데 실패했습니다.');
      }

      // 이름 저장 성공 후 QR 스캔 페이지로 이동
      navigate('/scan', { state: { userId: data.userId, name: data.name } });
    } catch (err) {
      setError(err.message || '서버 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0" style={{ backgroundColor: '#030511' }}>
        <div className="mx-auto h-full max-w-md flex flex-col relative" style={{ maxWidth: '430px' }}>
          <header className="w-full py-6 px-6">
            <h2 className="text-white text-xl font-bold">GNTC-YOUTH-IT</h2>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-6">
            <div className={`w-full transition-opacity duration-1000 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">참가자 정보</h1>
                <p className="text-lg text-gray-400">보물찾기에 참여할 이름을 입력해주세요</p>
              </div>

              <div className="w-full max-w-sm mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      이름
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (error) setError(''); // 입력 시 에러 메시지 초기화
                        }}
                        placeholder="이름을 입력하세요"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                        autoFocus
                        maxLength={20} // 이름 최대 길이 제한
                    />
                  </div>

                  {error && (
                      <div className="p-3 bg-red-500/20 rounded-lg">
                        <p className="text-red-500 text-sm">{error}</p>
                      </div>
                  )}

                  <button
                      type="submit"
                      className={`w-full py-4 bg-white text-black rounded-full text-lg font-bold 
                    hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 
                    disabled:opacity-50 disabled:cursor-not-allowed ${!name.trim() ? 'opacity-50' : 'opacity-100'}`}
                      disabled={isSubmitting || !name.trim()} // 이름이 비어있으면 버튼 비활성화
                  >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      저장 중...
                    </span>
                    ) : (
                        '시작하기 💎'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default NameInputPage;

