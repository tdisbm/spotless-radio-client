import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../shared/feedback.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [FormsModule], // add FormsModule for ngModel
})
export class LandingComponent {
  feedbackMessage: string = '';

  constructor(private router: Router, private feedbackService: FeedbackService) {}

  logout() {
    this.router.navigate(['/auth']);
  }

  play() {
    console.log('Play button clicked');
  }

  sendFeedback() {
    if (this.feedbackMessage.trim()) {
      // the user is now "Guest" (connect to the auth system)
      this.feedbackService.addFeedback('Guest', this.feedbackMessage);
      this.feedbackMessage = ''; // reset area
      console.log('Feedback sent!');
    }
  }
}
