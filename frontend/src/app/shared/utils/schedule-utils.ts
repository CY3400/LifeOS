import { Priority } from "../../services/api";
import { formatTime } from "./date-utils";

export type ScheduleValidationMessageKey =
    'scheduleTaskRequired' |
    'scheduleDateRequired' |
    'scheduleStartDateRequired' |
    'scheduleEndDateRequired' |
    'scheduleDaysRequired' |
    'scheduleEndAfterStart';

export type ScheduleAction =
    'create' |
    'update' |
    'delete' |
    'complete' |
    'uncomplete';

export type ScheduleDateValidationErrors = {
    date: string;
    startDate: string;
    endDate: string;
    daysChosen: string;
}

export function formatScheduleTimeLabel(startTime: string | null, endTime: string | null): string {
    if (startTime && endTime) {
        return `(${formatTime(startTime)} - ${formatTime(endTime)})`;
    }

    if (startTime) {
        return `(${formatTime(startTime)})`;
    }

    return '';
}

export function getPriorityName(priority: Priority | null | undefined): string {
    if (priority === 'HIGH') return 'Haute';
    if (priority === 'MEDIUM') return 'Moyenne';
    if (priority === 'LOW') return 'Basse';

    return 'Sans priorité';
}

export function getPriorityClass(priority: Priority | null | undefined): string {
    if (priority === 'HIGH') return 'high';
    if (priority === 'MEDIUM') return 'medium';
    if (priority === 'LOW') return 'low';

    return 'none';
}

export function canToggleScheduleCompletionByDate(scheduleDate: string, todayDate: string, yesterdayDate: string): boolean {
    return scheduleDate === todayDate || scheduleDate === yesterdayDate;
}

export function canEditOrDeleteScheduleByDate(scheduleDate: string, todayDate: string, completed: boolean): boolean {
    return scheduleDate >= todayDate && !completed;
}

export function getScheduleTimeValidationError(startTime: string | null, endTime: string | null): string | null {
    if (endTime && !startTime) {
        return "L'heure de début est requise si une heure de fin est fournie";
    }

    if (startTime && endTime && endTime <= startTime) {
        return "L'heure de fin doit être après l'heure de début";
    }

    return null;
}

function getScheduleValidationMessage(key: ScheduleValidationMessageKey): string {
    const messages: Record<ScheduleValidationMessageKey, string> = {
        scheduleTaskRequired: 'La tâche est obligatoire',
        scheduleDateRequired: 'La date est obligatoire',
        scheduleStartDateRequired: 'La date de début est obligatoire pour une répétition',
        scheduleEndDateRequired: 'La date de fin est obligatoire pour une répétition',
        scheduleDaysRequired: 'Au moins un jour doit être choisi pour une répétition',
        scheduleEndAfterStart: 'La date de fin doit être après la date de début'
    };

    return messages[key];
}

export function getScheduleErrorMessage(action: ScheduleAction): string {
    const messages: Record<ScheduleAction, string> = {
        create: 'Erreur lors de l’ajout du planning',
        update: 'Erreur lors de la modification du planning',
        delete: 'Erreur lors de la suppression du planning',
        complete: 'Erreur lors de la complétion du planning',
        uncomplete: 'Erreur lors de l’annulation de la complétion du planning'
    };

    return messages[action];
}

export function getScheduleSuccessMessage(action: ScheduleAction): string {
    const messages: Record<ScheduleAction, string> = {
        create: 'Planning ajouté avec succès',
        update: 'Planning modifié avec succès',
        delete: 'Planning supprimé avec succès',
        complete: 'Planning complété avec succès',
        uncomplete: 'Planning marqué comme non complété'
    };

    return messages[action];
}

function isRepeatScheduleCreation(id: number | null, repeat: boolean): boolean {
    return id === null && repeat;
}

export function getScheduleDateValidationErrors(taskDate: string, id: number | null, repeat: boolean, startDate: string, endDate: string, daysChosen: number[]): ScheduleDateValidationErrors {
    const errors: ScheduleDateValidationErrors = {
        date: '',
        startDate: '',
        endDate: '',
        daysChosen: ''
    };

    const isRepeatCreation = isRepeatScheduleCreation(id, repeat);

    if (!taskDate && !isRepeatCreation) {
        errors.date = getScheduleValidationMessage('scheduleDateRequired');
    }

    if (isRepeatCreation && !startDate) {
        errors.startDate = getScheduleValidationMessage('scheduleStartDateRequired');
    }

    if (isRepeatCreation && !endDate) {
        errors.endDate = getScheduleValidationMessage('scheduleEndDateRequired');
    }

    if (isRepeatCreation && !daysChosen.length) {
        errors.daysChosen = getScheduleValidationMessage('scheduleDaysRequired');
    }

    if (isRepeatCreation && startDate && endDate && endDate < startDate) {
        errors.endDate = getScheduleValidationMessage('scheduleEndAfterStart');
    }

    return errors;
}

export function getScheduleTaskValidationError(taskId: number | null, id: number | null): string {
    if (!taskId && id === null) {
        return getScheduleValidationMessage('scheduleTaskRequired');
    }

    return '';
}