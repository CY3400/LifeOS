import { Routes } from '@angular/router';
import { Welcome } from './pages/welcome/welcome';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { MeResolver } from './resolvers/me-resolver';
import { Login } from './pages/login/login';

export const routes: Routes = [
    {path: '', component: Welcome, data: {public: true}},
    {path:'bienvenue', component: Welcome, data: {public: true}},
    {path:'s-enregistrer', component: Register, title: 'LifeOS - Inscription', data: {public: true}},
    {path:'se-connecter', component: Login, title: 'LifeOS - Connexion', data: {public: true}},
    {path:'accueil', component: Home, title: 'LifeOS - Accueil', resolve: {me: MeResolver}}
];
