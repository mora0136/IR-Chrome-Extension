import { Injectable } from '@angular/core';
import {Tab} from "./tab";
import {HttpClient, HttpHeaders, HttpParamsOptions} from '@angular/common/http';
import {Observable} from "rxjs";
import {TabDetails} from "./tabDetails";

@Injectable({
  providedIn: 'root'
})
export class TabService {
  private baseUrl = 'http://localhost:8088/api/'
  private httpOptions = {
    headers:{
      'Content-Type': 'application/json'
    }}
  constructor(private http: HttpClient) { }

  getTabs():Observable<Tab[]>{
    return this.http.get<Tab[]>(this.baseUrl+"tabs")
  }

  updateTabCoordinate(tabId: number, coords: {x: number, y: number}) {
    return this.http.put<any>(this.baseUrl+"tab/"+tabId, JSON.stringify(coords), this.httpOptions)
  }

  getTabsGroupByURL() {
    return this.http.get<{}>(this.baseUrl+"tabs/byurl")

  }

  getTabsGroupByTitle() {
    return this.http.get<{}>(this.baseUrl+"tabs/bytitle")

  }

  getTabsGroupByTopic() {
    return this.http.get<{}>(this.baseUrl+"tabs/bytopic")

  }

  searchtab(search: string) {
    return this.http.get<Tab[]>(this.baseUrl+"tabs/tfidf/search", {params:{search: search}})
  }

  getTabDetail(id: string) {
    return this.http.get<TabDetails>(this.baseUrl+"tab-detail/"+id)
  }

  getTab(id: string) {
    return this.http.get<Tab>(this.baseUrl+"tab/"+id)
  }
}
