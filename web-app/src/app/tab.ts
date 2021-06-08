export interface Tab {
  _id: string;
  active: boolean,
  audible: boolean,
  autoDiscardable: boolean,
  discarded: boolean,
  favIconUrl: string,
  groupId: number,
  height: number,
  highlighted: boolean,
  hostname: string,
  id: number,
  incognito: boolean,
  index: number,
  mutedInfo: { muted: boolean },
  pinned: boolean,
  selected: boolean,
  status: string,
  title: string,
  url: string,
  width: number,
  windowId: number
  name?: string
  screenshot?: string,
  x: number,
  y: number
}
