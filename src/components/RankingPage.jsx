import React, {useState, useEffect, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';

const RankingPage = () => {
  const [rankings, setRankings] = useState([]);
  const [visibleRankings, setVisibleRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prevRankings, setPrevRankings] = useState([]);
  const tableBodyRef = useRef(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch('https://api.bhohwa.click/rank');
        const data = await response.json();
        setPrevRankings(rankings);
        setRankings(data);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();

    // 10초마다 순위 갱신
    const interval = setInterval(fetchRankings, 10000);
    return () => clearInterval(interval);
  }, []);

  // 순위 데이터 준비
  useEffect(() => {
    if (rankings.length === 0) return;

    // 연속적인 스크롤을 위해 rankings를 세 번 반복
    const tripleRankings = [...rankings, ...rankings, ...rankings].map((user, index) => ({
      ...user,
      displayRank: (index % rankings.length) + 1,
      key: `${user.id}-${Math.floor(index / rankings.length)}`  // 고유한 키 생성
    }));
    setVisibleRankings(tripleRankings);
  }, [rankings]);

  // 순위 변경 감지 및 하이라이트 효과
  useEffect(() => {
    rankings.forEach((user, index) => {
      const prevIndex = prevRankings.findIndex(t => t.id === user.id);
      if (prevIndex !== -1 && prevIndex !== index) {
        const element = document.querySelector(`[data-user="${user.id}"]`);
        if (element) {
          element.classList.add('highlight');
          setTimeout(() => element.classList.remove('highlight'), 1000);
        }
      }
    });
  }, [rankings, prevRankings]);

  // 자동 스크롤 효과
  useEffect(() => {
    if (!tableBodyRef.current || rankings.length === 0) return;

    const tableBody = tableBodyRef.current;
    let animationFrameId;
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      const rowDuration = 6000; // 6초
      const totalDuration = rankings.length * rowDuration;
      const scrollHeight = tableBody.scrollHeight;
      const clientHeight = tableBody.clientHeight;

      // 스크롤이 끝에 도달하면 처음으로 순간이동
      let newPosition = (progress % totalDuration) / totalDuration * (scrollHeight - clientHeight);
      if (newPosition >= (scrollHeight / 2)) {
        tableBody.scrollTop = 0;
        startTime = timestamp;  // 애니메이션 시간 초기화
      } else {
        tableBody.scrollTop = newPosition;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [rankings.length]);

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-[#1c1f27]">
          <div className="text-xl text-white">Loading...</div>
        </div>
    );
  }

  return (
      <div className="min-h-screen h-full w-full bg-[#1c1f27] text-white p-8 flex flex-col">
        <style jsx global>{`
                @keyframes highlight {
                    0% {
                        background-color: rgba(255, 255, 255, 0.1);
                    }
                    100% {
                        background-color: transparent;
                    }
                }

                .highlight {
                    animation: highlight 1s ease-out;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                thead {
                    width: 100%;
                    display: table;
                    table-layout: fixed;
                }

                tbody {
                    width: 100%;
                    display: block;
                    overflow-y: hidden;
                    height: 400px;
                }

                tbody tr {
                    display: table;
                    width: 100%;
                    table-layout: fixed;
                }

                /* 스크롤바 숨기기 */
                tbody::-webkit-scrollbar {
                    display: none;
                }

                tbody {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

        <div className="max-w-7xl mx-auto w-full flex-1">
          <div className="flex justify-between items-center mb-8 mt-5">
            <h1 className="text-4xl font-bold">밭에 감추인 보화 순위표</h1>
            <div className="text-sm text-gray-400">자동 갱신중</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
            <AnimatePresence>
              {rankings.slice(0, 3).map((user, index) => (
                  <motion.div
                      key={user.id}
                      initial={{opacity: 0, y: 20}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -20}}
                      transition={{duration: 0.3}}
                      className={`p-6 rounded-xl ${
                          index === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                              index === 1 ? 'bg-gray-400/10 border border-gray-400/20' :
                                  'bg-orange-700/10 border border-orange-700/20'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                      <span className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                                  'text-orange-700'
                      }`}>{user.name}</span>
                    </div>
                    <div className="text-lg">점수: {user.score}점</div>
                    <div className="text-lg">찾은 보물: {user.treasureCount}개</div>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                      <div
                          className={`rounded-full h-2 transition-all duration-500 ease-out ${
                              index === 0 ? 'bg-yellow-500' :
                                  index === 1 ? 'bg-gray-400' :
                                      'bg-orange-700'
                          }`}
                          style={{width: `${Math.min((user.treasureCount / 10) * 20, 100)}%`}}
                      />
                    </div>
                  </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="bg-[#2b2d3a] rounded-xl shadow-xl overflow-hidden mt-8">
            <table className="w-full">
              <thead>
              <tr className="bg-[#393d4c] text-gray-300">
                <th className="px-8 py-5 text-center text-lg">순위</th>
                <th className="px-8 py-5 text-center text-lg">이름</th>
                <th className="px-8 py-5 text-center text-lg">점수</th>
                <th className="px-8 py-5 text-center text-lg">보물 개수</th>
                <th className="px-8 py-5 text-right text-lg">진행률</th>
              </tr>
              </thead>
              <tbody
                  ref={tableBodyRef}
                  className="block overflow-hidden"
              >
              <AnimatePresence>
                {visibleRankings.map((user, index) => (
                    <motion.tr
                        key={user.key}
                        data-user={user.id}
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        exit={{opacity: 0, x: 20}}
                        transition={{duration: 0.3}}
                        layout
                        className={`
                                               border-b border-[#393d4c]
                                               ${index % 2 === 0 ? 'bg-[#2b2d3a]' : 'bg-[#32354a]'}
                                               hover:bg-[#393d4c] transition-colors
                                           `}
                    >
                      <motion.td layout className="px-8 py-6 text-center">
                        <motion.div layout className="flex items-center justify-center text-lg">
                          {user.displayRank}
                        </motion.div>
                      </motion.td>
                      <motion.td layout className="px-8 py-6 text-center">
                        <motion.div layout className="flex items-center justify-center">
                          <span className="text-lg font-medium">{user.name}</span>
                        </motion.div>
                      </motion.td>
                      <motion.td layout className="px-8 py-6 text-center text-lg">
                        {user.score}점
                      </motion.td>
                      <motion.td layout className="px-8 py-6 text-center text-lg">
                        {user.treasureCount}개
                      </motion.td>
                      <motion.td layout className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                                className={`rounded-full h-2 transition-all duration-500 ease-out ${
                                    user.score >= 8 ? 'bg-green-500' :
                                        user.score >= 5 ? 'bg-yellow-500' :
                                            user.score >= 0 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{width: `${Math.min(Math.max((user.score / 10) * 100, 0), 100)}%`}}
                            />
                          </div>
                        </div>
                      </motion.td>
                    </motion.tr>
                ))}
              </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default RankingPage;