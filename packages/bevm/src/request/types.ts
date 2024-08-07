export interface Pagination<T> {
  page: number
  size: number
  totalCount: number
  list: T[]
}
