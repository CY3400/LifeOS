import { Component, DestroyRef, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  isMenuOpen = false;
  @ViewChild('burgerBtn', { static: false }) burgerBtn?: ElementRef<HTMLButtonElement>;

  private destroyRef = inject(DestroyRef);

  constructor(private router: Router){
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.isMenuOpen = false);
  }

  toggleMenu(): void{
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(shouldReturnFocus: boolean): void{
    if(!this.isMenuOpen) return;
    this.isMenuOpen = false;
    if(shouldReturnFocus){
      setTimeout(() => this.burgerBtn?.nativeElement.focus(), 0);
    }
  }

  @HostListener('window:resize')
  onResize(){
    const DESKTOP_BP = 992;
    if(window.innerWidth >= DESKTOP_BP){
      this.closeMenu(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(){
    this.closeMenu(true);
  }
}