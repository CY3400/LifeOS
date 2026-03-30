import { Component, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss','../styles.scss'],
  standalone: true
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly showHeader = signal(true);

  constructor(private router: Router, private titleService: Title) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentRoute = this.router.routerState.root;
      let route = currentRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      const title = route.snapshot.data['title'];
      if(title){
        this.titleService.setTitle(title);
      }

      const isPublic = !!route.snapshot.data['public'];
      this.showHeader.set(!isPublic);
    });
  }
}
