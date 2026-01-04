import { globalEventBus } from '../events';

export class VisibilityManager {
  constructor() {
    this.init();
  }

  private init() {
    // Standard Page Visibility API
    if (typeof document !== 'undefined' && typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.emitStatusChange();
      });
    }

    // Fallback / Supplemental (window blur/focus)
    if (typeof window !== 'undefined') {
      window.addEventListener('blur', () => {
        this.emitStatusChange();
      });
      window.addEventListener('focus', () => {
        this.emitStatusChange();
      });
    }
  }

  public now(): boolean {
    if (typeof document === 'undefined') return true;

    // Primary check
    if (document.hidden) {
      return false;
    }

    // Note: document.hidden is usually enough, but strictly speaking "active" implies focus?
    // The intent says "rely on standard Page Visibility API".
    // "active/visible".
    // If usage requires strictly "user is here", might need checking connection.
    // But implementation says "document.hidden" is the primary source.
    return !document.hidden;
  }

  private emitStatusChange() {
    const isVisible = this.now();
    // Normalize to 'blur' (hidden) or 'focus' (visible) for the public API
    if (isVisible) {
      globalEventBus.emit('focus');
      globalEventBus.emit('wakeup'); // Regaining focus is also a wakeup event strictly speaking?
                                     // Actually wakeup is usually paired with idle.
                                     // Let's stick to base events first.
      globalEventBus.emit('statusChanged');
    } else {
      globalEventBus.emit('blur');
      globalEventBus.emit('statusChanged');
    }
  }
}

export const visibilityManager = new VisibilityManager();
