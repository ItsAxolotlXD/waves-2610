import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface FindWordsBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FindWordsBar: React.FC<FindWordsBarProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    } else {
      clearHighlights();
      setSearchTerm('');
      setMatchCount(0);
      setCurrentMatchIndex(0);
    }
  }, [isOpen]);

  const clearHighlights = () => {
    const marks = document.querySelectorAll('mark.vplay-search-highlight');
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
  };

  const highlightText = (term: string) => {
    clearHighlights();
    if (!term.trim() || term.length < 2) {
      setMatchCount(0);
      setCurrentMatchIndex(0);
      return;
    }

    const container = document.querySelector('article') || document.querySelector('main');
    if (!container) return;

    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    let count = 0;

    const walk = (node: Node) => {
      if (node.nodeType === 3) {
        // Text node
        const text = node.nodeValue;
        if (text && regex.test(text)) {
          const span = document.createElement('span');
          span.innerHTML = text.replace(regex, '<mark class="vplay-search-highlight bg-amber-400 text-black px-1 py-0.5 rounded font-bold shadow-sm">$1</mark>');
          node.parentNode?.replaceChild(span, node);
        }
      } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && node.nodeName !== 'INPUT') {
        Array.from(node.childNodes).forEach(walk);
      }
    };

    walk(container);

    const highlights = document.querySelectorAll('mark.vplay-search-highlight');
    setMatchCount(highlights.length);
    if (highlights.length > 0) {
      setCurrentMatchIndex(1);
      scrollToMatch(0, highlights);
    } else {
      setCurrentMatchIndex(0);
    }
  };

  const scrollToMatch = (index: number, markList?: NodeListOf<Element>) => {
    const marks = markList || document.querySelectorAll('mark.vplay-search-highlight');
    if (marks.length === 0) return;

    marks.forEach((m, idx) => {
      if (idx === index) {
        m.classList.add('ring-2', 'ring-[#E6005A]', 'bg-[#FF4D8D]', 'text-white');
        m.classList.remove('bg-amber-400', 'text-black');
        m.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        m.classList.remove('ring-2', 'ring-[#E6005A]', 'bg-[#FF4D8D]', 'text-white');
        m.classList.add('bg-amber-400', 'text-black');
      }
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    highlightText(val);
  };

  const handleNext = () => {
    if (matchCount === 0) return;
    const nextIndex = currentMatchIndex >= matchCount ? 1 : currentMatchIndex + 1;
    setCurrentMatchIndex(nextIndex);
    scrollToMatch(nextIndex - 1);
  };

  const handlePrev = () => {
    if (matchCount === 0) return;
    const prevIndex = currentMatchIndex <= 1 ? matchCount : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    scrollToMatch(prevIndex - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) handlePrev();
      else handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="find-words-bar"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 right-6 sm:right-10 z-50 flex items-center gap-2 p-2 rounded-2xl bg-[#1E1D22] border border-[#3E3E48] shadow-2xl text-white"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141318] border border-[#2A2A32]">
            <Search className="w-4 h-4 text-[#8E8E93] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Tìm từ trong bài..."
              className="w-36 sm:w-52 bg-transparent text-xs text-white placeholder-[#8E8E93] focus:outline-none"
            />
            {searchTerm && (
              <span className="text-[11px] font-mono text-[#8E8E93] whitespace-nowrap">
                {matchCount > 0 ? `${currentMatchIndex}/${matchCount}` : '0/0'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={matchCount === 0}
              title="Từ trước (Shift+Enter)"
              className="p-1.5 rounded-lg bg-[#27121d] hover:bg-[#331726] disabled:opacity-40 disabled:hover:bg-[#27121d] text-white cursor-pointer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={matchCount === 0}
              title="Từ kế tiếp (Enter)"
              className="p-1.5 rounded-lg bg-[#27121d] hover:bg-[#331726] disabled:opacity-40 disabled:hover:bg-[#27121d] text-white cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Đóng tìm kiếm (Esc)"
              className="p-1.5 rounded-lg bg-[#27121d] hover:bg-[#331726] text-[#9CA3AF] hover:text-white cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
