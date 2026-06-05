import { Routes } from '@angular/router';
import { Welcome } from './pages/welcome/welcome';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { MeResolver } from './resolvers/me-resolver';
import { Login } from './pages/login/login';
import { AuthGuard } from './guards/auth-guard';
import { GuestGuard } from './guards/guest-guard';
import { Today } from './pages/today/today';
import { Objectives } from './pages/objectives/objectives';

export const routes: Routes = [
    {
        path: '',
        component: Welcome,
        title: 'LifeOS - Bienvenue',
        data: { public: true }
    },
    {
        path:'bienvenue',
        component: Welcome,
        title: 'LifeOS - Bienvenue',
        data: { public: true }
    },
    {
        path:'s-enregistrer',
        component: Register,
        title: 'LifeOS - Inscription',
        canActivate: [GuestGuard],
        data: { public: true }
    },
    {
        path:'se-connecter',
        component: Login,
        title: 'LifeOS - Connexion',
        canActivate: [GuestGuard],
        data: { public: true }
    },
    {
        path:'accueil',
        component: Home,
        title: 'LifeOS - Accueil',
        canActivate: [AuthGuard],
        resolve: { me: MeResolver }
    },
    {
        path:'today',
        component: Today,
        title: `LifeOS - Aujourd'hui`,
        canActivate: [AuthGuard],
        resolve: { me: MeResolver }
    },
    {
        path:'objectifs',
        component: Objectives,
        title: 'LifeOS - Objectifs',
        canActivate: [AuthGuard],
        resolve: { me: MeResolver }
    },
    {
        path: '**',
        redirectTo: ''
    },
];
