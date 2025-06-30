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

export interface ChangelogResponse {
  frontend: ReleaseListResponseDto;
  backend: ReleaseListResponseDto;
}
