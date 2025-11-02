'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { X, Lock, AlertCircle } from 'lucide-react';
import { useSheetAccessStore } from '../store/useSheetAccessStore';
import { sheetsApi } from '../lib/api';

interface SheetUnlockModalProps {
  onUnlock?: (sheetId: string) => void;
}

export default function SheetUnlockModal({ onUnlock }: SheetUnlockModalProps) {
  const {
    isModalOpen,
    targetSheetId,
    isValidating,
    validationError,
    unlockSheet,
    hideUnlockModal,
    setValidating,
    setValidationError,
  } = useSheetAccessStore();

  const [code, setCode] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isModalOpen) {
      // Focus the input when modal opens
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 100);
    } else {
      // Clear the code when modal closes
      setCode('');
    }
  }, [isModalOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }

      if (event.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleClose = () => {
    hideUnlockModal();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const trimmedCode = code.trim();
    
    // Validate code format
    const validationError = validateCode(trimmedCode);
    if (validationError) {
      setValidationError(validationError);
      return;
    }
    
    if (!targetSheetId) {
      setValidationError('No sheet selected');
      return;
    }

    setValidating(true);
    setValidationError(null);

    try {
      const response = await sheetsApi.validateCode(trimmedCode);
      
      if (response.data.sheetId === targetSheetId) {
        unlockSheet(targetSheetId);
        onUnlock?.(targetSheetId);
      } else {
        setValidationError('Invalid code for this sheet');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setValidationError('Invalid code. Please try again.');
      } else if (error.response?.status === 400) {
        setValidationError('Code format is invalid');
      } else {
        setValidationError('Failed to validate code. Please try again.');
      }
    } finally {
      setValidating(false);
    }
  };

  const validateCode = (code: string): string | null => {
    const trimmedCode = code.trim();
    
    if (!trimmedCode) {
      return 'Access code is required';
    }
    
    // Code format validation (alphanumeric with optional dash)
    const codeRegex = /^[A-Z0-9]{3,4}-?[A-Z0-9]{3,4}$/;
    if (!codeRegex.test(trimmedCode)) {
      return 'Invalid code format. Expected format: ABC-1234';
    }
    
    if (trimmedCode.length < 6) {
      return 'Code must be at least 6 characters';
    }
    
    if (trimmedCode.length > 8) {
      return 'Code cannot exceed 8 characters';
    }
    
    return null;
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Auto-format: Add dash after 3 characters if not present
    if (value.length === 4 && !value.includes('-')) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }
    
    // Remove multiple dashes and ensure only one dash
    value = value.replace(/-+/g, '-');
    
    // Limit to expected format: XXX-XXXX (8 characters max)
    if (value.length <= 8) {
      setCode(value);
    }
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-modal-title"
      aria-describedby="unlock-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-3 rounded-xl">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 id="unlock-modal-title" className="text-xl font-semibold text-gray-900">
                Unlock Sheet Access
              </h2>
              <p className="text-sm text-gray-500 mt-1">Enter your access code</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p id="unlock-modal-description" className="text-sm text-gray-600">
            Enter the access code to view and manage rooms in this sheet. The unlock will last for your current session.
          </p>

          <div className="space-y-3">
            <label htmlFor="access-code" className="block text-sm font-medium text-gray-700">
              Access Code
            </label>
            <input
              ref={codeInputRef}
              id="access-code"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="ABC-1234"
              className={`w-full px-4 py-3 border rounded-lg text-center text-lg font-mono tracking-wider bg-gray-50 focus:bg-white transition-colors ${
                validationError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              } focus:outline-none focus:ring-4`}
              disabled={isValidating}
              autoComplete="off"
              spellCheck={false}
              maxLength={8}
              pattern="[A-Z0-9]{3,4}-?[A-Z0-9]{3,4}"
              title="Enter access code in format ABC-1234"
              aria-invalid={!!validationError}
              aria-describedby={validationError ? "code-error" : "code-help"}
            />
            <div id="code-help" className="text-xs text-gray-500 text-center mt-1">
              Format: 3-4 letters/numbers, dash, 3-4 letters/numbers
            </div>
            {validationError && (
              <div id="code-error" className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-2.5"
              onClick={handleClose}
              disabled={isValidating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700"
              disabled={!code.trim() || isValidating}
            >
              {isValidating ? 'Validating...' : 'Unlock Access'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}