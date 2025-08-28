import { 
  configureStore, 
  ThunkAction, 
  Action, 
  createListenerMiddleware
} from '@reduxjs/toolkit'
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE, 
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import medicalChatReducer, { MedicalChatState } from './medicalChatSlice'

const persistConfig = {
  key: 'medical-chat',
  storage,
  whitelist: ['messages', 'diagnosticContext']
}

const persistedMedicalChatReducer = persistReducer<MedicalChatState>(persistConfig, medicalChatReducer)

const listenerMiddleware = createListenerMiddleware()

export const store = configureStore({
  reducer: {
    medicalChat: persistedMedicalChatReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'medicalChat/startStreaming', 
          'medicalChat/updateStreamingProgress'
        ],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    })
    .concat(listenerMiddleware.middleware),
  devTools: process.env.NODE_ENV !== 'production' && {
    trace: true,
    traceLimit: 25,
    maxAge: 50,
    name: 'Redux Médico - Cognitive Core'
  },
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      medicalChat: persistedMedicalChatReducer as any,
    },
    preloadedState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            FLUSH,
            REHYDRATE,
            PAUSE,
            PERSIST,
            PURGE,
            REGISTER,
            'medicalChat/startStreaming',
            'medicalChat/updateStreamingProgress'
          ],
        },
      }),
  })
}

export type AppStore = ReturnType<typeof setupStore>
export type AppState = ReturnType<AppStore['getState']>
