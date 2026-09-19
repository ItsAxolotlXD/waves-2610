import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings';
import { keyboardSound } from '../utils/keyboardSound';
import { VietnameseInputMethod, processTelexKey, processVniKey } from '../utils/vietnameseIME';

interface NativeKeyboardContextType {
  isOpen: boolean;
  activeInput: HTMLInputElement | HTMLTextAreaElement | null;
  keyboardHeight: number;
  inputMethod: VietnameseInputMethod;
  setInputMethod: (method: VietnameseInputMethod) => void;
  openKeyboard: (input: HTMLInputElement | HTMLTextAreaElement) => void;
  closeKeyboard: () => void;
  switchToDeviceKeyboard: () => void;
  insertText: (text: string) => void;
  deleteChar: () => void;
  submitAction: () => void;
  isNativeKeyboardEnabled: boolean;
}

const NativeKeyboardContext = createContext<NativeKeyboardContextType | null>(null);

export const useNativeKeyboard = () => {
  const context = useContext(NativeKeyboardContext);
  if (!context) {
    return {
      isOpen: false,
      activeInput: null,
      keyboardHeight: 290,
      inputMethod: 'vi-telex' as VietnameseInputMethod,
      setInputMethod: () => {},
      openKeyboard: () => {},
      closeKeyboard: () => {},
      switchToDeviceKeyboard: () => {},
      insertText: () => {},
      deleteChar: () => {},
      submitAction: () => {},
      isNativeKeyboardEnabled: false,
    };
  }
  return context;
};

