import { Routes } from '@angular/router';
import { Welcome } from './pages/welcome/welcome';

export const routes: Routes = [
    {path: '', component: Welcome, data: {public: true}},
    {path:'bienvenue', component: Welcome, data: {public: true}}
];
