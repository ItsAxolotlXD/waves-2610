import { useSyncExternalStore } from 'react';
import { CustomKeybinds } from '../types';
import { DEFAULT_KEYBINDS } from '../utils/keybinds';
import { keyboardSound } from '../utils/keyboardSound';

export interface SystemSettings {
  theme: 'dark' | 'light';
  superDarkMode: boolean;
  spatialGlass: boolean;
  spatialGlassVersion?: number;
  spatialGlassOpacity: number; // 0 to 100 (%)
  spatialGlassBlur: number; // 0 to 100 (%)
  disableShinyOutline?: boolean;
  dockToSidebar: boolean;
  fontScale: number; // 0: Cực nhỏ, 1: Nhỏ, 2: Trung bình, 3: Lớn, 4: Cực lớn
  fontScaleVersion?: number;
  autoScrollBanner: boolean;
  autoHideSidebar: boolean;
  searchCategories: boolean;
  searchNews: boolean;
  searchTv: boolean;
  searchChannelNumber: boolean;
  searchSettings: boolean;
  reduceAllMotion: boolean;
  animateSidebar: boolean;
  animateModals: boolean;
  animatePageTransitions: boolean;
  immersiveSearch: boolean;
  nativeKeyboard: boolean;
  keyboardNumberRow: boolean;
  keyboardClipboard: boolean;
  keyboardSoundEnabled: boolean;
  immersiveSidebar: boolean;
  sidebarPosition: 'left' | 'right';
  navigationMode: 'sidebar' | 'topbar' | 'floaty';
  navModeVersion?: number;
  floatingSearchBar: boolean;
  floatingSearchBarVersion?: number;
  streamAspectRatio: '16:9' | '4:3';
  developerMode: boolean;
  customKeybinds: CustomKeybinds;
}

export const getDefaultNavigationMode = (): 'sidebar' | 'topbar' | 'floaty' => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return 'floaty';
  }
  return 'topbar';
};

export const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'dark', // Ban đêm là mặc định
  superDarkMode: false,
  spatialGlass: true,
  spatialGlassVersion: 3,
  spatialGlassOpacity: 20, // 20%
  spatialGlassBlur: 10, // 10%
  disableShinyOutline: false,
  dockToSidebar: true,
  fontScale: 2, // Mặc định là "Trung bình" (quy chuẩn chuẩn cho cả desktop nhỏ và mobile)
  fontScaleVersion: 2,
  autoScrollBanner: true,
  autoHideSidebar: false,
  searchCategories: true,
  searchNews: true,
  searchTv: true,
  searchChannelNumber: true,
  searchSettings: true,
  reduceAllMotion: false,
  animateSidebar: true,
  animateModals: true,
  animatePageTransitions: true,
  immersiveSearch: true,
  nativeKeyboard: false,
  keyboardNumberRow: false,
  keyboardClipboard: true,
  keyboardSoundEnabled: true,
  immersiveSidebar: false,
  sidebarPosition: 'left',
  navigationMode: getDefaultNavigationMode(),
  navModeVersion: 2,
  floatingSearchBar: true,
  floatingSearchBarVersion: 1,
  streamAspectRatio: '16:9',
  developerMode: false,
  customKeybinds: DEFAULT_KEYBINDS,
};

export const FONT_SCALE_CONFIG = [
  { label: 'Cực nhỏ', value: 75, badge: 'Cực nhỏ', scale: '0.78' },
  { label: 'Nhỏ', value: 88, badge: 'Nhỏ', scale: '0.88' },
  { label: 'Trung bình', value: 100, badge: 'Trung bình', scale: '1' },
  { label: 'Lớn', value: 112, badge: 'Lớn', scale: '1.12' },
  { label: 'Cực lớn', value: 125, badge: 'Cực lớn', scale: '1.24' },
];

