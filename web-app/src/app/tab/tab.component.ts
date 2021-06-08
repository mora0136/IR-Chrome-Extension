import { Component, OnInit } from '@angular/core';
import {TabService} from "../tab.service";
import {Tab} from "../tab";
import {ElementDimensions} from "@angular/cdk/testing";
import {CdkDragEnd, CdkDragStart} from "@angular/cdk/drag-drop";
import {ActivatedRoute, Route, Router} from "@angular/router";

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements OnInit {
  tabs: Tab[] = []
  selectedTab: Tab = this.tabs[0]
  dragging: boolean = false

  constructor(private tabService: TabService,
              private route: Router) { }

  ngOnInit(): void {
    this.getAllTabs();
  }

  getAllTabs(): void{
    this.tabService.getTabs().subscribe( tabs => {
      this.tabs = tabs
    })
  }

  onDragEnd($event: CdkDragEnd): void {
    let tabFromEvent: Tab = $event.source.data
    let displacementCoords: {x: number, y: number} = $event.distance
    console.log($event.source.data) //this is the displacement from its origin point
    let newCoords = {
      x: tabFromEvent.x + displacementCoords.x,
      y: tabFromEvent.y + displacementCoords.y,
    }
    console.log(newCoords)
    tabFromEvent.x = newCoords.x
    tabFromEvent.y = newCoords.y

    console.log($event.distance) //this is the displacement from its last location.

    //calculate its new position with the event.distance


    // $event.distance.y = $event.distance.y + $event.source.element.nativeElement.offsetHeight;
    // $event.distance.x =;


    this.tabService.updateTabCoordinate(tabFromEvent.id, newCoords).subscribe()
  }

  onDragStart($event: CdkDragStart) {
    // this.tabService.update
    this.dragging = true
    console.log("DragStart")
    //grab the coordinates, save if the tab doesn't have them
    //ignore for now

  }

  onClick(tab: Tab){
    // chrome.runtime.sendMessage()
    if(this.dragging == true){
      console.log("falsing")
      this.dragging = false
      return
    }
    this.selectedTab = tab
    this.route.navigate(['/tabDetail/'+tab._id]);
  }

  ondbClick(tab: Tab){
    // chrome.runtime.sendMessage()
    document.dispatchEvent(new CustomEvent('openTab', {detail: tab}))
  }

  getSelectedTab() {
    return this.selectedTab
  }
}
