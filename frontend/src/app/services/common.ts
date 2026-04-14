import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Common {
    readonly allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];

    readonly emailRegex = /^[a-zA-Z0-9@._+-]$/;
    readonly hasLetter = /[A-Za-zÀ-ÖØ-öø-ÿ]/;
    readonly email_Regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    validateKey(event: KeyboardEvent, regex: RegExp): void {
        if(!this.allowedKeys.includes(event.key) && !regex.test(event.key)) {
            event.preventDefault();
        }
    }

    validatePaste(event: ClipboardEvent, regex: RegExp): void {
        event.preventDefault();
        const pasted = (event.clipboardData ?? (window as any).clipboardData)?.getData('text') ?? '';
        const sanitized = [...pasted].filter(char => regex.test(char)).join('');
        const input = event.target as HTMLInputElement;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;

        const newValue = input.value.slice(0, start) + sanitized + input.value.slice(end);
        input.value = newValue;

        const newCursor = start + sanitized.length;
        input.setSelectionRange(newCursor, newCursor);
    }

    validEmail(value: string): boolean {
        const trimmed = value.trim();
        return this.email_Regex.test(trimmed) && this.hasLetter.test(trimmed);
    }
}