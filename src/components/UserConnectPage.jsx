import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const ConnectPage = () => {
  const navigate = useNavigate();

  // UI 상태
  const [isVisible, setIsVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // 카메라 상태
  const [cameras, setCameras] = useState([]);
  const [currentCamera, setCurrentCamera] = useState(null);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const lastRequestTimeRef = useRef(0);
  const toastTimerRef = useRef(null);

  // UI 헬퍼 함수
  const showToastMessage = useCallback((message, duration = 3000) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    setShowToast(true);

    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
      toastTimerRef.current = null;
    }, duration);
  }, []);

  // QR 스캔 처리 함수
  const handleQrCodeScanRef = useRef(async (decodedText) => {
    try {
      // 중복 요청 방지
      const now = Date.now();
      if (now - lastRequestTimeRef.current < 3000) {
        console.log('Throttled: Too soon after last request');
        return;
      }

      lastRequestTimeRef.current = now;
      setIsScanning(true);

      // API 호출하여 사용자 정보 가져오기
      const response = await fetch(`https://api.bhohwa.click/user?userCode=${decodedText}`);
      const data = await response.json();

      if (!response.ok) {
        showToastMessage('유효하지 않은 QR 코드입니다.');
        setIsScanning(false);
        return;
      }

      setIsScanning(false);
      showToastMessage('사용자 정보를 확인했습니다!');

      // 이름이 있으면 QR 스캔 페이지로, 없으면 이름 입력 페이지로 이동
      if (data.name && data.name.trim() !== '') {
        navigate('/scan', { state: { userId: data.id, name: data.name } });
      } else {
        navigate('/name', { state: { userId: data.id } });
      }
    } catch (err) {
      setIsScanning(false);
      showToastMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }).current;

  // 카메라 관련 함수
  const findRearCamera = (devices) => {
    const rearCamera = devices.find(camera => {
      const label = (camera.label || '').toLowerCase();
      return label.includes('back') ||
          label.includes('rear') ||
          label.includes('환경') ||
          label.includes('후면');
    });
    return rearCamera || devices[devices.length - 1];
  };

  const handleCameraSwitch = useCallback(async () => {
    if (!cameras?.length || cameras.length < 2) return;

    const currentIndex = cameras.findIndex(camera => camera.id === currentCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];

    try {
      if (html5QrCode?.isScanning) {
        await html5QrCode.stop();
      }

      await html5QrCode.start(
          nextCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          handleQrCodeScanRef,
          () => {}
      );

      setCurrentCamera(nextCamera.id);
    } catch (err) {
      setError(`카메라 전환 실패: ${err.message}`);
    }
  }, [cameras, currentCamera, html5QrCode, handleQrCodeScanRef]);

  // 초기화 효과
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // 카메라 초기화 효과
  useEffect(() => {
    let mounted = true;
    let qrCodeInstance = null;

    const initializeScanner = async () => {
      try {
        if (!document.getElementById("qr-reader")) {
          throw new Error('QR 스캐너 요소를 찾을 수 없습니다.');
        }

        qrCodeInstance = new Html5Qrcode("qr-reader");
        if (mounted) setHtml5QrCode(qrCodeInstance);

        const devices = await Html5Qrcode.getCameras();
        if (!devices?.length) throw new Error('사용 가능한 카메라가 없습니다.');

        if (mounted) {
          setCameras(devices);
          const rearCamera = findRearCamera(devices);

          if (mounted) {
            await qrCodeInstance.start(
                rearCamera.id,
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 }
                },
                handleQrCodeScanRef,
                () => {}
            );
            setCurrentCamera(rearCamera.id);
            setError('');
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      }
    };

    setTimeout(initializeScanner, 1000);

    return () => {
      mounted = false;
      if (qrCodeInstance?.isScanning) {
        qrCodeInstance.stop().catch(console.error);
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setShowToast(false);
    };
  }, [handleQrCodeScanRef]);

  // 토스트 메시지 클리어 효과
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // UI 렌더링
  return (
      <div className="fixed inset-0" style={{ backgroundColor: '#030511' }}>
        <div className="mx-auto h-full max-w-md flex flex-col relative" style={{maxWidth: '430px'}}>
          <header className="w-full py-6 px-6 flex justify-between items-center">
            <h2 className="text-white text-xl font-bold">GNTC-YOUTH-IT</h2>
            {cameras.length > 1 && (
                <button
                    onClick={handleCameraSwitch}
                    className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm flex items-center"
                >
                  📷 카메라 전환
                </button>
            )}
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-6">
            <div className={`w-full transition-opacity duration-1000 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">참가자 QR 스캔</h1>
                <p className="text-lg text-gray-400">본인 확인을 위해 QR 코드를 스캔해주세요</p>
              </div>

              <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-8 bg-black">
                <div id="qr-reader" className="w-full h-full"/>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-white/30"/>
                </div>

                {/* 스캔 중 오버레이 */}
                {isScanning && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-3"></div>
                        <p className="text-lg">스캔 중...</p>
                      </div>
                    </div>
                )}
              </div>

              {showToast && (
                  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
                    <div
                        className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 opacity-90">
                      {toastMessage}
                    </div>
                  </div>
              )}

              {error && (
                  <div className="w-full p-4 bg-red-500/20 rounded-lg mb-4">
                    <p className="text-red-500 text-center">{error}</p>
                  </div>
              )}
            </div>
          </main>
        </div>

        <style jsx>{`
        #qr-reader {
          border: none !important;
          width: 100% !important;
          height: 100% !important;
        }

        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        #qr-reader__dashboard {
          display: none !important;
        }
      `}</style>
      </div>
  );
};

export default ConnectPage;