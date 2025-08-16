// types/hotel.ts
export interface Hotel {
  id: string;
  _id?: string;
  name: string;
  address?: string;
  rating?: number;
  price?: number;
  freeCancellation?: boolean;
  amenities?: Record<string, unknown>;
  imageUrl?: string;
  imageDetails?: { 
    prefix?: string; 
    suffix?: string; 
    count?: number;
  };
  hiresImageIndex?: string | number;
  [k: string]: unknown;
}

export interface HotelSearchResponse {
  page?: number;
  pageSize?: number;
  totalPages?: number;
  totalHotels?: number;
  hotels?: Hotel[];
  paginatedHotels?: Hotel[];
  message?: string;
}
