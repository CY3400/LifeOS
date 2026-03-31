import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Api } from "../../services/api";
import { finalize } from "rxjs";

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrls: ['./login.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class Login {
    protected allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    protected emailRegex = /^[a-zA-Z0-9@._+-]$/;
    protected hasLetter = /[A-Za-zÀ-ÖØ-öø-ÿ]/;
    protected email_Regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    private passwordVisibility = new Map<string, boolean>();

    isSubmitting = false;
    showPassword = false;

    constructor(private router: Router, private api: Api) {}

    user = {
        email: '',
        password: ''
    };

    errors = {
        email: '',
        password: '',
        global: ''
    };

    hasErrors(): boolean {
        return Object.values(this.errors).some(e => e !== '');
    }

    validateKey(event: KeyboardEvent, allowedKeys: string[], regex: RegExp): void {
        if(!allowedKeys.includes(event.key) && !regex.test(event.key)) {
            event.preventDefault();
        }
    }

    validatePaste(event: ClipboardEvent, regex: RegExp): void {
        event.preventDefault();
        const pasted = (event.clipboardData ?? (window as any).clipboardData)?.getData('text') ?? '';
        const sanitized = [...pasted].filter(c => regex.test(c)).join('');
        const input = event.target as HTMLInputElement;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;

        const newValue = input.value.slice(0, start) + sanitized + input.value.slice(end);
        input.value = newValue;

        const newCursor = start + sanitized.length;
        input.setSelectionRange(newCursor, newCursor);
    }

    togglePassword(): void {
        this.showPassword = this.toggleAndGetVisibility('login-password');
    }

    toggleAndGetVisibility(key: string): boolean {
        this.togglePasswordVisibility(key);
        return this.isPasswordVisible(key);
    }

    togglePasswordVisibility(key: string): void {
        const current = this.passwordVisibility.get(key) ?? false;
        this.passwordVisibility.set(key, !current);
    }

    isPasswordVisible(key: string): boolean {
        return this.passwordVisibility.get(key) ?? false;
    }

    redirection(location: string): void{
        this.router.navigate([location]);
    }

    validEmail(name: string, regex: RegExp, letter: RegExp): boolean {
        return regex.test(name.trim()) && letter.test(name.trim());
    }

    onSubmit(): void {
        const {email, password} = this.user;
        let isValid = true;

        this.errors.global = '';
        this.errors.email = '';
        this.errors.password = '';

        if(!this.validEmail(email, this.email_Regex, this.hasLetter)) {
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