import type React from "react";

export interface UserType {
  id: string;
  email: string;
  name: string;
  surname: string;
  phoneNumber: string;
  password: string;
  googleId: string;
  picture: string;
}

export interface UserLoginType {
  phoneNumber: string;
  password: string;
}

export interface ProductImageType {
  image: string;
  color: string;
  publicId: string;
}

export interface ProductImageDto {
  id: string;
  image: string;
  color?: string;
  publicId?: string;
}

export interface ProductPropertyInput {
  propertyId: number;
  value: string;
}

export interface ProductPropertyResponseDto {
  id: number;
  propertyName: string;
  propertyType?: string | null;
  value: string;
}

export interface ProductListResponseDto {
  id: number;
  name: string;
  price: number;
  hasDiscount: boolean;
  discount: number;
  productCount: number;
  viewCount: number;
  hasDelivery: boolean;
  imageUrl?: ProductImageDto | null;
}

export interface ProductDetailResponseDto {
  id: number;
  name: string;
  price: number;
  hasDiscount: boolean;
  discount: number;
  productCount: number;
  viewCount: number;
  hasDelivery: boolean;
  barkod: string;
  categoryId: number;
  images: ProductImageDto[];
  properties: ProductPropertyResponseDto[];
}

export interface ProductTypePayload {
  name: string;
  price: number;
  hasDiscount: boolean;
  discount: number;
  productCount: number;
  viewCount: number;
  hasDelivery: boolean;
  barkod: string;
  categoryId: number | string;
  images: ProductImageDto[];
  properties: ProductPropertyInput[];
}

export interface CategoryType {
  id: string | number | null;
  name: string;
  description?: string;
  parentId?: number | string | null;
  subCategories?: CategoryType[];
  children?: CategoryType[];
}


export interface CategoryTypeResponse {
  id: string;
  name: string;
  parentId: string | null;
}

export interface PropertyType {
  name: string;
  type: string;
}

export interface PropertyTypeResponse {
  id: string;
  name: string;
  type: string;
}

export interface OrderType {
  isDelivery: boolean;
  location: string;
  status: string;
  productCount: number;
  product: string;
  user: string;
}

export const OrderStatus = {
  CREATED: "CREATED",
  CANCELED: "CANCELED",
  ACCEPTED: "ACCEPTED",
  PREPARED: "PREPARED",
  WAITING: "WAITING",
  COMPLETED: "COMPLETED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderCreateDto {
  isDelivery: boolean;
  location: string;
  status: OrderStatus;
  productCount: number;
  product: number;
  user: number;
}

export interface BasketType {
  id?: number | string | null;
  product: ProductListResponseDto;
  productCount: number;
  user?: string | null;
}

export interface ProfileType {
  id: number | string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  googleId: string;
  picture: string;
  isAdmin: boolean;
  isChangePassword: boolean;
}

export interface LoginProps {
  setShowLoginForm: (value: boolean) => void;
}

export interface ProfileDataProps {
  profileData: ProfileType | null;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileType | null>>;
}

export interface ProfileProps {
  profile: ProfileType | null;
  setProfile: React.Dispatch<React.SetStateAction<ProfileType | null>>;
}

export interface ProfileReadOnlyProps {
  profile: ProfileType | null;
}

export interface ProfileSetOnlyProps {
  setProfile: React.Dispatch<React.SetStateAction<ProfileType | null>>;
}


export interface NavbarProps {
  profile: ProfileType | null;
  setProfile: React.Dispatch<React.SetStateAction<ProfileType | null>>;
  setShowCategory: React.Dispatch<React.SetStateAction<boolean>>;
  filter: FilterType,
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export interface CategoryProps {
  categoryClass: string;
  showCategory: boolean;
  filter: FilterType,
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>
}


export interface FilterType {
  name: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  hasDelivery: boolean | null;
  hasDiscount: boolean | null;
  categoryId: string | number | null;
}

export interface FilterProps {
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
}

export interface FilterAndData {
  filter: FilterType,
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>; 
  profile: ProfileType | null;
  setProfile: React.Dispatch<React.SetStateAction<ProfileType | null>>;
}