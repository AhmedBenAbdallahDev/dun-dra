import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UISizingState {
  // Panel dimensions
  panelWidth: {
    mobile: number;
    desktop: number;
    large: number;
  };
  panelHeight: {
    mobile: number;
    desktop: number;
  };
  panelPadding: {
    mobile: number;
    desktop: number;
  };
  panelGap: {
    mobile: number;
    desktop: number;
  };
  panelBorderRadius: number;
  
  // Button sizing
  buttonHeight: {
    mobile: number;
    desktop: number;
  };
  buttonPadding: {
    mobile: number;
    desktop: number;
  };
  buttonBorderRadius: number;
  buttonFontSize: {
    mobile: number;
    desktop: number;
  };
  
  // Item/Icon sizing
  itemSize: {
    mobile: number;
    desktop: number;
  };
  iconSize: {
    mobile: number;
    desktop: number;
  };
  itemGap: {
    mobile: number;
    desktop: number;
  };
  
  // Layout spacing
  mainGap: {
    mobile: number;
    desktop: number;
  };
  containerPadding: {
    mobile: number;
    desktop: number;
  };
  
  // Typography
  titleFontSize: {
    mobile: number;
    desktop: number;
  };
  bodyFontSize: {
    mobile: number;
    desktop: number;
  };
  smallFontSize: {
    mobile: number;
    desktop: number;
  };
  
  // Border properties
  borderWidth: number;
  
  // Choice specific
  choiceButtonHeight: {
    mobile: number;
    desktop: number;
  };
  choiceGap: {
    mobile: number;
    desktop: number;
  };
  
  // Actions
  updateSizing: (key: keyof UISizingState, value: unknown) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => void;
}

// Default values that match current hardcoded values
const defaultSizing = {
  panelWidth: {
    mobile: 50, // Percentage of screen
    desktop: 208, // rem * 4 (52 * 4)
    large: 272, // rem * 4 (68 * 4)
  },
  panelHeight: {
    mobile: 80, // rem * 4 (20 * 4)
    desktop: 100, // Auto height
  },
  panelPadding: {
    mobile: 6, // 1.5rem
    desktop: 12, // 3rem
  },
  panelGap: {
    mobile: 6, // 1.5rem
    desktop: 12, // 3rem
  },
  panelBorderRadius: 8, // 2rem
  
  buttonHeight: {
    mobile: 48, // 12rem
    desktop: 56, // 14rem
  },
  buttonPadding: {
    mobile: 10, // 2.5rem
    desktop: 16, // 4rem
  },
  buttonBorderRadius: 6, // 1.5rem
  buttonFontSize: {
    mobile: 14, // text-sm
    desktop: 16, // text-base
  },
  
  itemSize: {
    mobile: 32, // min-w-[32px]
    desktop: 48, // max-w-[48px]
  },
  iconSize: {
    mobile: 12, // w-3 h-3
    desktop: 16, // w-4 h-4
  },
  itemGap: {
    mobile: 4, // gap-1
    desktop: 8, // gap-2
  },
  
  mainGap: {
    mobile: 6, // gap-1.5
    desktop: 12, // gap-3
  },
  containerPadding: {
    mobile: 8, // p-2
    desktop: 16, // p-4
  },
  
  titleFontSize: {
    mobile: 12, // text-xs
    desktop: 14, // text-sm
  },
  bodyFontSize: {
    mobile: 14, // text-sm
    desktop: 16, // text-base
  },
  smallFontSize: {
    mobile: 10, // text-xs
    desktop: 12, // text-xs
  },
  
  borderWidth: 1,
  
  choiceButtonHeight: {
    mobile: 48, // min-h-[48px]
    desktop: 56, // min-h-[56px]
  },
  choiceGap: {
    mobile: 8, // gap-2
    desktop: 8, // gap-2
  },
};

export const useUISizingStore = create<UISizingState>()(
  persist(
    (set, get) => ({
      ...defaultSizing,
      
      updateSizing: (key, value) => {
        set({ [key]: value });
        // Apply CSS custom properties
        const state = get();
        applyCSS(state);
      },
      
      resetToDefaults: () => {
        set(defaultSizing);
        applyCSS(defaultSizing);
      },
      
      exportSettings: () => {
        const state = get();
        const settings = { ...state };
        // Remove function properties
        const { updateSizing, resetToDefaults, exportSettings, importSettings, ...settingsData } = settings;
        void updateSizing; void resetToDefaults; void exportSettings; void importSettings; // Silence unused vars
        return JSON.stringify(settingsData, null, 2);
      },
      
      importSettings: (settings) => {
        try {
          const parsed = JSON.parse(settings);
          set(parsed);
          applyCSS(parsed);
        } catch (error) {
          console.error('Failed to import UI settings:', error);
        }
      },
    }),
    {
      name: 'mythic-conjurer-ui-sizing',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updateSizing, resetToDefaults, exportSettings, importSettings, ...persistedState } = state;
        return persistedState;
      },
    }
  )
);

