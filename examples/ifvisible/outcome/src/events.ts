type Callback = () => void;

export class EventBus {
  private listeners: Record<string, Callback[]> = {};

  on(event: string, callback: Callback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback?: Callback): void {
    if (!this.listeners[event]) return;
    if (!callback) {
      delete this.listeners[event];
    } else {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb());
  }
}

export const globalEventBus = new EventBus();
