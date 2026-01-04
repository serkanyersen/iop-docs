import { globalEventBus } from './events';
import { visibilityManager } from './core/visibility';
import { idlenessManager } from './core/idleness';

interface SmartIntervalControl {
  stop: () => void;
  pause: () => void;
  resume: () => void;
  code: number;
}

const ifvisible = {
  // Event Subscription
  on: (event: string, callback: () => void) => {
    globalEventBus.on(event, callback);
  },
  off: (event: string, callback?: () => void) => {
    globalEventBus.off(event, callback);
  },

  // Status Check
  now: () => {
    return visibilityManager.now();
  },

  // Configuration
  setIdleDuration: (seconds: number) => {
    idlenessManager.setIdleDuration(seconds * 1000);
  },

  // Manual Triggers
  idle: () => idlenessManager.manualIdle(),
  wakeup: () => idlenessManager.manualWakeup(),
  blur: () => {
    // There isn't a direct "manual blur" in VisibilityManager, but we can emit the event.
    // Ideally we should fake the state, but `document.hidden` is read-only.
    // For testing purposes, emulating the event is often enough.
    globalEventBus.emit('blur');
  },
  focus: () => {
    globalEventBus.emit('focus');
    globalEventBus.emit('wakeup');
  },

  // Smart Interval
  onEvery: (seconds: number, callback: () => void): SmartIntervalControl => {
    let timer: number | undefined;
    const ms = seconds * 1000;
    let paused = false;

    const start = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!paused && visibilityManager.now()) {
          callback();
        }
      }, ms) as unknown as number;
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    const pause = () => {
      paused = true;
    };

    const resume = () => {
      paused = false;
      // Restarting isn't strictly necessary if interval is running but just blocked by flag,
      // but maybe we want to re-sync?
      // Simple flag check in interval is easier.
    };

    // Auto pause/resume logic
    globalEventBus.on('blur', pause);
    globalEventBus.on('idle', pause);
    globalEventBus.on('focus', resume);
    globalEventBus.on('wakeup', resume);

    start();

    return {
      stop,
      pause,
      resume,
      code: timer as number // Expose timer ID if needed
    };
  }
};

// Export properly for IIFE
// In Vite IIFE build, the default export is assigned to the global variable name (ifvisible)
export default ifvisible;
