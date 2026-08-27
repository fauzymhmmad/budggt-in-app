import { useEffect } from 'react';

interface ShortcutOptions {
  onOpenCommandPalette?: () => void;
  onOpenNewTransaction?: () => void;
  onTogglePrivacy?: () => void;
  onSelectTab?: (index: number) => void;
  onCloseModal?: () => void;
}

export function useKeyboardShortcuts(options: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is actively typing in an input/textarea/select
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + K: Command Palette
      if (modifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        options.onOpenCommandPalette?.();
        return;
      }

      // Cmd/Ctrl + Shift + P: Privacy Mode
      if (modifier && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        options.onTogglePrivacy?.();
        return;
      }

      // Escape key: Close modals
      if (e.key === 'Escape') {
        options.onCloseModal?.();
        return;
      }

      // Shortcuts below should only trigger when NOT typing in an input
      if (isInput) return;

      // 'N' or Cmd+N: New transaction
      if (e.key.toLowerCase() === 'n' && !modifier) {
        e.preventDefault();
        options.onOpenNewTransaction?.();
        return;
      }

      // Number keys 1-7 for tabs
      if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key) && !modifier) {
        const tabIndex = parseInt(e.key, 10) - 1;
        options.onSelectTab?.(tabIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
