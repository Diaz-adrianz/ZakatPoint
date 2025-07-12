export interface Village {
    id: number;
    province: string;
    city: string;
    district: string;
    village: string;
    postal_code: string;
    longitude: string | null;
    latitude: string | null;
    email_village: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserVillage {
    id: number;
    user_id: number;
    village_id: number;
    role: string;
    is_pending: number;
    created_at: string;
    updated_at: string;
    village?: Village;
  }