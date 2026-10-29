import React from 'react';
import { X, Check, Eye, Sliders, Moon, Sun } from 'lucide-react';
import { useTheme, THEME_OPTIONS, ThemePalette } from '../../context/ThemeContext';

export const ThemeDrawer: React.FC = () => {
  const {
    theme,
    setTheme,
    reducedMotion,
    setReducedMotion,
    isSettingsOpen,
    setIsSettingsOpen,
  } = useTheme();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSettingsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-theme-surface border-l border-theme-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-theme-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-theme-primary-light flex items-center justify-center text-theme-secondary">
                <Sliders className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-theme-text font-display">Theme & Accessibility</h2>
                <p className="text-xs text-theme-text-muted">Personalize RideX visual identity</p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Palette List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                Available Palettes ({THEME_OPTIONS.length})
              </span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3" /> WCAG AA Compliant
              </span>
            </div>

            <div className="space-y-3">
              {THEME_OPTIONS.map((item) => {
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as ThemePalette)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all relative group flex items-start gap-4 ${
                      isSelected
                        ? 'border-theme-primary bg-theme-surface shadow-subtle ring-2 ring-theme-primary/30'
                        : 'border-theme-border bg-theme-surface hover:bg-theme-surface-hover hover:border-theme-text-muted/40'
                    }`}
                  >
                    {/* Visual Color Swatches preview */}
                    <div className="flex flex-col gap-1.5 shrink-0 pt-0.5">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: item.primaryColor }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: item.secondaryColor }}
                        />
                      </div>
                      <span
                        className="w-11 h-3 rounded-md border border-black/10"
                        style={{ backgroundColor: item.bgColor }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-theme-text">{item.name}</span>
                        {item.isDark ? (
                          <span className="text-[10px] font-semibold text-theme-text-muted flex items-center gap-0.5">
                            <Moon className="w-3 h-3" /> Dark
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-theme-text-muted flex items-center gap-0.5">
                            <Sun className="w-3 h-3" /> Light
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-theme-text-muted mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-theme-primary flex items-center justify-center shrink-0 text-theme-secondary shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Accessibility Settings Section */}
            <div className="pt-6 border-t border-theme-border space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
                Motion & Comfort
              </span>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-theme-border bg-theme-surface">
                <div>
                  <h4 className="text-sm font-bold text-theme-text">Reduced Motion</h4>
                  <p className="text-xs text-theme-text-muted">
                    Minimizes animations and transitions across the interface.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    reducedMotion ? 'bg-theme-primary' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-theme-border bg-theme-surface-hover/50 text-center">
            <p className="text-[11px] text-theme-text-muted">
              Themes are saved to your browser and persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
