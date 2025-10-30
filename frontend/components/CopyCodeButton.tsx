'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface CopyCodeButtonProps {
  code?: string;
  sheetName: string;
  className?: string;
  size?: 'sm' | 'lg' | 'default';
  showCodeToggle?: boolean;
}

export default function CopyCodeButton({ 
  code, 
  sheetName, 
  className = '',
  size = 'sm',
  showCodeToggle = true
}: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleCopy = async () => {
    if (!code) {
      toast.error('No code available to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Access code for "${sheetName}" copied to clipboard`);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error('Failed to copy code');
    }
  };

  if (!code) {
    return (
      <span className="text-xs text-gray-500 italic">No code available</span>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showCodeToggle && (
        <>
          <Button
            size={size}
            variant="outline"
            onClick={() => setShowCode(!showCode)}
            className="text-xs"
            aria-label={showCode ? 'Hide access code' : 'Show access code'}
          >
            {showCode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          {showCode && (
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
              {code}
            </code>
          )}
        </>
      )}
      <Button
        size={size}
        variant="outline"
        onClick={handleCopy}
        className="text-xs"
        aria-label={`Copy access code for ${sheetName}`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3 mr-1" />
            Copy Code
          </>
        )}
      </Button>
    </div>
  );
}