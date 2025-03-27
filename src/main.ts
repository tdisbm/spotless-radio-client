import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';  // Importă componenta standalone
import { provideRouter } from '@angular/router';      // Asigură-te că importi provideRouter
import { routes } from './app/app.routes';             // Importă rutele

bootstrapApplication(AppComponent, { providers: [provideRouter(routes)] }).catch(err => console.error(err));
