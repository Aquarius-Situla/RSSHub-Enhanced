import React, { useState, useEffect } from 'react';
import { isPhoneDevice } from '../utils/device-detect.js';
import './orientation-guard.css';

export function OrientationGuard({ t }) {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === 'undefined') return;
      if (!isPhoneDevice()) {
        setIsBlocked(false);
        document.documentElement.classList.remove('is-orientation-blocked');
        if (document.body) document.body.classList.remove('is-orientation-blocked');
        return;
      }

      const isLandscape = window.innerWidth > window.innerHeight;
      if (isLandscape) {
        setIsBlocked(true);
        document.documentElement.classList.add('is-orientation-blocked');
        if (document.body) document.body.classList.add('is-orientation-blocked');
      } else {
        setIsBlocked(false);
        document.documentElement.classList.remove('is-orientation-blocked');
        if (document.body) document.body.classList.remove('is-orientation-blocked');
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100);
    }, { passive: true });

    return () => {
      window.removeEventListener('resize', checkOrientation);
      document.documentElement.classList.remove('is-orientation-blocked');
      if (document.body) document.body.classList.remove('is-orientation-blocked');
    };
  }, []);

  return (
    <div
      className={`sys-orientation-guard ${isBlocked ? 'is-active' : ''}`}
      aria-hidden={!isBlocked}
    >
      <div className="guard-card">
        <div className="guard-icon-box">
          <svg className="guard-phone-icon" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Non-colliding outer orbit guidance arrow */}
            <path
              className="guidance-arrow"
              d="M8 40 C8 22.33 22.33 8 40 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 3.5"
            />
            <path
              className="guidance-arrow"
              d="M35 3 L42 8 L35 13"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Unified rotating phone device group */}
            <g className="phone-device-group">
              <rect
                x="27"
                y="16"
                width="26"
                height="48"
                rx="6"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="rgba(255, 69, 58, 0.08)"
              />
              <rect
                x="29"
                y="18"
                width="22"
                height="44"
                rx="4.5"
                stroke="currentColor"
                strokeWidth="0.75"
                opacity="0.3"
                fill="none"
              />
              <rect x="36" y="20.5" width="8" height="2.5" rx="1.25" fill="currentColor" />
              <line x1="35" y1="58" x2="45" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        </div>
        <h3 className="guard-title">
          {t('Please Rotate to Portrait', '请将设备旋转至竖屏')}
        </h3>
        <p className="guard-desc">
          {t(
            'To provide the best browsing and management experience, the mobile interface only supports portrait orientation.',
            '为提供最佳的控制台浏览与管理体验，手机版仅支持竖屏浏览。'
          )}
        </p>
      </div>
    </div>
  );
}

export default OrientationGuard;
