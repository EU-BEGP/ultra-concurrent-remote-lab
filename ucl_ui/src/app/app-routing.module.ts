import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessComponent } from './core/auth/pages/access/access.component';
import { NotFoundComponent } from './core/auth/pages/not-found/not-found.component';
import { HomeComponent } from './laboratory/pages/home/home.component';
import { AuthGuard } from './core/auth/services/guards/auth.guard';
import { ProfileComponent } from './core/auth/pages/profile/profile.component';
import { ActivationComponent } from './core/auth/pages/activation/activation.component';
import { LabComponent } from './laboratory/pages/lab/lab.component';
import { CreateLaboratoryComponent } from './laboratory/pages/create-laboratory/create-laboratory.component';

const routes: Routes = [
  { path: 'ultra-concurrent-rl',
    redirectTo: 'ultra-concurrent-rl/', pathMatch: 'full'
  },
  { path: 'ultra-concurrent-rl/:id',
    component: HomeComponent 
  },
  { path: '',
    redirectTo: 'ultra-concurrent-rl/',
    pathMatch: 'full' 
  },
  {
    path: 'access',
    component: AccessComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'activate',
    component: ActivationComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'create-lab',
    component: CreateLaboratoryComponent,
  },
  {path: 'laboratory/:id', component: LabComponent},
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
