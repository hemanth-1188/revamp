export type PatternCategory =
  | 'Floral'
  | 'Geometric'
  | 'Solid'
  | 'Block Print'
  | 'Stripes'
  | 'Checks'
  | 'Abstract'
  | 'Traditional'
  | 'Embroidered'
  | 'Printed';

export interface ColorExtraction {
  name: string;
  hex: string;
  percentage: number;
}

export interface CustomizationPreferences {
  sleeveLength: string;
  kurtiLength: string;
  neckline: string;
  silhouette: string;
  addOns?: string[];
  fabric?: string;
  fabricPreference?: string;
  occasion: string;
  customPockets?: boolean;
}

export type InputType = 'fabric_only' | 'finished_garment' | 'unclear';

export type FabricQuantityCategory = 'small' | 'standard' | 'large' | 'saree_length' | 'saree' | 'unknown';

export interface FabricQuantity {
  category: FabricQuantityCategory;
  label: string;
  meters?: number;
  userProvided: boolean;
}

export interface DesignSpecification {
  garmentType:
    | 'Kurti'
    | 'Short Kurti'
    | 'Anarkali'
    | 'Blouse'
    | 'Gown'
    | 'Men Shirt'
    | 'Men TShirt'
    | 'Men Kurta'
    | 'Men Jacket'
    | 'Trousers'
    | string;
  silhouette: string;
  primaryColor: string;
  primaryColorHex: string;
  secondaryColors?: string[];
  secondaryHexes?: string[];
  pattern: string;
  neckline: string;
  sleeveStyle: string;
  length: string;
  fabricCharacteristics: string;
  designDetails: string;
  fabricImageUrl?: string;
  sourceOfTruth?: 'uploaded_fabric' | 'finished_garment_reference';
}

export interface KurtiDesign {
  id: string;
  name: string;
  category: 'kurti' | 'short-kurti' | 'blouse' | 'gown' | 'dress' | 'men-shirt' | 'men-tshirt' | 'men-kurta' | 'men-jacket' | 'trousers' | string;
  gender?: 'women' | 'men' | 'unisex';
  collection?: 'women' | 'men';
  description: string;
  imageUrl: string;
  image?: string; // alias
  frontImage: string;
  backImage: string;
  colors: string[];
  hexPalette: string[];
  pattern: PatternCategory | string;
  fabric: 'Cotton' | 'Rayon' | 'Silk Blend' | 'Linen' | 'Georgette' | 'Chanderi' | 'Khadi' | 'Crepe' | string;
  occasion: 'Casual' | 'Office' | 'Festive' | 'College' | 'Party' | string;
  style: 'A-line' | 'Straight Cut' | 'Anarkali' | 'Flared' | 'Asymmetric' | 'Angrakha' | 'Kaftan' | 'Classic Fit' | 'Slim Fit' | string;
  neckline: string;
  sleeves: string;
  length: string;
  silhouette: string;
  price?: number;
  priceEstimate?: number;
  popularityScore: number; // 0 - 100
  tags: string[];
  availableTailorCount: number;
  matchScore?: number;
  matchReasons?: string[];
  badge?: 'Best Match' | 'Highly Similar' | 'Popular Style' | 'Trending';
  specialInstructions?: string;
  createdAt?: string;
  // Fabric-aware design suitability metadata
  minFabricRequiredMeters?: number; // e.g. 1.0, 1.5, 2.2, 3.5, 5.5
  fabricSuitabilityNote?: string;
  customizationPossibilities?: string[];
  garmentIdeaType?: 'kurti' | 'short-kurti' | 'blouse' | 'crop-top' | 'anarkali' | 'saree' | 'shirt' | 't-shirt' | 'kurta' | 'jacket' | 'gown' | 'dress' | string;
  designSpecification?: DesignSpecification;
}

