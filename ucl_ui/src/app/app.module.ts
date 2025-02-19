import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './core/modules/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { NavbarComponent } from './core/layout/components/navbar/navbar.component';
import { FooterComponent } from './core/layout/components/footer/footer.component';
import { LoginComponent } from './core/auth/components/login/login.component';
import { RegistrationComponent } from './core/auth/components/registration/registration.component';
import { SpinnerComponent } from './core/layout/components/spinner/spinner.component';
import { ScrollToTopComponent } from './core/layout/components/scroll-to-top/scroll-to-top.component';

import { NotFoundComponent } from './core/auth/pages/not-found/not-found.component';

import { AuthInterceptorService } from './core/auth/services/auth-interceptor.service';

import { HomeComponent } from './laboratory/pages/home/home.component';

import { ProfileFormComponent } from './core/auth/components/profile-form/profile-form.component';
import { CountdownModule } from 'ngx-countdown';
import { LabComponent } from './laboratory/pages/lab/lab.component';
import { CreateLaboratoryComponent } from './laboratory/pages/create-laboratory/create-laboratory.component';

import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';

import { YouTubePlayerModule } from '@angular/youtube-player';

import { LaboratoriesDialogComponent } from './laboratory/components/laboratories-dialog/laboratories-dialog.component';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { VideoPlayerComponent } from './laboratory/components/video-player/video-player.component';

import { HotTableModule } from '@handsontable/angular';
import { DynamicTableComponent } from './laboratory/components/dynamic-table/dynamic-table.component';
import { ProcedureToolsDialogComponent } from './laboratory/components/procedure-tools-dialog/procedure-tools-dialog.component';

import {ClipboardModule} from '@angular/cdk/clipboard';
import { SessionsListDialogComponent } from './laboratory/components/sessions-list-dialog/sessions-list-dialog.component';
import { LoadedSessionComponent } from './laboratory/pages/loaded-session/loaded-session.component';
import { TimelineChartComponent } from './laboratory/components/timeline-chart/timeline-chart.component';

import { PlotlyModule } from 'angular-plotly.js'; // Importa el módulo de Plotly
import * as PlotlyJS from 'plotly.js-dist-min';
import { CodeActivationDialogComponent } from './core/auth/components/code-activation-dialog/code-activation-dialog.component';
import { UploadOptionsDialogComponent } from './laboratory/components/upload-options-dialog/upload-options-dialog.component';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    RegistrationComponent,
    SpinnerComponent,
    ScrollToTopComponent,
    NotFoundComponent,
    HomeComponent,
    ProfileFormComponent,
    LabComponent,
    CreateLaboratoryComponent,
    LaboratoriesDialogComponent,
    VideoPlayerComponent,
    DynamicTableComponent,
    ProcedureToolsDialogComponent,
    SessionsListDialogComponent,
    LoadedSessionComponent,
    TimelineChartComponent,
    CodeActivationDialogComponent,
    UploadOptionsDialogComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CountdownModule,
    ClipboardModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      closeButton: true,
      preventDuplicates: true,
      progressBar: true,
      positionClass: 'toast-bottom-center',
      toastClass: 'fit-content ngx-toastr'
    }),
    HttpClientModule,
    MatTooltipModule,
    NgHttpLoaderModule.forRoot(),
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    NgxMatFileInputModule,
    HotTableModule,
    PlotlyModule,
    YouTubePlayerModule
  ],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
