'use client';

import React, { useEffect, useState } from 'react';
import { Leva, useControls, button } from 'leva';
import { useUISizingStore } from '@/stores/uiSizingStore';

export default function UISizingPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const sizing = useUISizingStore();

  // Keyboard listener for "U" key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'u' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Check if user is not typing in an input
        const activeElement = document.activeElement;
        const isInputFocused = activeElement?.tagName === 'INPUT' || 
                              activeElement?.tagName === 'TEXTAREA' || 
                              (activeElement as HTMLElement)?.contentEditable === 'true';
        
        if (!isInputFocused) {
          event.preventDefault();
          setIsVisible(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Leva controls configuration
  const controls = useControls('🎨 UI Sizing', {
    // Panel Controls
    panelWidthMobile: { 
      value: sizing.panelWidth.mobile, 
      min: 30, 
      max: 100, 
      step: 5,
      label: 'Panel Width Mobile (%)'
    },
    panelWidthDesktop: { 
      value: sizing.panelWidth.desktop, 
      min: 150, 
      max: 400, 
      step: 8,
      label: 'Panel Width Desktop (px)'
    },
    panelHeightMobile: { 
      value: sizing.panelHeight.mobile, 
      min: 60, 
      max: 120, 
      step: 4,
      label: 'Panel Height Mobile (px)'
    },
    panelPaddingMobile: { 
      value: sizing.panelPadding.mobile, 
      min: 2, 
      max: 20, 
      step: 1,
      label: 'Panel Padding Mobile (px)'
    },
    panelPaddingDesktop: { 
      value: sizing.panelPadding.desktop, 
      min: 4, 
      max: 32, 
      step: 2,
      label: 'Panel Padding Desktop (px)'
    },
    panelGapMobile: { 
      value: sizing.panelGap.mobile, 
      min: 2, 
      max: 20, 
      step: 1,
      label: 'Panel Gap Mobile (px)'
    },
    panelGapDesktop: { 
      value: sizing.panelGap.desktop, 
      min: 4, 
      max: 32, 
      step: 2,
      label: 'Panel Gap Desktop (px)'
    },
    panelBorderRadius: { 
      value: sizing.panelBorderRadius, 
      min: 0, 
      max: 24, 
      step: 1,
      label: 'Panel Border Radius (px)'
    },

    // Button Controls
    buttonHeightMobile: { 
      value: sizing.buttonHeight.mobile, 
      min: 32, 
      max: 80, 
      step: 2,
      label: 'Button Height Mobile (px)'
    },
    buttonHeightDesktop: { 
      value: sizing.buttonHeight.desktop, 
      min: 40, 
      max: 96, 
      step: 2,
      label: 'Button Height Desktop (px)'
    },
    buttonPaddingMobile: { 
      value: sizing.buttonPadding.mobile, 
      min: 4, 
      max: 24, 
      step: 1,
      label: 'Button Padding Mobile (px)'
    },
    buttonPaddingDesktop: { 
      value: sizing.buttonPadding.desktop, 
      min: 8, 
      max: 32, 
      step: 2,
      label: 'Button Padding Desktop (px)'
    },
    buttonBorderRadius: { 
      value: sizing.buttonBorderRadius, 
      min: 0, 
      max: 16, 
      step: 1,
      label: 'Button Border Radius (px)'
    },

    // Item Controls
    itemSizeMobile: { 
      value: sizing.itemSize.mobile, 
      min: 24, 
      max: 64, 
      step: 2,
      label: 'Item Size Mobile (px)'
    },
    itemSizeDesktop: { 
      value: sizing.itemSize.desktop, 
      min: 32, 
      max: 80, 
      step: 2,
      label: 'Item Size Desktop (px)'
    },
    iconSizeMobile: { 
      value: sizing.iconSize.mobile, 
      min: 8, 
      max: 24, 
      step: 1,
      label: 'Icon Size Mobile (px)'
    },
    iconSizeDesktop: { 
      value: sizing.iconSize.desktop, 
      min: 12, 
      max: 32, 
      step: 1,
      label: 'Icon Size Desktop (px)'
    },

    // Layout Controls
    mainGapMobile: { 
      value: sizing.mainGap.mobile, 
      min: 2, 
      max: 24, 
      step: 1,
      label: 'Main Gap Mobile (px)'
    },
    mainGapDesktop: { 
      value: sizing.mainGap.desktop, 
      min: 4, 
      max: 32, 
      step: 2,
      label: 'Main Gap Desktop (px)'
    },

    // Typography
    titleFontSizeMobile: { 
      value: sizing.titleFontSize.mobile, 
      min: 8, 
      max: 20, 
      step: 1,
      label: 'Title Font Size Mobile (px)'
    },
    titleFontSizeDesktop: { 
      value: sizing.titleFontSize.desktop, 
      min: 10, 
      max: 24, 
      step: 1,
      label: 'Title Font Size Desktop (px)'
    },
    bodyFontSizeMobile: { 
      value: sizing.bodyFontSize.mobile, 
      min: 10, 
      max: 20, 
      step: 1,
      label: 'Body Font Size Mobile (px)'
    },
    bodyFontSizeDesktop: { 
      value: sizing.bodyFontSize.desktop, 
      min: 12, 
      max: 24, 
      step: 1,
      label: 'Body Font Size Desktop (px)'
    },

    // Choice Controls
    choiceButtonHeightMobile: { 
      value: sizing.choiceButtonHeight.mobile, 
      min: 32, 
      max: 80, 
      step: 2,
      label: 'Choice Button Height Mobile (px)'
    },
    choiceButtonHeightDesktop: { 
      value: sizing.choiceButtonHeight.desktop, 
      min: 40, 
      max: 96, 
      step: 2,
      label: 'Choice Button Height Desktop (px)'
    },

    // Utility Controls
    borderWidth: { 
      value: sizing.borderWidth, 
      min: 0, 
      max: 4, 
      step: 1,
      label: 'Border Width (px)'
    },

    // Action buttons
    resetToDefaults: button(() => {
      sizing.resetToDefaults();
      window.location.reload();
    }),
    exportSettings: button(() => {
      const settings = sizing.exportSettings();
      navigator.clipboard.writeText(settings).then(() => {
        alert('Settings copied to clipboard!');
      }).catch(() => {
        alert(`Settings exported:\n\n${settings}`);
      });
    }),
    importSettings: button(async () => {
      try {
        const text = await navigator.clipboard.readText();
        sizing.importSettings(text);
        alert('Settings imported successfully!');
        window.location.reload();
      } catch {
        const settings = prompt('Paste your settings JSON here:');
        if (settings) {
          try {
            sizing.importSettings(settings);
            alert('Settings imported successfully!');
            window.location.reload();
          } catch {
            alert('Invalid settings format!');
          }
        }
      }
    }),
  });

  // Update store when Leva controls change
  useEffect(() => {
    sizing.updateSizing('panelWidth', { 
      mobile: controls.panelWidthMobile, 
      desktop: controls.panelWidthDesktop, 
      large: sizing.panelWidth.large 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.panelWidthMobile, controls.panelWidthDesktop]);

  useEffect(() => {
    sizing.updateSizing('panelHeight', { 
      mobile: controls.panelHeightMobile, 
      desktop: sizing.panelHeight.desktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.panelHeightMobile]);

  useEffect(() => {
    sizing.updateSizing('panelPadding', { 
      mobile: controls.panelPaddingMobile, 
      desktop: controls.panelPaddingDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.panelPaddingMobile, controls.panelPaddingDesktop]);

  useEffect(() => {
    sizing.updateSizing('panelGap', { 
      mobile: controls.panelGapMobile, 
      desktop: controls.panelGapDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.panelGapMobile, controls.panelGapDesktop]);

  useEffect(() => {
    sizing.updateSizing('panelBorderRadius', controls.panelBorderRadius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.panelBorderRadius]);

  useEffect(() => {
    sizing.updateSizing('buttonHeight', { 
      mobile: controls.buttonHeightMobile, 
      desktop: controls.buttonHeightDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.buttonHeightMobile, controls.buttonHeightDesktop]);

  useEffect(() => {
    sizing.updateSizing('buttonPadding', { 
      mobile: controls.buttonPaddingMobile, 
      desktop: controls.buttonPaddingDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.buttonPaddingMobile, controls.buttonPaddingDesktop]);

  useEffect(() => {
    sizing.updateSizing('buttonBorderRadius', controls.buttonBorderRadius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.buttonBorderRadius]);

  useEffect(() => {
    sizing.updateSizing('itemSize', { 
      mobile: controls.itemSizeMobile, 
      desktop: controls.itemSizeDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.itemSizeMobile, controls.itemSizeDesktop]);

  useEffect(() => {
    sizing.updateSizing('iconSize', { 
      mobile: controls.iconSizeMobile, 
      desktop: controls.iconSizeDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.iconSizeMobile, controls.iconSizeDesktop]);

  useEffect(() => {
    sizing.updateSizing('mainGap', { 
      mobile: controls.mainGapMobile, 
      desktop: controls.mainGapDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.mainGapMobile, controls.mainGapDesktop]);

  useEffect(() => {
    sizing.updateSizing('titleFontSize', { 
      mobile: controls.titleFontSizeMobile, 
      desktop: controls.titleFontSizeDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.titleFontSizeMobile, controls.titleFontSizeDesktop]);

  useEffect(() => {
    sizing.updateSizing('bodyFontSize', { 
      mobile: controls.bodyFontSizeMobile, 
      desktop: controls.bodyFontSizeDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.bodyFontSizeMobile, controls.bodyFontSizeDesktop]);

  useEffect(() => {
    sizing.updateSizing('choiceButtonHeight', { 
      mobile: controls.choiceButtonHeightMobile, 
      desktop: controls.choiceButtonHeightDesktop 
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.choiceButtonHeightMobile, controls.choiceButtonHeightDesktop]);

  useEffect(() => {
    sizing.updateSizing('borderWidth', controls.borderWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.borderWidth]);

  return (
    <>
      {/* Keyboard hint */}
      {!isVisible && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg px-3 py-2 text-slate-300 text-sm pointer-events-none">
          Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded border border-slate-600 font-mono text-xs">U</kbd> for UI sizing panel
        </div>
      )}
      
      {/* Leva Panel */}
      <Leva 
        hidden={!isVisible}
        titleBar={{
          title: '🎨 UI Customization Panel',
          drag: true,
        }}
        collapsed={false}
        oneLineLabels={false}
        fill={false}
        flat={false}
        theme={{
          colors: {
            elevation1: '#1e293b',
            elevation2: '#334155',
            elevation3: '#475569',
            accent1: '#f59e0b',
            accent2: '#d97706',
            accent3: '#92400e',
            highlight1: '#3b82f6',
            highlight2: '#1d4ed8',
            highlight3: '#1e40af',
            vivid1: '#10b981',
          },
          fontSizes: {
            root: '11px',
          },
          sizes: {
            rootWidth: '340px',
            controlWidth: '160px',
          },
          space: {
            xs: '3px',
            sm: '6px',
            md: '10px',
            rowGap: '7px',
            colGap: '7px',
          },
        }}
      />
    </>
  );
}
