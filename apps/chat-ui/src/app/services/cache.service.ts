import { Injectable } from '@angular/core';
import { ChatMessage, User } from '@chat-room/shared';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly MESSAGES_CACHE_KEY = 'chat_messages';
  private readonly USERS_CACHE_KEY = 'chat_users';
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {}

  // Cache messages for offline viewing
  cacheMessages(messages: ChatMessage[]): void {
    try {
      const cacheData = {
        data: messages,
        timestamp: Date.now()
      };
      localStorage.setItem(this.MESSAGES_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache messages:', error);
    }
  }

  // Get cached messages
  getCachedMessages(): ChatMessage[] {
    try {
      const cached = localStorage.getItem(this.MESSAGES_CACHE_KEY);
      if (!cached) return [];

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_EXPIRY;

      if (isExpired) {
        this.clearMessagesCache();
        return [];
      }

      return cacheData.data || [];
    } catch (error) {
      console.warn('Failed to get cached messages:', error);
      return [];
    }
  }

  // Cache users
  cacheUsers(users: User[]): void {
    try {
      const cacheData = {
        data: users,
        timestamp: Date.now()
      };
      localStorage.setItem(this.USERS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache users:', error);
    }
  }

  // Get cached users
  getCachedUsers(): User[] {
    try {
      const cached = localStorage.getItem(this.USERS_CACHE_KEY);
      if (!cached) return [];

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_EXPIRY;

      if (isExpired) {
        this.clearUsersCache();
        return [];
      }

      return cacheData.data || [];
    } catch (error) {
      console.warn('Failed to get cached users:', error);
      return [];
    }
  }

  // Clear message cache
  clearMessagesCache(): void {
    try {
      localStorage.removeItem(this.MESSAGES_CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear messages cache:', error);
    }
  }

  // Clear users cache
  clearUsersCache(): void {
    try {
      localStorage.removeItem(this.USERS_CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear users cache:', error);
    }
  }

  // Clear all cache
  clearAllCache(): void {
    this.clearMessagesCache();
    this.clearUsersCache();
  }

  // Check if cache is available
  isCacheAvailable(): boolean {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch {
      return false;
    }
  }

  // Get cache size (for monitoring)
  getCacheSize(): number {
    try {
      let size = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length;
        }
      }
      return size;
    } catch {
      return 0;
    }
  }

  // Preload critical assets
  preloadAssets(): void {
    // Preload critical CSS and JS files
    const criticalAssets = [
      '/assets/styles.css',
      '/assets/vendor.js'
    ];

    criticalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = asset.endsWith('.css') ? 'style' : 'script';
      link.href = asset;
      document.head.appendChild(link);
    });
  }
}
