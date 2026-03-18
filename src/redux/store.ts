import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './features/authSlice';
import publicShopReducer from './features/publicShopSlice';
import publicShopDetailReducer from './features/publicShopDetailSlice';
import publicDishDetailReducer from './features/publicDishDetailSlice';
import shopDetailReducer from './features/shopDetailSlice';
import dishReducer from './features/dishSlice';
import categoriesReducer from './features/categoriesSlice';
import ownerShopsReducer from './features/ownerShopsSlice';
import favoritesReducer from './features/favoritesSlice';
import publicDishReducer from './features/publicDishSlice';
import notificationPreferencesReducer from './features/notificationPreferencesSlice';
import currencyReducer from './features/currencySlice';

const rootReducer = {
  auth: authReducer,
  publicShop: publicShopReducer, // Public-facing shop functionality
  publicDish: publicDishReducer, // Public-facing dish functionality
  publicShopDetail: publicShopDetailReducer, // Public-facing shop detail functionality
  publicDishDetail: publicDishDetailReducer, // Public-facing dish detail functionality
  shopDetail: shopDetailReducer, // Owner shop detail functionality
  dish: dishReducer, // Owner dish functionality
  categories: categoriesReducer, // Categories functionality
  ownerShops: ownerShopsReducer, // Owner shops list functionality
  favorites: favoritesReducer, // Favorites functionality
  notificationPreferences: notificationPreferencesReducer, // Notification preferences functionality
  currency: currencyReducer, // Currency functionality
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }),
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;