export const getStoredSettings = (): SystemSettings => {
  try {
    const saved = localStorage.getItem('waves_system_settings');
    
    if (saved) {
      const parsed = JSON.parse(saved);
      let fontScale = typeof parsed.fontScale === 'number' ? parsed.fontScale : DEFAULT_SETTINGS.fontScale;
      // Auto-migrate from old 4-item scheme if needed
      if (parsed.fontScaleVersion !== 2) {
        if (fontScale === 1) {
          fontScale = 2; // Old 'Mặc định' was idx 1 -> now 'Trung bình' at idx 2
        } else if (fontScale === 0) {
          fontScale = 1; // Old 'Nhỏ' was idx 0 -> now 'Nhỏ' at idx 1
        } else if (fontScale === 2) {
          fontScale = 3; // Old 'Lớn' was idx 2 -> now 'Lớn' at idx 3
        } else if (fontScale === 3) {
          fontScale = 4; // Old 'Cực lớn' was idx 3 -> now 'Cực lớn' at idx 4
        } else {
          fontScale = 2;
        }
      }
      let navigationMode = parsed.navigationMode;
      if (navigationMode === 'immersive' || navigationMode === 'immersive_floaty') {
        navigationMode = 'floaty';
      }
      // Migrate old default 'sidebar' or unversioned nav mode to new platform defaults (topbar desktop / floaty mobile)
      if (!navigationMode || (parsed.navModeVersion !== 2 && navigationMode === 'sidebar')) {
        navigationMode = getDefaultNavigationMode();
      }
      const immersiveSearch = parsed.immersiveSearchVersion === 2
        ? parsed.immersiveSearch
        : true;
      const theme = parsed.theme === 'light' ? 'light' : 'dark';
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed,
        theme,
        immersiveSearch,
        immersiveSearchVersion: 2,
        navigationMode: navigationMode || DEFAULT_SETTINGS.navigationMode,
        navModeVersion: 2,
        floatingSearchBar: parsed.floatingSearchBarVersion === 1
          ? (typeof parsed.floatingSearchBar === 'boolean' ? parsed.floatingSearchBar : true)
          : true,
        floatingSearchBarVersion: 1,
        nativeKeyboard: typeof parsed.nativeKeyboard === 'boolean' ? parsed.nativeKeyboard : DEFAULT_SETTINGS.nativeKeyboard,
        keyboardNumberRow: typeof parsed.keyboardNumberRow === 'boolean' ? parsed.keyboardNumberRow : DEFAULT_SETTINGS.keyboardNumberRow,
        keyboardClipboard: typeof parsed.keyboardClipboard === 'boolean' ? parsed.keyboardClipboard : DEFAULT_SETTINGS.keyboardClipboard,
        keyboardSoundEnabled: typeof parsed.keyboardSoundEnabled === 'boolean' ? parsed.keyboardSoundEnabled : DEFAULT_SETTINGS.keyboardSoundEnabled,
        superDarkMode: typeof parsed.superDarkMode === 'boolean' ? parsed.superDarkMode : DEFAULT_SETTINGS.superDarkMode,
        spatialGlass: parsed.spatialGlassVersion >= 2
          ? (typeof parsed.spatialGlass === 'boolean' ? parsed.spatialGlass : true)
          : true,
        spatialGlassVersion: 3,
        spatialGlassOpacity: typeof parsed.spatialGlassOpacity === 'number'
          ? Math.max(0, Math.min(100, parsed.spatialGlassOpacity))
          : 20,
        spatialGlassBlur: (parsed.spatialGlassVersion === 3 && typeof parsed.spatialGlassBlur === 'number')
          ? Math.max(0, Math.min(100, parsed.spatialGlassBlur))
          : 10,
        disableShinyOutline: false,
        customKeybinds: {
          ...DEFAULT_KEYBINDS,
          ...(parsed.customKeybinds || {})
        },
        fontScale,
        fontScaleVersion: 2,
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
};

// Apply side-effects (theme class, font-scale property)
export const applySystemSettings = (settings: SystemSettings) => {
  if (typeof document === 'undefined') return;

  // App Theme Mode (Ban ngày / Ban đêm - Ban đêm là mặc định)
  if (settings.theme === 'light') {
    document.documentElement.classList.add('light-mode');
    document.documentElement.classList.remove('dark');
    document.body?.classList.add('light-mode');
  } else {
    document.documentElement.classList.remove('light-mode');
    document.documentElement.classList.add('dark');
    document.body?.classList.remove('light-mode');
  }
  document.documentElement.dataset.immersiveSidebar = String(settings.immersiveSidebar);
  document.documentElement.dataset.sidebarPosition = settings.sidebarPosition;

  // Super Dark Mode
  if (settings.superDarkMode) {
    document.documentElement.classList.add('super-dark');
    document.body?.classList.add('super-dark');
  } else {
    document.documentElement.classList.remove('super-dark');
    document.body?.classList.remove('super-dark');
  }

  // Spatial Glass (when turned off, all borders on elements across the app disappear)
  const isSpatialGlassActive = settings.spatialGlass !== false;
  const opacity = typeof settings.spatialGlassOpacity === 'number' ? settings.spatialGlassOpacity : 20;
  const blur = typeof settings.spatialGlassBlur === 'number' ? settings.spatialGlassBlur : 10;
  const isDarkContent = isSpatialGlassActive && opacity > 40;
  document.documentElement.classList.toggle('spatial-glass-dark-content', isDarkContent);

  if (!isSpatialGlassActive) {
    document.documentElement.classList.add('no-spatial-glass', 'no-shiny-outline');
    document.body?.classList.add('no-spatial-glass', 'no-shiny-outline');
    document.documentElement.style.setProperty('--spatial-glass-opacity', '0');
    document.documentElement.style.setProperty('--spatial-glass-bg', 'rgba(24, 24, 27, 0.85)');
    document.documentElement.style.setProperty('--spatial-glass-blur', '0px');
  } else {
    document.documentElement.classList.remove('no-spatial-glass', 'no-shiny-outline');
    document.body?.classList.remove('no-spatial-glass', 'no-shiny-outline');
    const opacityVal = opacity / 100;
    const blurPx = Math.round((blur / 100) * 40);
    document.documentElement.style.setProperty('--spatial-glass-opacity', String(opacityVal));
    document.documentElement.style.setProperty('--spatial-glass-bg', `rgba(255, 255, 255, ${opacityVal})`);
    document.documentElement.style.setProperty('--spatial-glass-blur', `${blurPx}px`);
  }

  // Apply font scale
  const scaleVal = FONT_SCALE_CONFIG[settings.fontScale]?.scale || '1';
  document.documentElement.style.setProperty('--waves-font-scale', scaleVal);

  // Apply keyboard sound preference
  keyboardSound.setEnabled(settings.keyboardSoundEnabled !== false);
};

// Initialize current settings and apply them to DOM immediately
let settingsStore = getStoredSettings();
let draftSettingsStore: SystemSettings = { ...settingsStore };

if (typeof window !== 'undefined') {
  applySystemSettings(settingsStore);
}

const listeners = new Set<() => void>();
const draftListeners = new Set<() => void>();

function notifyDraftListeners() {
  draftListeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error(err);
    }
  });
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'waves_system_settings' || e.key === 'waves_theme' || !e.key) {
      settingsStore = getStoredSettings();
      draftSettingsStore = { ...settingsStore };
      applySystemSettings(settingsStore);
      callback();
      notifyDraftListeners();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function subscribeDraft(callback: () => void) {
  draftListeners.add(callback);
  return () => {
    draftListeners.delete(callback);
  };
}

function getSnapshot(): SystemSettings {
  return settingsStore;
}

function getDraftSnapshot(): SystemSettings {
  return draftSettingsStore;
}

export const updateDraftSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
  draftSettingsStore = { ...draftSettingsStore, [key]: value };
  if (typeof document !== 'undefined' && (key === 'spatialGlassOpacity' || key === 'spatialGlassBlur' || key === 'spatialGlass')) {
    const isAct = key === 'spatialGlass' ? Boolean(value) : (draftSettingsStore.spatialGlass !== false);
    const opacity = key === 'spatialGlassOpacity' ? Number(value) : (draftSettingsStore.spatialGlassOpacity ?? 20);
    const blur = key === 'spatialGlassBlur' ? Number(value) : (draftSettingsStore.spatialGlassBlur ?? 10);
    const isDarkContent = isAct && opacity > 40;
    document.documentElement.classList.toggle('spatial-glass-dark-content', isDarkContent);

    if (!isAct) {
      document.documentElement.style.setProperty('--spatial-glass-opacity', '0');
      document.documentElement.style.setProperty('--spatial-glass-bg', 'rgba(24, 24, 27, 0.85)');
      document.documentElement.style.setProperty('--spatial-glass-blur', '0px');
    } else {
      const opacityVal = opacity / 100;
      const blurPx = Math.round((blur / 100) * 40);
      document.documentElement.style.setProperty('--spatial-glass-opacity', String(opacityVal));
      document.documentElement.style.setProperty('--spatial-glass-bg', `rgba(255, 255, 255, ${opacityVal})`);
      document.documentElement.style.setProperty('--spatial-glass-blur', `${blurPx}px`);
    }
  }
  notifyDraftListeners();
};

