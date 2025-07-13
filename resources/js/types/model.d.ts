export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

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
    user?: User;
}

export interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    village_id: number;
    village?: Village;
    created_at?: string;
}

export interface Donation {
    id: number;
    title: string;
    slug: string;
    target: number | null;
    description: string;
    village_id: number;
    village?: Village;
    created_at?: string;
    donaturs_sum_nominal?: number;
}