// Function to apply CSS custom properties
function applyCSS(sizing: Omit<UISizingState, 'updateSizing' | 'resetToDefaults' | 'exportSettings' | 'importSettings'>) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Panel dimensions
  root.style.setProperty('--panel-width-mobile', `${sizing.panelWidth?.mobile || 50}%`);
  root.style.setProperty('--panel-width-desktop', `${sizing.panelWidth?.desktop || 208}px`);
  root.style.setProperty('--panel-width-large', `${sizing.panelWidth?.large || 272}px`);
  root.style.setProperty('--panel-height-mobile', `${sizing.panelHeight?.mobile || 80}px`);
  root.style.setProperty('--panel-padding-mobile', `${sizing.panelPadding?.mobile || 6}px`);
  root.style.setProperty('--panel-padding-desktop', `${sizing.panelPadding?.desktop || 12}px`);
  root.style.setProperty('--panel-gap-mobile', `${sizing.panelGap?.mobile || 6}px`);
  root.style.setProperty('--panel-gap-desktop', `${sizing.panelGap?.desktop || 12}px`);
  root.style.setProperty('--panel-border-radius', `${sizing.panelBorderRadius || 8}px`);
  
  // Button sizing
  root.style.setProperty('--button-height-mobile', `${sizing.buttonHeight?.mobile || 48}px`);
  root.style.setProperty('--button-height-desktop', `${sizing.buttonHeight?.desktop || 56}px`);
  root.style.setProperty('--button-padding-mobile', `${sizing.buttonPadding?.mobile || 10}px`);
  root.style.setProperty('--button-padding-desktop', `${sizing.buttonPadding?.desktop || 16}px`);
  root.style.setProperty('--button-border-radius', `${sizing.buttonBorderRadius || 6}px`);
  root.style.setProperty('--button-font-size-mobile', `${sizing.buttonFontSize?.mobile || 14}px`);
  root.style.setProperty('--button-font-size-desktop', `${sizing.buttonFontSize?.desktop || 16}px`);
  
  // Item/Icon sizing
  root.style.setProperty('--item-size-mobile', `${sizing.itemSize?.mobile || 32}px`);
  root.style.setProperty('--item-size-desktop', `${sizing.itemSize?.desktop || 48}px`);
  root.style.setProperty('--icon-size-mobile', `${sizing.iconSize?.mobile || 12}px`);
  root.style.setProperty('--icon-size-desktop', `${sizing.iconSize?.desktop || 16}px`);
  root.style.setProperty('--item-gap-mobile', `${sizing.itemGap?.mobile || 4}px`);
  root.style.setProperty('--item-gap-desktop', `${sizing.itemGap?.desktop || 8}px`);
  
  // Layout spacing
  root.style.setProperty('--main-gap-mobile', `${sizing.mainGap?.mobile || 6}px`);
  root.style.setProperty('--main-gap-desktop', `${sizing.mainGap?.desktop || 12}px`);
  root.style.setProperty('--container-padding-mobile', `${sizing.containerPadding?.mobile || 8}px`);
  root.style.setProperty('--container-padding-desktop', `${sizing.containerPadding?.desktop || 16}px`);
  
  // Typography
  root.style.setProperty('--title-font-size-mobile', `${sizing.titleFontSize?.mobile || 12}px`);
  root.style.setProperty('--title-font-size-desktop', `${sizing.titleFontSize?.desktop || 14}px`);
  root.style.setProperty('--body-font-size-mobile', `${sizing.bodyFontSize?.mobile || 14}px`);
  root.style.setProperty('--body-font-size-desktop', `${sizing.bodyFontSize?.desktop || 16}px`);
  root.style.setProperty('--small-font-size-mobile', `${sizing.smallFontSize?.mobile || 10}px`);
  root.style.setProperty('--small-font-size-desktop', `${sizing.smallFontSize?.desktop || 12}px`);
  
  // Border properties
  root.style.setProperty('--border-width', `${sizing.borderWidth || 1}px`);
  
  // Choice specific
  root.style.setProperty('--choice-button-height-mobile', `${sizing.choiceButtonHeight?.mobile || 48}px`);
  root.style.setProperty('--choice-button-height-desktop', `${sizing.choiceButtonHeight?.desktop || 56}px`);
  root.style.setProperty('--choice-gap-mobile', `${sizing.choiceGap?.mobile || 8}px`);
  root.style.setProperty('--choice-gap-desktop', `${sizing.choiceGap?.desktop || 8}px`);
}
