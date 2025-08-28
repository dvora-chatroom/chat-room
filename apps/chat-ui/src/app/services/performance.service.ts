import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, takeWhile } from 'rxjs';

export interface PerformanceMetrics {
  memoryUsage: number;
  messageCount: number;
  userCount: number;
  connectionStatus: boolean;
  lastUpdate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metricsSubject = new BehaviorSubject<PerformanceMetrics>({
    memoryUsage: 0,
    messageCount: 0,
    userCount: 0,
    connectionStatus: false,
    lastUpdate: new Date()
  });

  private isMonitoring = false;

  public metrics$ = this.metricsSubject.asObservable();

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor performance every 5 seconds
    interval(5000)
      .pipe(takeWhile(() => this.isMonitoring))
      .subscribe(() => {
        this.updateMetrics();
      });
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  updateMessageCount(count: number): void {
    const current = this.metricsSubject.value;
    this.metricsSubject.next({
      ...current,
      messageCount: count,
      lastUpdate: new Date()
    });
  }

  updateUserCount(count: number): void {
    const current = this.metricsSubject.value;
    this.metricsSubject.next({
      ...current,
      userCount: count,
      lastUpdate: new Date()
    });
  }

  updateConnectionStatus(status: boolean): void {
    const current = this.metricsSubject.value;
    this.metricsSubject.next({
      ...current,
      connectionStatus: status,
      lastUpdate: new Date()
    });
  }

  private updateMetrics(): void {
    const current = this.metricsSubject.value;
    
    // Get memory usage if available
    let memoryUsage = 0;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100;
    }

    this.metricsSubject.next({
      ...current,
      memoryUsage,
      lastUpdate: new Date()
    });

    // Log performance warnings
    this.checkPerformanceWarnings();
  }

  private checkPerformanceWarnings(): void {
    const metrics = this.metricsSubject.value;
    
    if (metrics.memoryUsage > 80) {
      console.warn('High memory usage detected:', metrics.memoryUsage.toFixed(2) + '%');
    }
    
    if (metrics.messageCount > 1000) {
      console.warn('Large number of messages detected:', metrics.messageCount);
    }
  }

  getCurrentMetrics(): PerformanceMetrics {
    return this.metricsSubject.value;
  }

  // Performance optimization helpers
  debounce<T>(func: (...args: any[]) => T, wait: number): (...args: any[]) => void {
    let timeout: any;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  throttle<T>(func: (...args: any[]) => T, limit: number): (...args: any[]) => void {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}
