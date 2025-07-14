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
    donaturs?: Donatur[]
}

export interface Donatur {
    id: number
    username: string
    nominal: number
    created_at: string
}

/**
 * Interface untuk model PaymentItem.
 */
export interface PaymentItem {
    id: number; 
    payment_id: number; 
    item_id: string;
    price: number;
    quantity: number;
    name: string;
    brand?: string | null; 
    category?: string | null;
    merchant_name?: string | null;
    url?: string | null;
    created_at?: string; 
    updated_at?: string; 
}
  
export interface Payment {
    id: number; 
    order_id: string;
    amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILURE';
    payment_type?: string | null;
    snap_token?: string | null;
    first_name: string;
    last_name?: string | null;
    email: string;
    phone: string;
    expired_at?: string | null;
    status_update_at?: string;
    created_at?: string; 
    updated_at?: string; 
    items?: PaymentItem[];
}
  
export interface IncomeZakat {
    id: number
    income_month:number
    income_plus: number
    amount: number
    email: string
    name: string
    no_hp: string
    gender: string
    village_id: string
    payment_id: string
    village?: Village
    payment?: Payment
}

export interface GoldZakat {
    id: number
    weight:number
    amount: number
    email: string
    name: string
    no_hp: string
    gender: string
    village_id: string
    payment_id: string
    village?: Village
    payment?: Payment
}

export interface SilverZakat {
    id: number
    weight:number
    amount: number
    email: string
    name: string
    no_hp: string
    gender: string
    village_id: number
    payment_id: number
    village?: Village
    payment?: Payment
}

export interface FitrahZakatPeriode {
    id: number
    start_date: string
    end_date: string
    title: string
    rice_price: number
    code: string
    village_id: number
    village?: Village
    created_at?: string
    updated_at?: string
    zakats_sum_amount?: number;
}

export interface FitrahZakat {
    dependents: number
    amount: number
    email: string
    name: string
    no_hp: string
    gender: string
    fitrah_session_id: number
    payment_id: number
    payment?: Payment
    created_at?: string
    updated_at?: string
}