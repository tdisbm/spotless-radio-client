import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../shared/feedback.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class FeedbackComponent implements OnInit {
  feedbacks: any[] = [];
  errorMessage: string | null = null;

  constructor(private router: Router, private feedbackService: FeedbackService) {}

  ngOnInit() {
    this.loadFeedbacks();
  }

  loadFeedbacks() {
    this.feedbackService.getFeedbacks().subscribe({
      next: (data) => {
        this.feedbacks = data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load feedbacks: ' + (err.error?.message || err.message);
        console.error('Failed to load feedbacks', err);
      },
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }
}
