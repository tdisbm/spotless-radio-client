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

  constructor(private router: Router, private feedbackService: FeedbackService) {}

  ngOnInit() {
    this.feedbacks = this.feedbackService.getFeedbacks();
  }

  logout() {
    this.router.navigate(['/auth']);
  }
}
