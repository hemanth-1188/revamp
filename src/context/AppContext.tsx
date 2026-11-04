import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  KurtiDesign,
  Tailor,
  Order,
  OrderStatus,
  AIAnalysisResult,
  Measurements,
  CustomizationPreferences,
} from '../types';
import {
  DEMO_USER,
  KURTI_CATALOG,
  TAILORS,
  INITIAL_ORDERS,
  SAMPLE_INSPIRATIONS,
} from '../data/mockData';
import { runAIAnalysis, getRecommendedDesigns, rankTailorsForDesign } from '../lib/aiService';
import { logoutFirebase } from '../lib/firebase';
import { updateOrderStatusApi, fetchAllTailorsApi, updateTailorLocationApi } from '../lib/api';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginDemoUser: (userIndex?: number) => void;
  loginUser: (user: User) => void;
  logout: () => void;
  updateUserLocation: (newLocation: string) => void;

  // Catalog & Recommendations
  catalog: KurtiDesign[];
  uploadedImage: string | null;
  analysisResult: AIAnalysisResult | null;
  isAnalyzing: boolean;
  analysisStage: string;
  recommendations: KurtiDesign[];
  savedDesignIds: string[];
  toggleSaveDesign: (id: string) => void;
  runUploadAndAnalyze: (
    imageSrc: string,
    filename?: string,
    options?: { declaredInputType?: import('../types').InputType; fabricQuantity?: import('../types').FabricQuantity }
  ) => Promise<void>;
  updateFabricQuantity: (quantity: import('../types').FabricQuantity) => void;
  updateInputTypeOverride: (inputType: import('../types').InputType) => void;
  resetUpload: () => void;

  // Personalized Questionnaire State
  userPreferences: CustomizationPreferences | null;
  setUserPreferences: (prefs: CustomizationPreferences | null) => void;

  // Tailors
  tailors: Tailor[];
  rankedTailors: Tailor[];
  selectedTailor: Tailor | null;
  setSelectedTailor: (tailor: Tailor | null) => void;
  updateTailorLocation: (tailorId: string, location: string, latitude: number, longitude: number) => void;
  updateTailorProfile: (tailorId: string, profile: Partial<Tailor>) => void;

  // Orders
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (orderData: {
    design: KurtiDesign;
    tailor: Tailor;
    size: string;
    measurements: Measurements;
    instructions: string;
    amount: number;
    stitchingCharge: number;
    liningCharge: number;
    expressDelivery: boolean;
    referenceImageUrl?: string;
    customization?: CustomizationPreferences;
    estimatedCost?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string) => void;

  // Navigation / Routing
  currentRoute: string;
  routeParams: Record<string, string>;
  navigateTo: (route: string, params?: Record<string, string>) => void;

  // Selected Design
  selectedDesign: KurtiDesign | null;
  setSelectedDesign: (design: KurtiDesign | null) => void;

  // Admin capabilities
  addNewDesign: (design: Omit<KurtiDesign, 'id'>) => void;
  updateDesignPopularity: (id: string, score: number) => void;
  deleteDesign: (id: string) => void;

  // Notification Toast
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('reweave_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (
        !parsed?.email ||
        parsed?.id?.startsWith('usr_') ||
        parsed?.id?.includes('deepa') ||
        parsed?.id?.includes('priya') ||
        parsed?.id?.includes('ananya') ||
        parsed?.email?.includes('reweave.com')
      ) {
        localStorage.removeItem('reweave_user');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname === '/' ? '/' : window.location.pathname;
  });
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  // Catalog & AI
  const [catalog, setCatalog] = useState<KurtiDesign[]>(() => {
    const saved = localStorage.getItem('reweave_catalog') || localStorage.getItem('kurtiq_catalog');
    return saved ? JSON.parse(saved) : KURTI_CATALOG;
  });
  const [savedDesignIds, setSavedDesignIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('reweave_saved');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(() => {
    return localStorage.getItem('reweave_upload_img') || null;
  });
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(() => {
    const saved = localStorage.getItem('reweave_analysis');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');

  // Personalization Questionnaire Preferences
  const [userPreferences, setUserPreferences] = useState<CustomizationPreferences | null>(() => {
    const saved = localStorage.getItem('reweave_preferences');
    return saved ? JSON.parse(saved) : null;
  });

  // Selected entities (No prefilled dummy entities)
  const [selectedDesign, setSelectedDesign] = useState<KurtiDesign | null>(() => catalog[0] || null);
  const [selectedTailor, setSelectedTailor] = useState<Tailor | null>(null);

  // Tailors - Completely zero prefilled fake tailors
  const [tailors, setTailors] = useState<Tailor[]>(() => {
    const saved = localStorage.getItem('reweave_tailors');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Filter out any legacy dummy tailors
      return parsed.filter((t: Tailor) => !t.name?.includes('Meenakshi') && !t.name?.includes('Rafiq') && !t.name?.includes('Vandana') && !t.name?.includes('Geetha') && !t.name?.includes('Hameed') && !t.name?.includes('Lakshmi'));
    } catch {
      return [];
    }
  });

  // Orders - Completely zero prefilled fake orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('reweave_orders');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Filter out any legacy dummy orders
      return parsed.filter((o: Order) => !o.id?.startsWith('ORD-98') && !o.userName?.includes('Priya') && !o.userName?.includes('Kavitha'));
    } catch {
      return [];
    }
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Sync to LocalStorage
  useEffect(() => {
    if (user) localStorage.setItem('reweave_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('reweave_catalog', JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem('reweave_saved', JSON.stringify(savedDesignIds));
  }, [savedDesignIds]);

  useEffect(() => {
    localStorage.setItem('reweave_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('reweave_tailors', JSON.stringify(tailors));
  }, [tailors]);

  useEffect(() => {
    if (analysisResult) {
      localStorage.setItem('reweave_analysis', JSON.stringify(analysisResult));
    }
  }, [analysisResult]);

  useEffect(() => {
    if (userPreferences) {
      localStorage.setItem('reweave_preferences', JSON.stringify(userPreferences));
    }
  }, [userPreferences]);

  // Handle browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch real registered tailors from MongoDB Atlas
  useEffect(() => {
    fetchAllTailorsApi().then((serverTailors) => {
      if (serverTailors && serverTailors.length > 0) {
        setTailors(serverTailors);
      }
    });
  }, []);

  // Navigation helper
  const navigateTo = (route: string, params: Record<string, string> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({}, '', route);
    } catch {
      // Ignore if iframe origin policy restricts pushState
    }
  };

  // Auth Methods
  const loginUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('reweave_user', JSON.stringify(newUser));
    showToast(`Welcome, ${newUser.name}! Logged in as ${newUser.role.toUpperCase()}.`, 'success');

    // If tailor logs in, dynamically ensure their tailor profile exists in tailors state
    if (newUser.role === 'tailor') {
      const tailorId = newUser.tailorId || `T_${newUser.id.slice(-6)}`;
      setTailors((prev) => {
        if (prev.some((t) => t.id === tailorId)) return prev;
        const newTailor: Tailor = {
          id: tailorId,
          name: newUser.name,
          profileImage: newUser.profileImage,
          location: newUser.location || '',
          latitude: (newUser as any).latitude || 0,
          longitude: (newUser as any).longitude || 0,
          rating: 5.0,
          reviewCount: 0,
          specializations: ['Bespoke Kurtis', 'Cotton & Silk', 'Custom Sizing'],
          experience: 5,
          priceRange: '₹500 - ₹1,200',
          typicalStitchingRange: 'Typical stitching range: ₹500 – ₹1,200',
          startingPrice: 500,
          distance: 1.0,
          availability: 'Available this week',
          turnaroundTime: '3 – 5 days',
          customizationTypes: ['Neckline modification', 'Custom sleeves', 'Pockets'],
          description: `Custom artisanal stitching by ${newUser.name}. Verified master tailor.`,
          phone: newUser.phone || '',
          sampleImages: [],
        };
        const updated = [newTailor, ...prev];
        localStorage.setItem('reweave_tailors', JSON.stringify(updated));
        return updated;
      });
      navigateTo('/tailor/dashboard');
    } else if (newUser.role === 'admin') {
      navigateTo('/admin');
    } else {
      navigateTo('/dashboard');
    }
  };

  const loginDemoUser = () => {
    navigateTo('/login');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('reweave_user');
    logoutFirebase().catch(() => {});
    showToast('Signed out successfully.', 'info');
    navigateTo('/login');
  };

  const updateUserLocation = (newLocation: string) => {
    if (user) {
      setUser({ ...user, location: newLocation });
      showToast(`Location updated to ${newLocation}`, 'info');
    }
  };

  const updateTailorLocation = (tailorId: string, location: string, latitude: number, longitude: number) => {
    setTailors((prev) =>
      prev.map((t) => (t.id === tailorId ? { ...t, location, latitude, longitude } : t))
    );
    if (user && (user.tailorId === tailorId || user.role === 'tailor')) {
      const updatedUser = { ...user, location };
      setUser(updatedUser);
      localStorage.setItem('reweave_user', JSON.stringify(updatedUser));
    }
    updateTailorLocationApi({ tailorId, location, latitude, longitude, email: user?.email }).catch(() => {});
    showToast(`Boutique location registered in geolocation: ${location.split(',')[0]}`, 'success');
  };

  const updateTailorProfile = (tailorId: string, profile: Partial<Tailor>) => {
    setTailors((prev) =>
      prev.map((t) => (t.id === tailorId ? { ...t, ...profile } : t))
    );
    if (user && (user.tailorId === tailorId || user.role === 'tailor')) {
      const updatedUser = {
        ...user,
        ...(profile.name && { name: profile.name }),
        ...(profile.phone !== undefined && { phone: profile.phone }),
        ...(profile.location !== undefined && { location: profile.location }),
        ...(profile.shopName && { tailorShopName: profile.shopName }),
      };
      setUser(updatedUser);
      localStorage.setItem('reweave_user', JSON.stringify(updatedUser));
    }
  };

  // Save / Bookmark
  const toggleSaveDesign = (id: string) => {
    setSavedDesignIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? 'Removed from saved designs' : 'Saved to your inspiration board!', 'success');
      return updated;
    });
  };

  // AI Upload & Analysis Flow
  const runUploadAndAnalyze = async (
    imageSrc: string,
    filename?: string,
    options?: { declaredInputType?: import('../types').InputType; fabricQuantity?: import('../types').FabricQuantity }
  ) => {
    setUploadedImage(imageSrc);
    localStorage.setItem('reweave_upload_img', imageSrc);
    setIsAnalyzing(true);

    try {
      setAnalysisStage('Sampling uploaded pixels on canvas...');
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisStage('Detecting input type (Fabric vs Finished Garment)...');
      await new Promise((r) => setTimeout(r, 450));

      setAnalysisStage('Extracting dominant colors & visual texture...');
      await new Promise((r) => setTimeout(r, 450));

      setAnalysisStage('Evaluating pattern, craft motifs & suitability...');
      const result = await runAIAnalysis(imageSrc, filename, options);
      setAnalysisResult(result);
      const newRecs = getRecommendedDesigns(catalog, result, userPreferences, undefined, imageSrc);
      if (newRecs && newRecs.length > 0) {
        setSelectedDesign(newRecs[0]);
      }
      await new Promise((r) => setTimeout(r, 300));

      const msg =
        result.inputType === 'fabric_only'
          ? `Fabric detected (${result.pattern})! Generating suitable garment ideas.`
          : result.inputType === 'finished_garment'
          ? `Finished garment detected (${result.pattern})! Finding matching designs.`
          : `Analysis complete. Review recommendations below.`;

      showToast(msg, 'success');
      // Per product rule: Route directly to recommendations/analysis page after image analysis
      navigateTo('/recommendations');
    } catch (err) {
      console.error('AI analysis error:', err);
      showToast('Image analyzed. Here are your recommendations.', 'info');
      navigateTo('/recommendations');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  const updateFabricQuantity = (quantity: import('../types').FabricQuantity) => {
    setAnalysisResult((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        fabricQuantity: quantity,
      };
      localStorage.setItem('reweave_analysis', JSON.stringify(updated));
      return updated;
    });
    showToast(`Updated fabric quantity: ${quantity.label}`, 'info');
  };

  const updateInputTypeOverride = (inputType: import('../types').InputType) => {
    setAnalysisResult((prev) => {
      if (!prev) return prev;
      const label =
        inputType === 'fabric_only'
          ? 'Fabric detected'
          : inputType === 'finished_garment'
          ? 'Finished Garment'
          : 'Unable to determine whether this is fabric or a finished garment';

      const updated = {
        ...prev,
        inputType,
        inputTypeLabel: label,
        inputTypeConfidence: 'High' as const,
        style: inputType === 'fabric_only' ? undefined : prev.style || 'Straight Cut',
        estimatedNeckline: inputType === 'fabric_only' ? undefined : prev.estimatedNeckline || 'Round Neck',
        sleeveType: inputType === 'fabric_only' ? undefined : prev.sleeveType || 'Three-Quarter Sleeves',
      };
      localStorage.setItem('reweave_analysis', JSON.stringify(updated));
      return updated;
    });
    showToast(
      inputType === 'fabric_only'
        ? 'Switched to Fabric Only mode'
        : 'Switched to Finished Garment mode',
      'info'
    );
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    localStorage.removeItem('reweave_upload_img');
    localStorage.removeItem('reweave_analysis');
  };

  // Derived Recommendations based on Image Analysis + User Preferences + Kurti Catalog
  const recommendations = React.useMemo(() => {
    return getRecommendedDesigns(catalog, analysisResult, userPreferences, undefined, uploadedImage);
  }, [catalog, analysisResult, userPreferences, uploadedImage]);

  // Derived Ranked Tailors
  const rankedTailors = React.useMemo(() => {
    return rankTailorsForDesign(tailors, selectedDesign || undefined);
  }, [tailors, selectedDesign]);

  // Order Operations
  const createOrder = async (orderData: {
    design: KurtiDesign;
    tailor: Tailor;
    size: string;
    measurements: Measurements;
    instructions: string;
    amount: number;
    stitchingCharge: number;
    liningCharge: number;
    expressDelivery: boolean;
    referenceImageUrl?: string;
    customization?: CustomizationPreferences;
    estimatedCost?: string;
  }): Promise<Order> => {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const paymentId = `pay_rzp_${Date.now().toString().slice(-8)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (orderData.expressDelivery ? 4 : 7));

    const newOrder: Order = {
      id: orderId,
      userId: user?.id || `user_${Date.now()}`,
      userName: user?.name || 'Customer',
      userEmail: user?.email || '',
      userPhone: user?.phone || '',
      designId: orderData.design.id,
      design: orderData.design,
      tailorId: orderData.tailor.id,
      tailor: orderData.tailor,
      status: 'Request Sent',
      statusTimeline: [
        {
          status: 'Request Sent',
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          completed: true,
          note: 'Kurti request submitted with design references and fit customization',
        },
        {
          status: 'Tailor Reviewing',
          timestamp: '',
          completed: false,
          note: 'Tailor reviewing measurements, neck styling & fabric requirements',
        },
        {
          status: 'Price Confirmed',
          timestamp: '',
          completed: false,
          note: 'Final stitching cost confirmed by tailor',
        },
        {
          status: 'Stitching Started',
          timestamp: '',
          completed: false,
          note: 'Pattern cut on grain line, assembling body and sleeves',
        },
        {
          status: 'Quality Check',
          timestamp: '',
          completed: false,
          note: 'Checking seam reinforcement, hemline drop, and finishing',
        },
        {
          status: 'Ready for Pickup / Delivery',
          timestamp: '',
          completed: false,
          note: 'Steam pressed, bagged, and ready for pickup or courier delivery',
        },
        {
          status: 'Completed',
          timestamp: '',
          completed: false,
          note: 'Garment handed over and fit satisfaction logged',
        },
      ],
      customization: orderData.customization || userPreferences || undefined,
      estimatedCost: orderData.estimatedCost || '₹900 – ₹1,400',
      size: orderData.size,
      measurements: orderData.measurements,
      instructions: orderData.instructions,
      referenceImageUrl: orderData.referenceImageUrl || orderData.design.imageUrl,
      amount: orderData.amount,
      stitchingCharge: orderData.stitchingCharge,
      liningCharge: orderData.liningCharge,
      expressDelivery: orderData.expressDelivery,
      paymentStatus: 'Request Sent',
      paymentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: deliveryDate.toISOString().split('T')[0],
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Request ${orderId} sent to ${orderData.tailor.name}!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    const orderStatuses: OrderStatus[] = [
      'Request Sent',
      'Tailor Reviewing',
      'Price Confirmed',
      'Stitching Started',
      'Quality Check',
      'Ready for Pickup / Delivery',
      'Completed',
    ];

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const targetIdx = orderStatuses.indexOf(newStatus);

        const updatedTimeline = ord.statusTimeline.map((item) => {
          const itemIdx = orderStatuses.indexOf(item.status);
          const isCurrentTarget = item.status === newStatus;

          return {
            ...item,
            completed: itemIdx <= targetIdx,
            timestamp:
              itemIdx <= targetIdx
                ? item.timestamp ||
                  new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                : '',
            note: isCurrentTarget && note ? note : item.note,
          };
        });

        return {
          ...ord,
          status: newStatus,
          statusTimeline: updatedTimeline,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    updateOrderStatusApi(orderId, newStatus, note).catch(() => {});
    showToast(`Order status updated: ${newStatus}`, 'success');
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(`Order ${orderId} cancelled.`, 'info');
  };

  // Admin Catalog Actions
  const addNewDesign = (newDesignData: Omit<KurtiDesign, 'id'>) => {
    const newId = `K0${catalog.length + 1}`;
    const fullDesign: KurtiDesign = {
      ...newDesignData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setCatalog((prev) => [fullDesign, ...prev]);
    showToast(`Design "${fullDesign.name}" added to catalog!`, 'success');
  };

  const updateDesignPopularity = (id: string, score: number) => {
    setCatalog((prev) =>
      prev.map((d) => (d.id === id ? { ...d, popularityScore: score } : d))
    );
    showToast('Popularity score updated', 'info');
  };

  const deleteDesign = (id: string) => {
    setCatalog((prev) => prev.filter((d) => d.id !== id));
    showToast('Design removed from catalog.', 'info');
  };

  const currentOrder = orders[0] || null;

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginDemoUser,
        loginUser,
        logout,
        updateUserLocation,
        catalog,
        uploadedImage,
        analysisResult,
        isAnalyzing,
        analysisStage,
        recommendations,
        savedDesignIds,
        toggleSaveDesign,
        runUploadAndAnalyze,
        updateFabricQuantity,
        updateInputTypeOverride,
        resetUpload,
        userPreferences,
        setUserPreferences,
        tailors,
        rankedTailors,
        selectedTailor,
        setSelectedTailor,
        updateTailorLocation,
        orders,
        currentOrder,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        currentRoute,
        routeParams,
        navigateTo,
        selectedDesign,
        setSelectedDesign,
        addNewDesign,
        updateDesignPopularity,
        deleteDesign,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
