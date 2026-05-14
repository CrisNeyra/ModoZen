import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

type RatingInteractionType =
  | 'meditation_completed'
  | 'video_viewed'
  | 'reflection_received'
  | 'pomodoro_completed';

interface RatingPromptState {
  totalInteractions: number;
  lastPromptAt: number | null;
  lastDismissedAt: number | null;
  submittedAt: number | null;
}

interface RatingPromptContextType {
  trackInteraction: (type: RatingInteractionType) => Promise<void>;
}

const STORAGE_KEY = '@ModoZen:rating_prompt_v1';
const INTERACTIONS_TO_PROMPT = 5;
const PROMPT_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3; // 3 días

const initialState: RatingPromptState = {
  totalInteractions: 0,
  lastPromptAt: null,
  lastDismissedAt: null,
  submittedAt: null,
};

const RatingPromptContext = createContext<RatingPromptContextType | undefined>(undefined);

const shouldShowPrompt = (state: RatingPromptState, now: number): boolean => {
  if (state.submittedAt) return false;
  if (state.totalInteractions < INTERACTIONS_TO_PROMPT) return false;
  if (state.lastDismissedAt && now - state.lastDismissedAt < PROMPT_COOLDOWN_MS) return false;
  if (state.lastPromptAt && now - state.lastPromptAt < PROMPT_COOLDOWN_MS) return false;
  return true;
};

export const RatingPromptProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<RatingPromptState>(initialState);
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const loadState = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setState(JSON.parse(raw) as RatingPromptState);
        }
      } catch {
        setState(initialState);
      }
    };

    loadState();
  }, []);

  const persistState = useCallback(async (nextState: RatingPromptState) => {
    setState(nextState);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // Si falla persistencia, mantenemos estado en memoria para no romper UX.
    }
  }, []);

  const maybeOpenPrompt = useCallback(
    async (nextState: RatingPromptState) => {
      const now = Date.now();
      if (!shouldShowPrompt(nextState, now)) return;

      const stateWithPrompt: RatingPromptState = {
        ...nextState,
        lastPromptAt: now,
      };

      await persistState(stateWithPrompt);
      setIsVisible(true);
    },
    [persistState],
  );

  useEffect(() => {
    void maybeOpenPrompt(state);
  }, [maybeOpenPrompt, state]);

  const trackInteraction = useCallback(
    async (_type: RatingInteractionType) => {
      const nextState: RatingPromptState = {
        ...state,
        totalInteractions: state.totalInteractions + 1,
      };
      await persistState(nextState);
      await maybeOpenPrompt(nextState);
    },
    [maybeOpenPrompt, persistState, state],
  );

  const dismissForLater = useCallback(async () => {
    const nextState: RatingPromptState = {
      ...state,
      lastDismissedAt: Date.now(),
    };
    await persistState(nextState);
    setIsVisible(false);
    setRating(0);
    setFeedback('');
  }, [persistState, state]);

  const submitRating = useCallback(async () => {
    console.log(rating, feedback.trim());
    const nextState: RatingPromptState = {
      ...state,
      submittedAt: Date.now(),
    };
    await persistState(nextState);
    setIsVisible(false);
    setRating(0);
    setFeedback('');
  }, [feedback, persistState, rating, state]);

  const ctxValue = useMemo<RatingPromptContextType>(
    () => ({ trackInteraction }),
    [trackInteraction],
  );

  return (
    <RatingPromptContext.Provider value={ctxValue}>
      {children}

      <Modal visible={isVisible} transparent animationType="fade" onRequestClose={dismissForLater}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient
              colors={['rgba(147,51,234,0.28)', 'rgba(30,41,59,0.94)']}
              style={styles.modalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modalTitle}>Tu experiencia importa</Text>
              <Text style={styles.modalSubtitle}>Si querés, dejanos una calificación rápida.</Text>

              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} style={styles.starBtn} onPress={() => setRating(star)}>
                    <Text style={[styles.starText, star <= rating && styles.starTextActive]}>
                      {star <= rating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Feedback opcional..."
                placeholderTextColor="rgba(255,255,255,0.45)"
                multiline
                value={feedback}
                onChangeText={setFeedback}
                maxLength={400}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.primaryButton, rating <= 0 && styles.primaryButtonDisabled]}
                onPress={submitRating}
                disabled={rating <= 0}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>Enviar calificación</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={dismissForLater} activeOpacity={0.8}>
                <Text style={styles.secondaryButtonText}>Quizás luego</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </RatingPromptContext.Provider>
  );
};

export const useRatingPrompt = (): RatingPromptContextType => {
  const ctx = useContext(RatingPromptContext);
  if (!ctx) {
    throw new Error('useRatingPrompt debe usarse dentro de RatingPromptProvider');
  }
  return ctx;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.74)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.32)',
  },
  modalGradient: {
    padding: 22,
    backgroundColor: '#151A2A',
  },
  modalTitle: {
    color: '#F5F3FF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  starBtn: { padding: 4 },
  starText: {
    color: 'rgba(255,255,255,0.32)',
    fontSize: 34,
  },
  starTextActive: {
    color: '#F5C842',
  },
  input: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(192,132,252,0.3)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
  primaryButton: {
    backgroundColor: '#9333EA',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir-Medium',
  },
  secondaryButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'Avenir',
  },
});
