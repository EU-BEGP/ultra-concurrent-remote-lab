import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './core/auth/pages/not-found/not-found.component';
import { HomeComponent } from './laboratory/pages/home/home.component';
import { AuthGuard } from './core/auth/services/guards/auth.guard';
import { LabComponent } from './laboratory/pages/lab/lab.component';
import { CreateLaboratoryComponent } from './laboratory/pages/create-laboratory/create-laboratory.component';
import { LoadedSessionComponent } from './laboratory/pages/loaded-session/loaded-session.component';

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
    path: 'create-lab',
    component: CreateLaboratoryComponent,
  },
  {path: 'laboratory/:id', component: LabComponent},
  {path: 'session/:id', component: LoadedSessionComponent},
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
