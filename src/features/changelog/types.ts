export interface Release {
  name: string;
  tagName: string;
  publishedAt: string;
  author?: string | null;
  body: string;
  htmlUrl: string;
}

export interface ReleaseListResponseDto {
  items: Release[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface ReleaseStats {
  releases: number;
  features: number;
  fixes: number;
}

export interface ChangelogResponse {
  frontend: ReleaseListResponseDto;
  backend: ReleaseListResponseDto;
  /** Totals over every release of both repos (absent on older backends). */
  stats?: ReleaseStats;
}
