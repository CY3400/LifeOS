import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Api, RegisterRequest } from "../../services/api";
import { Router } from "@angular/router";
import { finalize, firstValueFrom } from "rxjs";
import { Common } from "../../services/common";
import { AuthErrors, emptyAuthErrors } from "../../types/auth-errors";

@Component({
    selector: 'app-register',
    templateUrl: './register.html',
    styleUrls: ['./register.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class Register {
    protected passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+=?.,:;{}\[\]<>\-]).{10,20}$/;

    isSubmitting = false;
    showPassword = false;

    user: RegisterRequest = {
        email: '',
        password: ''
    };

    errors:AuthErrors = emptyAuthErrors();

    constructor(private api: Api, private router: Router, protected common: Common){}

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

    async isEmailUnique(email: string): Promise<boolean> {
        try {
            return await firstValueFrom(this.api.verify(email));
        }
        catch {
            console.error("Une erreur s'est produite lors de la vérification du mail");
            return false;
        }
    }

    async onSubmit(): Promise<void> {
        const {email, password} = this.user;
        let isValid = true;

        this.resetErrors();

        if(!this.common.validEmail(email)) {
            this.errors.email = email ? "Format d'email invalide" : "L'email ne peut pas être vide";
            isValid = false;
        }
        else {
            const unique = await this.isEmailUnique(email);
            if(!unique) {
                this.errors.email = "Cet email est déjà utilisé";
                isValid = false;
            }
        }

        if(!password.trim()) {
            this.errors.password = "Le mot de passe ne peut pas être vide";
            isValid = false;
        }
        else if(!this.passwordRegex.test(password.trim())) {
            this.errors.password = "Le mot de passe doit avoir entre 10 et 20 caractères, avec majuscule, minuscule, chiffre et un caractère spécial";
            isValid = false;
        }

        if(!isValid) return;

        this.isSubmitting = true;

        this.api.register(this.user).pipe(finalize(() => {this.isSubmitting = false;})).subscribe({
            next: () => {
                this.redirection('/accueil');
            },
            error: (err) => {
                console.error(err);
                this.errors.global = "Une erreur s'est produite lors de l'enregistrement.";
            }
        })
    }
}