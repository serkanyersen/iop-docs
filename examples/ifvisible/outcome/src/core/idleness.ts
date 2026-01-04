import { globalEventBus } from '../events';


export class IdlenessManager {
  private idleTime: number = 60000; // 60 seconds
  private timer: number | undefined; // NodeJS.Timeout or number
  private isIdle: boolean = false;


  constructor() {
    this.init();
  }

  public setIdleDuration(ms: number) {
    this.idleTime = ms;
    this.resetTimer();
  }

  public getIdleDuration(): number {
    return this.idleTime;
  }

  private init() {
    const events = ["mousemove", "mousedown", "keyup", "touchstart", "scroll"];

    // Throttled event listener
    let throttleTimeout: number | undefined;
    const onActivity = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = undefined;
        this.activityDetected();
      }, 200) as unknown as number;
    };

    if (typeof window !== 'undefined') {
      events.forEach(evt => window.addEventListener(evt, onActivity, { passive: true }));
    }

    // Listen to visibility changes
    globalEventBus.on('blur', () => {
      this.forceIdle();
    });

    globalEventBus.on('focus', () => {
      // When we come back, we might be idle.
      // If we were idle, do we wake up automatically?
      // Usually simply focusing isn't enough to say "user is active" if they just alt-tabbed but didn't move mouse?
      // But typically focus IS activity.
      this.activityDetected();
    });

    this.resetTimer();
  }

  private activityDetected() {

    this.resetTimer();

    if (this.isIdle) {
      this.isIdle = false;
      globalEventBus.emit('wakeup');
    }
  }

  private resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.goIdle();
    }, this.idleTime) as unknown as number;
  }

  private goIdle() {
    if (!this.isIdle) {
      this.isIdle = true;
      globalEventBus.emit('idle');
    }
  }

  private forceIdle() {
    this.resetTimer(); // Reset timer so it doesn't double fire?
    // Actually, if we force idle, we should clear the timer and just go idle.
    if (this.timer) clearTimeout(this.timer);
    this.goIdle();
  }

  // Manual trigger support
  public manualIdle() {
    this.forceIdle();
  }

  public manualWakeup() {
    this.activityDetected();
  }
}

export const idlenessManager = new IdlenessManager();
