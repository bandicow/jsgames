// 공통 게임 타입 정의

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

export interface Room {
  id: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  currentGame: GameType | null;
  gameState: any;
}

export type GameType = 'uno' | 'reaction';

export interface GameResult {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
}

// Socket 이벤트 타입들
export interface ServerToClientEvents {
  // 룸 관련
  roomCreated: (room: Room) => void;
  roomJoined: (room: Room) => void;
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  playerReady: (playerId: string, isReady: boolean) => void;
  
  // 게임 공통
  gameStarted: (gameType: GameType) => void;
  gameEnded: (results: GameResult[]) => void;
  gameStateChanged: (state: any) => void;
  
  // 우노 게임
  unoCardPlayed: (playerId: string, card: UnoCard) => void;
  unoTurnChanged: (playerId: string) => void;
  unoPlayerDeclaration: (playerId: string) => void;
  
  // 반응속도 게임
  reactionGameReady: () => void;
  reactionGameStart: () => void;
  reactionPlayerClicked: (playerId: string, time: number) => void;
  
  // 에러
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  // 룸 관련
  createRoom: (roomName: string, playerName: string) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  leaveRoom: () => void;
  toggleReady: () => void;
  
  // 게임 시작
  startGame: (gameType: GameType) => void;
  
  // 우노 게임
  playUnoCard: (card: UnoCard) => void;
  declareUno: () => void;
  
  // 반응속도 게임
  reactionClick: () => void;
}

// 우노 게임 관련 타입들
export type UnoColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type UnoValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild_draw4';

export interface UnoCard {
  id: string;
  color: UnoColor;
  value: UnoValue;
}

export interface UnoGameState {
  deck: UnoCard[];
  discardPile: UnoCard[];
  players: UnoPlayerState[];
  currentPlayerIndex: number;
  direction: 1 | -1; // 1은 정방향, -1은 역방향
  drawCount: number; // 연속 드로우 카드 효과
  lastPlayedCard: UnoCard | null;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: string | null;
}

export interface UnoPlayerState {
  playerId: string;
  playerName: string;
  cards: UnoCard[];
  hasDeclaratedUno: boolean;
}

// 반응속도 게임 관련 타입들
export interface ReactionGameState {
  players: ReactionPlayerState[];
  currentRound: number;
  totalRounds: number;
  gameStatus: 'waiting' | 'ready' | 'go' | 'finished';
  roundResults: ReactionRoundResult[];
  finalResults: GameResult[];
}

export interface ReactionPlayerState {
  playerId: string;
  playerName: string;
  totalScore: number;
  hasClicked: boolean;
  reactionTime: number | null;
}

export interface ReactionRoundResult {
  round: number;
  results: {
    playerId: string;
    playerName: string;
    reactionTime: number;
    rank: number;
  }[];
}