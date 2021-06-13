import { Component, OnInit } from '@angular/core';
import {Tab} from "../tab";
import {TabService} from "../tab.service";
import {CdkDragEnd, CdkDragStart} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-title-view',
  templateUrl: './title-view.component.html',
  styleUrls: ['./title-view.component.css']
})
export class TitleViewComponent implements OnInit {
  tabs: Tab[] = []
  groups: any = {}
  groupKeys: any = []

  constructor(private tabService: TabService) { }

  ngOnInit(): void {
    this.getAllTabs();
  }

  getAllTabs(): void{
    this.tabService.getTabsGroupByTitle().subscribe( groups => {
      console.log(groups)
      this.groupKeys = Object.keys(groups)
      this.groups = groups
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
    console.log("DragStart")
    //grab the coordinates, save if the tab doesn't have them
    //ignore for now

  }
  onClick(tab: Tab){
    // chrome.runtime.sendMessage()
    document.dispatchEvent(new CustomEvent('openTab', {detail: tab}))
  }
}