export const NativeKeyboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSetting } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Input method: 'en' | 'vi-telex' | 'vi-vni' (defaults to 'vi-telex')
  const [inputMethod, setInputMethodState] = useState<VietnameseInputMethod>(() => {
    try {
      const saved = localStorage.getItem('vplay_keyboard_method');
      if (saved === 'en' || saved === 'vi-telex' || saved === 'vi-vni') {
        return saved;
      }
    } catch {}
    return 'vi-telex';
  });

  const setInputMethod = useCallback((method: VietnameseInputMethod) => {
    setInputMethodState(method);
    try {
      localStorage.setItem('vplay_keyboard_method', method);
    } catch {}
  }, []);
  
  // Standard iOS on-screen keyboard height is approx 285px - 300px
  const keyboardHeight = 290;

  const isNativeKeyboardEnabled = Boolean(settings.nativeKeyboard);

  // Keep ref in sync
  useEffect(() => {
    activeInputRef.current = activeInput;
  }, [activeInput]);

  const openKeyboard = useCallback((input: HTMLInputElement | HTMLTextAreaElement) => {
    if (!isNativeKeyboardEnabled) return;
    keyboardSound.unlockAudio();
    setActiveInput(input);
    setIsOpen(true);

    // Scroll active element into comfortable view if partially obscured
    setTimeout(() => {
      try {
        const rect = input.getBoundingClientRect();
        const keyboardTop = window.innerHeight - keyboardHeight - 16;
        if (rect.bottom > keyboardTop) {
          const scrollDiff = rect.bottom - keyboardTop + 32;
          window.scrollBy({ top: scrollDiff, behavior: 'smooth' });
        }
      } catch {}
    }, 80);
  }, [isNativeKeyboardEnabled, keyboardHeight]);

  const closeKeyboard = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Switch to device's physical/OS keyboard: disables virtual native keyboard and focuses target
  const switchToDeviceKeyboard = useCallback(() => {
    const currentInput = activeInputRef.current;
    setIsOpen(false);
    setActiveInput(null);

    // Remove inputmode="none" so native OS keyboard appears
    document.querySelectorAll('input, textarea').forEach((el) => {
      el.removeAttribute('inputmode');
      el.removeAttribute('data-native-keyboard-intercepted');
    });

    // Update system setting
    updateSetting('nativeKeyboard', false);

    // Refocus the input so device keyboard opens
    if (currentInput) {
      setTimeout(() => {
        try {
          currentInput.focus();
        } catch {}
      }, 80);
    }
  }, [updateSetting]);

  // Insert character into active input element with Vietnamese IME support
  const insertText = useCallback((text: string) => {
    const input = activeInputRef.current;
    if (!input) return;

    try {
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const val = input.value;

      let newVal = '';
      let newPos = start + text.length;

      // Check if we can apply Vietnamese IME transformation
      let handledByIME = false;
      if (inputMethod !== 'en' && text.length === 1 && start === end) {
        // Find the start of the current word before cursor
        let wordStart = start;
        while (wordStart > 0) {
          const prevChar = val[wordStart - 1];
          // Word delimiters: whitespace, punctuation, symbols
          if (/[\s.,\/#!$%\^&\*;:{}=\-_`~()?"'<>\[\]\\|]/.test(prevChar)) {
            break;
          }
          wordStart--;
        }

        const currentWord = val.slice(wordStart, start);
        if (currentWord.length > 0) {
          let transformedWord: string | null = null;
          if (inputMethod === 'vi-telex') {
            transformedWord = processTelexKey(currentWord, text);
          } else if (inputMethod === 'vi-vni') {
            transformedWord = processVniKey(currentWord, text);
          }

          if (transformedWord !== null) {
            handledByIME = true;
            newVal = val.slice(0, wordStart) + transformedWord + val.slice(end);
            newPos = wordStart + transformedWord.length;
          }
        }
      }

      if (!handledByIME) {
        newVal = val.slice(0, start) + text + val.slice(end);
        newPos = start + text.length;
      }

      // Native property setter to invoke React 16+ synthetic onChange tracker
      const prototype = input instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
      if (descriptor?.set) {
        descriptor.set.call(input, newVal);
      } else {
        input.value = newVal;
      }

      try {
        input.setSelectionRange(newPos, newPos);
      } catch {}

      // Dispatch standard input and change events
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } catch {}
  }, [inputMethod]);

  // Delete character before cursor
  const deleteChar = useCallback(() => {
    const input = activeInputRef.current;
    if (!input) return;

    try {
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const val = input.value;

      let newVal = val;
      let newPos = start;

      if (start === end) {
        if (start === 0) return;
        newVal = val.slice(0, start - 1) + val.slice(end);
        newPos = start - 1;
      } else {
        newVal = val.slice(0, start) + val.slice(end);
        newPos = start;
      }

      const prototype = input instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
      if (descriptor?.set) {
        descriptor.set.call(input, newVal);
      } else {
        input.value = newVal;
      }

      try {
        input.setSelectionRange(newPos, newPos);
      } catch {}

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } catch {}
  }, []);

  // Submit / search / Enter
  const submitAction = useCallback(() => {
    const input = activeInputRef.current;
    if (input) {
      try {
        const enterDown = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        });
        input.dispatchEvent(enterDown);

        const enterUp = new KeyboardEvent('keyup', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        });
        input.dispatchEvent(enterUp);

        if (input.form) {
          input.form.requestSubmit?.();
        }
      } catch {}
    }
    closeKeyboard();
  }, [closeKeyboard]);

  // Global listeners for disabling device keyboard & intercepting input focus
  useEffect(() => {
    if (!isNativeKeyboardEnabled) {
      setIsOpen(false);
      // Restore inputMode on any inputs that were modified
      document.querySelectorAll('input, textarea').forEach((el) => {
        if (el.getAttribute('data-native-keyboard-intercepted') === 'true') {
          el.removeAttribute('inputmode');
          el.removeAttribute('data-native-keyboard-intercepted');
        }
      });
      document.documentElement.style.removeProperty('--native-keyboard-height');
      document.documentElement.style.removeProperty('--native-keyboard-push');
      document.body.classList.remove('native-keyboard-active');
      return;
    }

    // Set CSS variable for layout push
    document.documentElement.style.setProperty(
      '--native-keyboard-height',
      isOpen ? `${keyboardHeight}px` : '0px'
    );
    document.documentElement.style.setProperty(
      '--native-keyboard-push',
      isOpen ? `calc(${keyboardHeight}px + 12px)` : '0px'
    );
    if (isOpen) {
      document.body.classList.add('native-keyboard-active');
    } else {
      document.body.classList.remove('native-keyboard-active');
    }

    const isIgnoredInput = (target: HTMLElement) => {
      if (
        !(target instanceof HTMLInputElement) &&
        !(target instanceof HTMLTextAreaElement)
      ) {
        return true;
      }
      if (target instanceof HTMLInputElement) {
        const type = target.type.toLowerCase();
        if (
          type === 'checkbox' ||
          type === 'radio' ||
          type === 'range' ||
          type === 'file' ||
          type === 'button' ||
          type === 'submit' ||
          type === 'reset'
        ) {
          return true;
        }
      }
      // Check if input is inside the NativeKeyboard itself
      if (target.closest('#vplay-native-keyboard')) {
        return true;
      }
      return false;
    };

    // When nativeKeyboard is enabled:
    // Apply inputmode="none" to prevent the device virtual keyboard on touch screens
    const applyInputModeNone = (el: HTMLElement) => {
      if (isIgnoredInput(el)) return;
      el.setAttribute('inputmode', 'none');
      el.setAttribute('data-native-keyboard-intercepted', 'true');
    };

    // Intercept touch / pointerdown
    const handlePointerDown = (e: PointerEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (!isIgnoredInput(target)) {
        applyInputModeNone(target);
      }
    };

    // Intercept focusin
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || isIgnoredInput(target)) return;

      applyInputModeNone(target);
      openKeyboard(target as HTMLInputElement | HTMLTextAreaElement);
    };

    // Intercept click on document to close keyboard if clicked outside input & keyboard
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // If clicked inside keyboard, do not close
      if (target.closest('#vplay-native-keyboard')) {
        return;
      }
      // If clicked inside active input, do not close
      if (activeInputRef.current && (target === activeInputRef.current || activeInputRef.current.contains(target))) {
        return;
      }
      // If clicked on a search icon or input trigger button
      if (target.closest('#floating-search-bar-container') || target.closest('#spotlight-search-box')) {
        return;
      }

      // If clicking outside, close keyboard
      if (isOpen) {
        closeKeyboard();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true, capture: true });
    window.addEventListener('touchstart', handlePointerDown, { passive: true, capture: true });
    window.addEventListener('focusin', handleFocusIn, { capture: true });
    window.addEventListener('mousedown', handleClickOutside, { capture: true });

    // Apply to already rendered inputs on mount
    document.querySelectorAll('input, textarea').forEach((el) => {
      applyInputModeNone(el as HTMLElement);
    });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('touchstart', handlePointerDown, { capture: true });
      window.removeEventListener('focusin', handleFocusIn, { capture: true });
      window.removeEventListener('mousedown', handleClickOutside, { capture: true });
    };
  }, [isNativeKeyboardEnabled, isOpen, keyboardHeight, openKeyboard, closeKeyboard]);

  return (
    <NativeKeyboardContext.Provider
      value={{
        isOpen,
        activeInput,
        keyboardHeight,
        inputMethod,
        setInputMethod,
        openKeyboard,
        closeKeyboard,
        switchToDeviceKeyboard,
        insertText,
        deleteChar,
        submitAction,
        isNativeKeyboardEnabled,
      }}
    >
      {children}
    </NativeKeyboardContext.Provider>
  );
};