export interface Tailor {
  id: string;
  name: string;
  shopName?: string;
  email?: string;
  profileImage: string;
  location: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  specializations: string[];
  experience: number; // years
  priceRange: string; // e.g. "₹450 - ₹950"
  typicalStitchingRange: string; // e.g. "₹600 – ₹1,200"
  startingPrice: number;
  distance: number; // in km
  availability: 'Available this week' | 'Next week' | 'Busy';
  turnaroundTime: string; // e.g. "3 - 5 days"
  customizationTypes: string[];
  description: string;
  phone: string;
  sampleImages: string[];
  onboardingCompleted?: boolean;
  rankScore?: number;
  rankReasons?: string[];
}

export type OrderStatus =
  | 'Request Sent'
  | 'Tailor Reviewing'
  | 'Price Confirmed'
  | 'Stitching Started'
  | 'Quality Check'
  | 'Ready for Pickup / Delivery'
  | 'Completed'
  // Legacy / fallback statuses
  | 'Order Placed'
  | 'Tailor Accepted'
  | 'Cutting'
  | 'Stitching'
  | 'Ready'
  | 'Measurements Confirmed'
  | 'Cutting & Stitching'
  | 'Ready for Pickup';

export interface Measurements {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Custom';
  bust: number;
  waist: number;
  hip: number;
  length: number;
  sleeveLength: number;
  neckStyle: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  designId: string;
  design: KurtiDesign;
  tailorId: string;
  tailor: Tailor;
  status: OrderStatus;
  statusTimeline: {
    status: OrderStatus;
    timestamp: string;
    completed: boolean;
    note?: string;
  }[];
  customization?: CustomizationPreferences;
  estimatedCost?: string;
  size: string;
  measurements: Measurements;
  instructions: string;
  referenceImageUrl?: string;
  amount: number;
  stitchingCharge: number;
  liningCharge: number;
  expressDelivery: boolean;
  paymentStatus: 'Paid (Demo Razorpay)' | 'Pending' | 'Request Sent' | 'Failed';
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
}

export type UserRole = 'customer' | 'tailor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tailorId?: string;
  phone?: string;
  profileImage: string;
  location: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  savedDesignIds: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  tailorId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AIAnalysisResult {
  // Input Classification
  inputType: InputType;
  inputTypeLabel: string;
  inputTypeConfidence: 'High' | 'Medium' | 'Low';

  // Visual Attributes (Always detected directly from image pixels)
  dominantColors: ColorExtraction[];
  colorPalette: string[];
  pattern: PatternCategory | string;
  patternConfidence: 'High' | 'Medium' | 'Estimated';
  confidenceScore: number;

  // Visual Texture & Characteristics
  texture?: string;
  textureConfidence?: 'High' | 'Medium' | 'Low' | 'Estimated';
  borderDetails?: string;
  apparentCharacteristics?: {
    weight?: 'Lightweight' | 'Medium-weight' | 'Structured' | 'Fluid';
    opacity?: 'Opaque' | 'Semi-sheer' | 'Sheer';
    borderDetails?: string;
    drape?: string;
  };

  // Material / Fiber Identification with Uncertainty Handling
  materialConfidence: 'high' | 'medium' | 'unable_to_determine';
  materialIdentified?: string;
  materialNote?: string;

  // Fabric Quantity Constraints (If user specified or estimated)
  fabricQuantity?: FabricQuantity;

  // Garment Attributes (ONLY populated when inputType === 'finished_garment')
  style?: string;
  silhouette?: string;
  estimatedNeckline?: string;
  sleeveType?: string;
  length?: string;
  occasion?: string;
  garmentDetails?: {
    garmentType?: string;
    silhouette?: string;
    neckline?: string;
    sleeves?: string;
    length?: string;
    visibleDesignDetails?: string[];
  };

  // Legacy/compatibility fields
  likelyFabric: string;
  fabricRecommendation: string;
  originalImage: string;
  filename?: string;
  extractedAt: string;
  analysisSource: 'client-vision-kmeans' | 'gemini-vision' | 'crisp-ai-fallback';
  pinterestQuery: string;
  detectedFeatures: {
    silhouette?: string;
    neckline?: string;
    sleeveType?: string;
    primaryHue: string;
    length?: string;
    fabric?: string;
    inputType?: InputType;
    texture?: string;
  };
}
