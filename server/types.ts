export type EntityType = "style" | "artist" | "period" | "museum" | "note";

export interface ExtractionResult {
  styles: string[];
  artists: string[];
  periods: string[];
  museums: string[];
}

export interface GeneratedFiles {
  note: {
    filename: string;
    content: string;
  };
  entities: Array<{
    type: EntityType;
    filename: string;
    content: string;
  }>;
}
