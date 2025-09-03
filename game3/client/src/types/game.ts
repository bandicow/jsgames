// 클라이언트 전용 타입들
export * from '@shared/types';

export interface GameState {
  currentScreen: 'menu' | 'lobby' | 'game';
  selectedGame: 'uno' | 'reaction' | null;
  playerName: string;
  roomId: string | null;
  room: any | null;
  gameData: any | null;
  error: string | null;
  isConnected: boolean;
}

export interface AppContextType extends GameState {
  setCurrentScreen: (screen: 'menu' | 'lobby' | 'game') => void;
  setSelectedGame: (game: 'uno' | 'reaction' | null) => void;
  setPlayerName: (name: string) => void;
  setRoomId: (id: string | null) => void;
  setRoom: (room: any | null) => void;
  setGameData: (data: any | null) => void;
  setError: (error: string | null) => void;
  setIsConnected: (connected: boolean) => void;
}

// UI 관련 타입들
export interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// 게임 전용 컴포넌트 타입들
export interface UnoCardComponentProps {
  card: import('@shared/types').UnoCard;
  onClick?: (card: import('@shared/types').UnoCard) => void;
  isPlayable?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface PlayerHandProps {
  cards: import('@shared/types').UnoCard[];
  onCardPlay: (card: import('@shared/types').UnoCard) => void;
  playableCards: string[];
}

export interface ReactionButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
}