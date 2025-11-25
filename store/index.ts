import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    AdminUser,
    CustomerMaster,
    Brand,
    Category,
    Product,
    Invoice,
} from '@/types';

// ============================================
// Auth Store
// ============================================

interface AuthState {
    user: AdminUser | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: AdminUser, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

// ============================================
// Customer Store
// ============================================

interface CustomerState {
    customers: CustomerMaster[];
    selectedCustomer: CustomerMaster | null;
    setCustomers: (customers: CustomerMaster[]) => void;
    setSelectedCustomer: (customer: CustomerMaster | null) => void;
    addCustomer: (customer: CustomerMaster) => void;
    updateCustomer: (id: number, customer: Partial<CustomerMaster>) => void;
    removeCustomer: (id: number) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
    customers: [],
    selectedCustomer: null,
    setCustomers: (customers) => set({ customers }),
    setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
    addCustomer: (customer) =>
        set((state) => ({ customers: [...state.customers, customer] })),
    updateCustomer: (id, updatedCustomer) =>
        set((state) => ({
            customers: state.customers.map((c) =>
                c.id === id ? { ...c, ...updatedCustomer } : c
            ),
        })),
    removeCustomer: (id) =>
        set((state) => ({
            customers: state.customers.filter((c) => c.id !== id),
        })),
}));

// ============================================
// Brand Store
// ============================================

interface BrandState {
    brands: Brand[];
    selectedBrand: Brand | null;
    setBrands: (brands: Brand[]) => void;
    setSelectedBrand: (brand: Brand | null) => void;
    addBrand: (brand: Brand) => void;
    updateBrand: (id: number, brand: Partial<Brand>) => void;
    removeBrand: (id: number) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
    brands: [],
    selectedBrand: null,
    setBrands: (brands) => set({ brands }),
    setSelectedBrand: (brand) => set({ selectedBrand: brand }),
    addBrand: (brand) =>
        set((state) => ({ brands: [...state.brands, brand] })),
    updateBrand: (id, updatedBrand) =>
        set((state) => ({
            brands: state.brands.map((b) =>
                b.id === id ? { ...b, ...updatedBrand } : b
            ),
        })),
    removeBrand: (id) =>
        set((state) => ({
            brands: state.brands.filter((b) => b.id !== id),
        })),
}));

// ============================================
// Category Store
// ============================================

interface CategoryState {
    categories: Category[];
    selectedCategory: Category | null;
    setCategories: (categories: Category[]) => void;
    setSelectedCategory: (category: Category | null) => void;
    addCategory: (category: Category) => void;
    updateCategory: (id: number, category: Partial<Category>) => void;
    removeCategory: (id: number) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],
    selectedCategory: null,
    setCategories: (categories) => set({ categories }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
    updateCategory: (id, updatedCategory) =>
        set((state) => ({
            categories: state.categories.map((c) =>
                c.id === id ? { ...c, ...updatedCategory } : c
            ),
        })),
    removeCategory: (id) =>
        set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
        })),
}));

// ============================================
// Product Store
// ============================================

interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    setProducts: (products: Product[]) => void;
    setSelectedProduct: (product: Product | null) => void;
    addProduct: (product: Product) => void;
    updateProduct: (id: number, product: Partial<Product>) => void;
    removeProduct: (id: number) => void;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    selectedProduct: null,
    setProducts: (products) => set({ products }),
    setSelectedProduct: (product) => set({ selectedProduct: product }),
    addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),
    updateProduct: (id, updatedProduct) =>
        set((state) => ({
            products: state.products.map((p) =>
                p.id === id ? { ...p, ...updatedProduct } : p
            ),
        })),
    removeProduct: (id) =>
        set((state) => ({
            products: state.products.filter((p) => p.id !== id),
        })),
}));

// ============================================
// Invoice Store
// ============================================

interface InvoiceState {
    invoices: Invoice[];
    selectedInvoice: Invoice | null;
    setInvoices: (invoices: Invoice[]) => void;
    setSelectedInvoice: (invoice: Invoice | null) => void;
    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (id: number, invoice: Partial<Invoice>) => void;
    removeInvoice: (id: number) => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
    invoices: [],
    selectedInvoice: null,
    setInvoices: (invoices) => set({ invoices }),
    setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
    addInvoice: (invoice) =>
        set((state) => ({ invoices: [...state.invoices, invoice] })),
    updateInvoice: (id, updatedInvoice) =>
        set((state) => ({
            invoices: state.invoices.map((i) =>
                i.id === id ? { ...i, ...updatedInvoice } : i
            ),
        })),
    removeInvoice: (id) =>
        set((state) => ({
            invoices: state.invoices.filter((i) => i.id !== id),
        })),
}));

// ============================================
// UI Store
// ============================================

interface UIState {
    sidebarOpen: boolean;
    loading: boolean;
    setSidebarOpen: (open: boolean) => void;
    setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    loading: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setLoading: (loading) => set({ loading }),
}));
