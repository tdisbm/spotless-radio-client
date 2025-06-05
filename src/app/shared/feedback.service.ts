import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private feedbacks: { user: string; message: string; timestamp: Date }[] = [];
  private feedbacksSubject = new BehaviorSubject<
    { user: string; message: string; timestamp: Date }[]
  >(this.feedbacks);

  constructor() {
    const storedFeedbacks = localStorage.getItem('feedbacks');
    if (storedFeedbacks) {
      this.feedbacks = JSON.parse(storedFeedbacks).map((fb: any) => ({
        ...fb,
        timestamp: new Date(fb.timestamp),
      }));
      this.feedbacksSubject.next(this.feedbacks);
    }
  }

  getFeedbacks(): Observable<{ user: string; message: string; timestamp: Date }[]> {
    return this.feedbacksSubject.asObservable();
  }

  addFeedback(user: string, message: string): Observable<void> {
    return new Observable((observer) => {
      if (!user || !message) {
        observer.error(new Error('User și mesaj sunt obligatorii'));
        return;
      }

      const feedback = { user, message, timestamp: new Date() };
      this.feedbacks.push(feedback);
      this.feedbacksSubject.next(this.feedbacks);

      localStorage.setItem('feedbacks', JSON.stringify(this.feedbacks));

      observer.next();
      observer.complete();
    });
  }
}
