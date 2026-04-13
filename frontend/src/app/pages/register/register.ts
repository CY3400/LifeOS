import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Api, RegisterRequest } from "../../services/api";
import { Router } from "@angular/router";
import { finalize, firstValueFrom } from "rxjs";

@Component({
    selector: 'app-register',
    templateUrl: './register.html',
    styleUrls: ['./register.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class Register {
    protected allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    protected hasLetter = /[A-Za-zÀ-ÖØ-öø-ÿ]/;
    protected email_Regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    protected emailRegex = /^[a-zA-Z0-9@._+-]$/;
    protected passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+=?.,:;{}\[\]<>\-]).{10,20}$/;

    private passwordVisibility = new Map<string, boolean>();

    isSubmitting = false;

    user: RegisterRequest = {
        email: '',
        password: ''
    };

    errors = {
        email: '',
        password: '',
        global: ''
    };

    showPassword = false;

    constructor(private api: Api, private router: Router){}

    hasErrors(): boolean {
        return Object.values(this.errors).some(e => e !== '');
    }

    togglePasswordVisibility(key: string): void {
        const current = this.passwordVisibility.get(key) ?? false;
        this.passwordVisibility.set(key, !current);
    }

    isPasswordVisible(key: string): boolean {
        return this.passwordVisibility.get(key) ?? false;
    }

    toggleAndGetVisibility(key: string): boolean {
        this.togglePasswordVisibility(key);
        return this.isPasswordVisible(key);
    }

    togglePassword(): void {
        this.showPassword = this.toggleAndGetVisibility('register-password');
    }

    redirection(location: string): void{
        this.router.navigate([location]);
    }

    validEmail(name: string, regex: RegExp, letter: RegExp): boolean {
        return regex.test(name.trim()) && letter.test(name.trim());
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

        this.errors.global = '';
        this.errors.email = '';
        this.errors.password = '';

        if(!this.validEmail(email, this.email_Regex, this.hasLetter)) {
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