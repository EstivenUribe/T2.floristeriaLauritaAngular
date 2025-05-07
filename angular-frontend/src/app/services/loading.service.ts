import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Tracks the total number of ongoing HTTP requests
  private requestCount = 0;
  
  // BehaviorSubject to track loading state
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  // Public observable that components can subscribe to
  public isLoading$ = this.isLoadingSubject.asObservable();
  
  constructor() {}
  
  /**
   * Starts tracking a request (increment counter)
   */
  startLoading(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.isLoadingSubject.next(true);
    }
  }
  
  /**
   * Ends tracking a request (decrement counter)
   */
  stopLoading(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) {
      this.isLoadingSubject.next(false);
    }
  }
  
  /**
   * Resets the loading state (forces loading to stop)
   */
  resetLoading(): void {
    this.requestCount = 0;
    this.isLoadingSubject.next(false);
  }
}