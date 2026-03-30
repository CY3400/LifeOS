import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.html',
    styleUrls: ['./welcome.scss'],
    standalone: true
})
export class Welcome {
    constructor(private router: Router) {}

    redirection(location: string): void{
        this.router.navigate([location]);
    }
}