import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './pages/header/header';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateAdapter, provideCalendar } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.scss','../styles.scss'],
  standalone: true,
  providers: [
    provideCalendar({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
})
export class App {
  protected readonly showHeader = signal(false);

  private destroyRef = inject(DestroyRef);
  
  constructor(private router: Router, private titleService: Title) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      let route = this.router.routerState.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      const title = route.snapshot.title;
      if(title){
        this.titleService.setTitle(title);
      }

      const isPublic = !!route.snapshot.data['public'];
      this.showHeader.set(!isPublic);
    });
  }
}
