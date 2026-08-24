import React from 'react';

export type NavTab = 'home' | 'learning-path' | 'practice' | 'schema' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface-base/90 backdrop-blur-xl pb-safe border-t border-outline-variant/40">
      <div className="flex justify-between items-center h-16 px-gutter max-w-lg mx-auto">
        <button
          onClick={() => onTabChange('learning-path')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'home' || activeTab === 'learning-path'
              ? 'text-primary-container'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          data-path="learning-path"
        >
          <span className="material-symbols-outlined text-[22px]">route</span>
          <span className="font-label-sm text-label-sm mt-0.5 font-medium">Path</span>
        </button>

        <button
          onClick={() => onTabChange('practice')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'practice'
              ? 'text-primary-container'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          data-path="practice"
        >
          <span className="material-symbols-outlined text-[22px]">exercise</span>
          <span className="font-label-sm text-label-sm mt-0.5 font-medium">Practice</span>
        </button>

        <button
          onClick={() => onTabChange('schema')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'schema'
              ? 'text-primary-container'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          data-path="schema"
        >
          <span className="material-symbols-outlined text-[22px]">database</span>
          <span className="font-label-sm text-label-sm mt-0.5 font-medium">Schema</span>
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'text-primary-container'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          data-path="settings"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
          <span className="font-label-sm text-label-sm mt-0.5 font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
};
