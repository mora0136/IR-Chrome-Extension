export interface TabDetails {
  person: {
    start: string,
    end: string,
    type: string,
    text: string
  }
  date: {
    start: string,
    end: string,
    type: string,
    text: string
  }
  difference: number,
  nearestPage: {
    id: number,
    url: string,
    parentId: number[],
    pageRank: number
  }[]
}
