import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Api, LoginRequest } from "../../services/api";
import { finalize } from "rxjs";
import { Common } from "../../services/common";
import { AuthErrors, emptyAuthErrors } from "../../types/auth-errors";

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrls: ['./login.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class Login {
    isSubmitting = false;
    showPassword = false;

    user: LoginRequest = {
        email: '',
        password: ''
    };

    errors: AuthErrors = emptyAuthErrors();

    constructor(private router: Router, private api: Api, protected common: Common) {}

    hasErrors(): boolean {
        return Object.values(this.errors).some(e => e !== '');
    }

    private resetErrors() {
        this.errors = emptyAuthErrors();
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    redirection(location: string): void{
        this.router.navigate([location]);
    }

    onSubmit(): void {
        const {email, password} = this.user;
        let isValid = true;

        this.resetErrors();

        if(!this.common.validEmail(email)) {
            this.errors.email = email ? "Format d'email invalide" : "L'email ne peut pas être vide";
            isValid = false;
        }

        if(!password.trim()) {
            this.errors.password = "Le mot de passe ne peut pas être vide";
            isValid = false;
        }

        if(!isValid) return;

        this.isSubmitting = true;

        this.api.login(this.user).pipe(finalize(() => {this.isSubmitting = false;})).subscribe({
            next: () => {
                this.redirection('/accueil');
            },
            error: (err) => {
                if(err.status === 401) {
                    this.errors.global = "Identifiants invalides";
                }
                else {
                    console.error("Erreur lors de la connexion", err);
                    this.errors.global = "Une erreur s'est produite lors de la connexion. Veuillez réessayer.";
                }
            }
        });
    }
}