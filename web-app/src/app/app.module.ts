import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { TabComponent } from './tab/tab.component';
import { TabDetailComponent } from './tab-detail/tab-detail.component';
import { AppRoutingModule } from './app-routing.module';
import { UrlViewComponent } from './url-view/url-view.component';
import { TitleViewComponent } from './title-view/title-view.component';
import { TopicViewComponent } from './topic-view/topic-view.component';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSliderModule} from "@angular/material/slider";
import { TabSearchComponent } from './tab-search/tab-search.component';
import { TitleTopicViewComponent } from './title-topic-view/title-topic-view.component';

@NgModule({
  declarations: [
    AppComponent,
    TabComponent,
    TabDetailComponent,
    UrlViewComponent,
    TitleViewComponent,
    TopicViewComponent,
    TabSearchComponent,
    TitleTopicViewComponent
  ],
    imports: [
      BrowserAnimationsModule,
        BrowserModule,
        DragDropModule,
        HttpClientModule,
        AppRoutingModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatMenuModule,
        MatToolbarModule,
        MatSliderModule,
        FormsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
