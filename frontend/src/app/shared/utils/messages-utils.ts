export type EntityType = 'category' | 'goal' | 'task';
export type EntityAction = 'create' | 'update' | 'delete' | 'archive';
export type Warning = 'category' | 'task' | 'goal';

export function getSuccessMessage(type: EntityType, action: EntityAction): string {
    const messages = {
        category: {
            create: 'Catégorie ajoutée avec succès',
            update: 'Catégorie modifiée avec succès',
            delete: 'Catégorie supprimée avec succès',
            archive: 'Catégorie archivée avec succès'
        },
        goal: {
            create: 'Objectif ajouté avec succès',
            update: 'Objectif modifié avec succès',
            delete: 'Objectif supprimé avec succès',
            archive: 'Objectif archivé avec succès'
        },
        task: {
            create: 'Tâche ajoutée avec succès',
            update: 'Tâche modifiée avec succès',
            delete: 'Tâche supprimée avec succès',
            archive: 'Tâche archivée avec succès'
        }
    };

    return messages[type][action];
}

export function getGenericErrorMessage(type: EntityType, action: EntityAction): string {
    const messages = {
        category: {
            create: `Erreur lors de l'ajout de la catégorie`,
            update: `Erreur lors de la modification de la catégorie`,
            delete: `Erreur lors de la suppression de la catégorie`,
            archive: `Erreur lors de l'archivage de la catégorie`
        },
        goal: {
            create: `Erreur lors de l'ajout de l'objectif`,
            update: `Erreur lors de la modification de l'objectif`,
            delete: `Erreur lors de la suppression de l'objectif`,
            archive: `Erreur lors de l'archivage de l'objectif`
        },
        task: {
            create: `Erreur lors de l'ajout de la tâche`,
            update: 'Erreur lors de la modification de la tâche',
            delete: 'Erreur lors de la suppression de la tâche',
            archive: `Erreur lors de l'archivage de la tâche`
        }
    };

    return messages[type][action];
}

export function getBusinessDeleteErrorMessage(type: Warning): string {
    const messages = {
        category: 'Impossible de supprimer cette catégorie car elle est liée à une tâche ou à un objectif.',
        goal: 'Impossible de supprimer cet objectif car il est lié à une ou plusieurs tâches.',
        task: 'Impossible de supprimer cette tâche car elle est liée à un ou plusieurs plannings.'
    };

    return messages[type];
}

export function getValidationMessage(key: 'categoryTitleRequired' | 'goalCategoryRequired' | 'goalTitleRequired' | 'taskTitleRequired'): string {
    const messages = {
        categoryTitleRequired: 'Le nom de la catégorie est obligatoire',
        goalTitleRequired: `Le nom de l'objectif est obligatoire`,
        goalCategoryRequired: 'La catégorie est obligatoire',
        taskTitleRequired: 'Le titre ne peut pas être vide'
    };

    return messages[key];
}

export function getWarningMessage(type: Warning, title: string): string {
    if (type === "category") {
        return `Voulez-vous vraiment supprimer la catégorie "${title}"?`;
    }
    else if (type === "task") {
        return `Voulez-vous vraiment supprimer la tâche "${title}"?`;
    }
    else {
        return `Voulez-vous vraiment supprimer l'objectif "${title}"?`;
    }
}