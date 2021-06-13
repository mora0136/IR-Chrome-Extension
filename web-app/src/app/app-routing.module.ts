import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {UrlViewComponent} from "./url-view/url-view.component";
import {TitleViewComponent} from "./title-view/title-view.component";
import {TopicViewComponent} from "./topic-view/topic-view.component";
import {TabComponent} from "./tab/tab.component";
import {TabSearchComponent} from "./tab-search/tab-search.component";
import {TabDetailComponent} from "./tab-detail/tab-detail.component";
import {TitleTopicViewComponent} from "./title-topic-view/title-topic-view.component";

const routes: Routes = [
  { path: 'home', component: TabComponent },
  { path: 'url', component: UrlViewComponent },
  { path: 'title', component: TitleViewComponent }, //Home component should be changed to the appropriate view
  { path: 'topic', component: TopicViewComponent },
  { path: 'titletopic', component: TitleTopicViewComponent },
  { path: 'search', component: TabSearchComponent },
  { path: 'tabDetail/:id', component: TabDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
