export interface Page<TItem> {
    items: TItem[];
    page: number;
    pageSize: number;
    total: number;
}
