import React, { createContext, useContext, useState } from 'react';

export type EventType = 'haldi' | 'mehendi' | 'sangeet' | 'engagement' | 'wedding' | 'reception' | 'custom';

export interface WeddingEvent {
  id: string;
  type: EventType;
  name: string;
  date: string;
  time: string;
  isSelected: boolean;
  description: string;
}

export type AccessLevel = 'couple_view' | 'family_view' | 'full' | 'budget' | 'task' | 'event_specific' | 'view_only' | 'guest';

export interface Participant {
  id: string;
  name: string;
  phone: string;
  accessLevel: AccessLevel;
  roleGroup: 'couple' | 'family' | 'general';
}

type Mode = 1 | 2 | null;

interface OnboardingState {
  mode: Mode;
  setMode: (mode: Mode) => void;
  // Step 1: Details
  partner1: string;
  setPartner1: (val: string) => void;
  partner2: string;
  setPartner2: (val: string) => void;
  weddingDate: string; // ISO string or plain string
  setWeddingDate: (val: string) => void;
  muhuratFlag: boolean;
  setMuhuratFlag: (val: boolean) => void;
  city: string;
  setCity: (val: string) => void;
  isDestination: boolean;
  setIsDestination: (val: boolean) => void;
  detailsSkipped: boolean;
  setDetailsSkipped: (val: boolean) => void;
  // Planning horizon (computed from weddingDate)
  lateStartFlag: boolean;
  lateStartWeeks: number;
  // Step 2: Events
  events: WeddingEvent[];
  setEvents: React.Dispatch<React.SetStateAction<WeddingEvent[]>>;
  eventsSkipped: boolean;
  setEventsSkipped: (val: boolean) => void;
  // Step 3: Budget
  budget: number | null; // stored in paise
  setBudget: (val: number | null) => void;
  budgetSkipped: boolean;
  setBudgetSkipped: (val: boolean) => void;
  // Step 4: Participants
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  // Template selection (Mode 1 only)
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
  // Generic partial update helper
  updateOnboarding: (partial: Partial<Omit<OnboardingState, 'updateOnboarding'>>) => void;
}

const OnboardingContext = createContext<OnboardingState | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [muhuratFlag, setMuhuratFlag] = useState(false);
  const [city, setCity] = useState('');
  const [isDestination, setIsDestination] = useState(false);
  const [detailsSkipped, setDetailsSkipped] = useState(false);
  const [lateStartFlag, setLateStartFlag] = useState(false);
  const [lateStartWeeks, setLateStartWeeks] = useState(0);

  const defaultEvents: WeddingEvent[] = [
    { id: 'haldi', type: 'haldi', name: 'Haldi', date: '', time: '', isSelected: true, description: 'Turmeric ceremony, usually the morning before the wedding' },
    { id: 'mehendi', type: 'mehendi', name: 'Mehendi', date: '', time: '', isSelected: true, description: 'Henna ceremony, usually the evening before the wedding' },
    { id: 'sangeet', type: 'sangeet', name: 'Sangeet', date: '', time: '', isSelected: true, description: 'Music and dance celebration, usually 1–2 days before' },
    { id: 'engagement', type: 'engagement', name: 'Engagement', date: '', time: '', isSelected: true, description: 'Ring exchange ceremony' },
    { id: 'wedding', type: 'wedding', name: 'Wedding', date: '', time: '', isSelected: true, description: 'The main ceremony' },
    { id: 'reception', type: 'reception', name: 'Reception', date: '', time: '', isSelected: true, description: 'Post-wedding celebration for extended guests' },
  ];

  const [events, setEvents] = useState<WeddingEvent[]>(defaultEvents);
  const [eventsSkipped, setEventsSkipped] = useState(false);
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetSkipped, setBudgetSkipped] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'couple-1', name: '', phone: '', accessLevel: 'couple_view', roleGroup: 'couple' },
    { id: 'couple-2', name: '', phone: '', accessLevel: 'couple_view', roleGroup: 'couple' },
  ]);

  const updateOnboarding = (partial: Partial<Omit<OnboardingState, 'updateOnboarding'>>) => {
    if (partial.lateStartFlag !== undefined) setLateStartFlag(partial.lateStartFlag);
    if (partial.lateStartWeeks !== undefined) setLateStartWeeks(partial.lateStartWeeks);
    if (partial.mode !== undefined) setMode(partial.mode);
    if (partial.partner1 !== undefined) setPartner1(partial.partner1);
    if (partial.partner2 !== undefined) setPartner2(partial.partner2);
    if (partial.weddingDate !== undefined) setWeddingDate(partial.weddingDate);
    if (partial.muhuratFlag !== undefined) setMuhuratFlag(partial.muhuratFlag);
    if (partial.city !== undefined) setCity(partial.city);
    if (partial.isDestination !== undefined) setIsDestination(partial.isDestination);
    if (partial.detailsSkipped !== undefined) setDetailsSkipped(partial.detailsSkipped);
    if (partial.eventsSkipped !== undefined) setEventsSkipped(partial.eventsSkipped);
    if (partial.budget !== undefined) setBudget(partial.budget);
    if (partial.budgetSkipped !== undefined) setBudgetSkipped(partial.budgetSkipped);
    if (partial.selectedTemplateId !== undefined) setSelectedTemplateId(partial.selectedTemplateId);
  };

  const value = {
    mode, setMode,
    partner1, setPartner1,
    partner2, setPartner2,
    weddingDate, setWeddingDate,
    muhuratFlag, setMuhuratFlag,
    city, setCity,
    isDestination, setIsDestination,
    detailsSkipped, setDetailsSkipped,
    lateStartFlag,
    lateStartWeeks,
    events, setEvents,
    eventsSkipped, setEventsSkipped,
    budget, setBudget,
    budgetSkipped, setBudgetSkipped,
    participants, setParticipants,
    selectedTemplateId, setSelectedTemplateId,
    updateOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
