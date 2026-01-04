import React, { useState } from 'react';
import { EmojiResult } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface EmojiDisplayProps {
  result: EmojiResult | null;
  onDownload: (url: string, filename: string) => void;
  onRetry?: () => void;
}

const EmojiDisplay: React.FC<EmojiDisplayProps> = ({ result, onDownload, onRetry }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!result?.imageUrl) return;
    
    setIsSharing(true);
    try {
      // Fetch the blob to share the actual file
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `emojify-${result.id}.png`, { type: blob.type });

      const shareData: ShareData = {
        title: 'My Emojify Creation',
        text: `Check out this emoji I made with Emojify! Prompt: "${result.prompt}"`,
        files: [file],
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support file sharing or full Web Share API
        // Try sharing just text/url if file not supported
        if (navigator.share) {
             await navigator.share({
                title: 'Emojify',
                text: `I made an emoji for "${result.prompt}". Create yours at ${window.location.href}`,
                url: window.location.href
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert("App URL copied to clipboard! (Your browser doesn't support direct image sharing)");
        }
      }
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!result) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pop-in">
        <span className="text-5xl mb-4 opacity-30 animate-float">🚀</span>
        <p className="font-light text-center px-4">Describe an idea or upload a photo to launch your emoji</p>
      </div>
    );
  }

  if (result.isLoading) {
    return (
      <div className="w-full min-h-64 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-red-50 rounded-3xl border border-red-100 text-center px-4 animate-pop-in">
        <span className="text-3xl mb-2">⚠️</span>
        <h3 className="text-red-800 font-medium mb-1">Generation Failed</h3>
        <p className="text-red-600 text-sm max-w-md mb-4">{result.error}</p>
        {onRetry && (
            <button 
                onClick={onRetry}
                className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors shadow-sm"
            >
                Try Again
            </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full animate-slide-up">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Generated Result</h3>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
              {result.style}
            </span>
            <span className="text-xs text-gray-400 font-mono">{new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="p-8 flex flex-col md:flex-row gap-8 items-center justify-center">
          
          {/* Image Section */}
          {result.imageUrl && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group animate-pop-in">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-[2rem] transform rotate-3 opacity-50 group-hover:rotate-6 transition-transform duration-300"></div>
                <img 
                  src={result.imageUrl} 
                  alt={result.prompt}
                  className="relative w-48 h-48 md:w-64 md:h-64 object-cover rounded-[2rem] shadow-sm bg-white z-10 animate-float"
                  style={{ animationDuration: '6s' }}
                />
                
                <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => result.imageUrl && onDownload(result.imageUrl, `emojify-${result.id}.png`)}
                    className="bg-white text-gray-700 hover:text-blue-600 p-2 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform"
                    title="Download"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3.25-3.25M12 12.75l3.25-3.25M12 12.75V3" />
                    </svg>
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="bg-white text-gray-700 hover:text-green-600 p-2 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform"
                    title="Share"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093s-.107.77-.287 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Combos Section */}
          {result.combos && result.combos.length > 0 && (
            <div className="flex flex-col space-y-3 w-full md:w-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <span className="text-xs font-medium text-gray-400 text-center md:text-left uppercase">Text Combos</span>
              <div className="flex flex-wrap md:flex-col gap-3 justify-center">
                {result.combos.map((combo, idx) => (
                  <div 
                    key={idx}
                    onClick={() => navigator.clipboard.writeText(combo)}
                    className="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-100 px-6 py-4 rounded-2xl text-2xl md:text-3xl transition-all active:scale-95 flex items-center justify-center relative group"
                  >
                    {combo}
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-gray-600 italic">"{result.prompt}"</p>
        </div>
      </div>
    </div>
  );
};

export default EmojiDisplay;