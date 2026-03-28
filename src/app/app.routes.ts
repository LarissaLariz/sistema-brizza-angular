import { Routes } from '@angular/router';
import { Login } from './login/login';
import { App } from './app';
import { Home } from './home/home';
import { DetalhesHospedagem } from './detalhes-hospedagem/detalhes-hospedagem';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: 'detalhes/:id', component: DetalhesHospedagem },
];
