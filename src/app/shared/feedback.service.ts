import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private feedbacks = [
    { user: 'User1', message: 'Great app!' },
    { user: 'User2', message: 'Needs more features.' },
    // real data from back
  ];

  getFeedbacks() {
    return this.feedbacks;
  }

  addFeedback(user: string, message: string) {
    this.feedbacks.push({ user, message });
  }
}
