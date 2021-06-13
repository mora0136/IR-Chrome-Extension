import { Component, OnInit } from '@angular/core';
import {TabService} from "../tab.service";
import {TabComponent} from "../tab/tab.component";
import {Tab} from "../tab";
import {ActivatedRoute} from "@angular/router";
import {TabDetails} from "../tabDetails";

@Component({
  selector: 'app-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrls: ['./tab-detail.component.css']
})
export class TabDetailComponent implements OnInit {
  tab: Tab = TabComponent.prototype.getSelectedTab()
  tabDetails: TabDetails =  {
    person: {
      start: "waiting...",
      end: "waiting...",
      type: "waiting...",
      text: "waiting..."
    },
    date: {
      start: "waiting...",
      end: "waiting...",
      type: "waiting...",
      text: "waiting..."
    },
    difference: 0,
    nearestPage: [{
      id: 0,
      url: "waiting",
      parentId: [0],
      pageRank: 0
    }]
  }
  constructor(private tabService: TabService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.tabService.getTab(params['id']).subscribe((result)=>{
        console.log(result)
        this.tab = result
      })

      this.tabService.getTabDetail(params['id']).subscribe((result)=>{
        console.log(result)
        this.tabDetails = result
      })
    });

  }


  ondbClick(tab: Tab | undefined){
    // chrome.runtime.sendMessage()
    document.dispatchEvent(new CustomEvent('openTab', {detail: tab}))
  }
}
