'use client';

import { useEffect } from 'react';
import { useUISizingStore } from '@/stores/uiSizingStore';

export default function UISizingInitializer() {
  const sizing = useUISizingStore();

  useEffect(() => {
    // Initialize CSS custom properties on app load
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Apply all sizing values as CSS custom properties
      root.style.setProperty('--panel-width-mobile', `${sizing.panelWidth?.mobile || 50}%`);
      root.style.setProperty('--panel-width-desktop', `${sizing.panelWidth?.desktop || 208}px`);
      root.style.setProperty('--panel-height-mobile', `${sizing.panelHeight?.mobile || 80}px`);
      root.style.setProperty('--panel-padding-mobile', `${sizing.panelPadding?.mobile || 6}px`);
      root.style.setProperty('--panel-padding-desktop', `${sizing.panelPadding?.desktop || 12}px`);
      root.style.setProperty('--panel-gap-mobile', `${sizing.panelGap?.mobile || 6}px`);
      root.style.setProperty('--panel-gap-desktop', `${sizing.panelGap?.desktop || 12}px`);
      root.style.setProperty('--panel-border-radius', `${sizing.panelBorderRadius || 8}px`);
      
      root.style.setProperty('--button-height-mobile', `${sizing.buttonHeight?.mobile || 48}px`);
      root.style.setProperty('--button-height-desktop', `${sizing.buttonHeight?.desktop || 56}px`);
      root.style.setProperty('--button-padding-mobile', `${sizing.buttonPadding?.mobile || 10}px`);
      root.style.setProperty('--button-padding-desktop', `${sizing.buttonPadding?.desktop || 16}px`);
      root.style.setProperty('--button-border-radius', `${sizing.buttonBorderRadius || 6}px`);
      
      root.style.setProperty('--item-size-mobile', `${sizing.itemSize?.mobile || 32}px`);
      root.style.setProperty('--item-size-desktop', `${sizing.itemSize?.desktop || 48}px`);
      root.style.setProperty('--icon-size-mobile', `${sizing.iconSize?.mobile || 12}px`);
      root.style.setProperty('--icon-size-desktop', `${sizing.iconSize?.desktop || 16}px`);
      
      root.style.setProperty('--main-gap-mobile', `${sizing.mainGap?.mobile || 6}px`);
      root.style.setProperty('--main-gap-desktop', `${sizing.mainGap?.desktop || 12}px`);
      
      root.style.setProperty('--title-font-size-mobile', `${sizing.titleFontSize?.mobile || 12}px`);
      root.style.setProperty('--title-font-size-desktop', `${sizing.titleFontSize?.desktop || 14}px`);
      root.style.setProperty('--body-font-size-mobile', `${sizing.bodyFontSize?.mobile || 14}px`);
      root.style.setProperty('--body-font-size-desktop', `${sizing.bodyFontSize?.desktop || 16}px`);
      
      root.style.setProperty('--choice-button-height-mobile', `${sizing.choiceButtonHeight?.mobile || 48}px`);
      root.style.setProperty('--choice-button-height-desktop', `${sizing.choiceButtonHeight?.desktop || 56}px`);
      
      root.style.setProperty('--border-width', `${sizing.borderWidth || 1}px`);
    }
  }, [sizing]);

  return null; // This component doesn't render anything
}
