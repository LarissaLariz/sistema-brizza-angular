import { Routes } from '@angular/router';
import { Login } from './login/login';
import { App } from './app';
import { Home } from './home/home';
import { DetalhesHospedagem } from './detalhes-hospedagem/detalhes-hospedagem';
import { Cadastro } from './cadastro/cadastro';
import { MinhasReservas } from './minhas-reservas/minhas-reservas';
import { AdminLogin } from './admin-login/admin-login';
import { AdminHome } from './admin-home/admin-home';
import { AdminImoveis } from './admin-imoveis/admin-imoveis';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: 'detalhes/:id', component: DetalhesHospedagem },
  { path: 'cadastro', component: Cadastro },
  { path: 'minhas-reservas', component: MinhasReservas },
  { path: 'admin-login', component: AdminLogin },
{ path: 'admin', component: AdminHome },
{ path: 'admin/imoveis', component: AdminImoveis },
];