export const discardDraftSettings = () => {
  draftSettingsStore = { ...settingsStore };
  applySystemSettings(settingsStore);
  notifyDraftListeners();
};

export const applyDraftSettings = () => {
  updateMultipleSettings(draftSettingsStore);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('settings-applied-toast', { 
      detail: { timestamp: Date.now() } 
    }));
  }
};

export const updateGlobalSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
  settingsStore = { ...settingsStore, [key]: value, fontScaleVersion: 2, spatialGlassVersion: 3 };
  draftSettingsStore = { ...settingsStore };
  try {
    localStorage.setItem('waves_system_settings', JSON.stringify(settingsStore));
    if (key === 'theme') {
      localStorage.setItem('waves_theme', value as string);
    }
  } catch {}
  applySystemSettings(settingsStore);
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error(err);
    }
  });
  notifyDraftListeners();
};

export const updateMultipleSettings = (newSettings: Partial<SystemSettings>) => {
  settingsStore = { ...settingsStore, ...newSettings, fontScaleVersion: 2, spatialGlassVersion: 3 };
  draftSettingsStore = { ...settingsStore };
  try {
    localStorage.setItem('waves_system_settings', JSON.stringify(settingsStore));
    if (newSettings.theme) {
      localStorage.setItem('waves_theme', newSettings.theme);
    }
  } catch {}
  applySystemSettings(settingsStore);
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error(err);
    }
  });
  notifyDraftListeners();
};

export const useSettings = () => {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const draftSettings = useSyncExternalStore(subscribeDraft, getDraftSnapshot, getDraftSnapshot);

  const keys = Object.keys(draftSettings) as (keyof SystemSettings)[];
  const changedKeys = keys.filter((k) => draftSettings[k] !== settings[k]);
  const hasChanges = changedKeys.length > 0;

  return { 
    settings, 
    draftSettings,
    hasChanges,
    changedKeys,
    updateSetting: updateGlobalSetting,
    updateMultipleSettings,
    updateDraftSetting,
    applyDraftSettings,
    discardDraftSettings
  };
};
