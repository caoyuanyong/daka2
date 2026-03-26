"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced Button component with built-in anti-multi-click mechanism.
 * @param {Object} props
 * @param {boolean} props.throttle - Whether to enable anti-multi-click (default: true)
 * @param {number} props.throttleTime - Cooldown time in ms (default: 800)
 * @param {boolean} props.loading - Show loading state and disable
 * @param {Function} props.onClick - Click handler
 */
export default function Button({
  children,
  onClick,
  className = '',
  style = {},
  disabled = false,
  loading = false,
  throttle = true,
  throttleTime = 800,
  whileHover = { scale: 1.02 },
  whileTap = { scale: 0.98 },
  ...props
}) {
  const [isCooldown, setIsCooldown] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = (e) => {
    if (disabled || loading) return;

    if (throttle) {
      if (isCooldown) return;
      
      setIsCooldown(true);
      if (onClick) onClick(e);

      timerRef.current = setTimeout(() => {
        setIsCooldown(false);
      }, throttleTime);
    } else {
      if (onClick) onClick(e);
    }
  };

  const isActuallyDisabled = disabled || loading || (throttle && isCooldown);

  return (
    <motion.button
      className={`btn ${className}`}
      onClick={handleClick}
      disabled={isActuallyDisabled}
      style={{
        ...style,
        cursor: isActuallyDisabled ? 'not-allowed' : 'pointer',
        opacity: isActuallyDisabled ? 0.7 : 1,
      }}
      whileHover={isActuallyDisabled ? {} : whileHover}
      whileTap={isActuallyDisabled ? {} : whileTap}
      {...props}
    >
      {loading ? (
        <span className="btn-loading-content">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          处理中...
        </span>
      ) : children}
      
      <style jsx>{`
        .btn-loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.button>
  );
}
