export interface Release {
  name: string;
  tag_name: string;
  published_at: string;
  author?: string;
  body: string;
  html_url: string;
}

export interface ChangelogResponse {
  frontend: Release[];
  backend: Release[];
}
