export interface Book {
  id: string;
  title: string;
  author: string;
  edition: string;
  price: number;
  originalPrice?: number;
  distance: string;
  sellerName: string;
  sellerCourse: string;
  sellerPhone: string;
  coverUrl?: string; // snapped custom photos
  pageUrls?: string[]; // preview / sample page images
  coverColor?: string; // premium aesthetic gradient fallback if no photo snapped
  isTopperCopy: boolean;
  notesCount?: number;
  condition: string;
  dateListed: string;
  binding?: string;           // "Paperback" / "Hardcover"
  publicationYear?: number;   // e.g., 2021
  language?: string;          // e.g., "English"
  publisher?: string;         // e.g., "McGraw Hill"
  totalPages?: number;        // e.g., 450
}

export interface Bounty {
  id: string;
  seekingText: string;
  course: string;
  offeredReward: string;
}

export interface ScanResult {
  title: string;
  author: string;
  edition: string;
  isTopperCopy: boolean;
}
