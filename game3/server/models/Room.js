class Room {
  constructor(id, name, maxPlayers = 4) {
    this.id = id;
    this.name = name;
    this.players = [];
    this.maxPlayers = maxPlayers;
    this.currentGame = null; // 'uno' | 'reaction' | null
    this.gameState = null; // 게임 객체
    this.createdAt = new Date();
  }

  // 플레이어 추가
  addPlayer(player) {
    if (this.players.length >= this.maxPlayers) {
      throw new Error('방이 가득 찼습니다.');
    }
    
    // 중복 이름 체크
    if (this.players.some(p => p.name === player.name)) {
      throw new Error('이미 존재하는 이름입니다.');
    }
    
    this.players.push(player);
  }

  // 플레이어 제거
  removePlayer(playerId) {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  // 플레이어 찾기
  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  // 게임 시작 가능 여부 체크
  canStartGame() {
    if (this.players.length < 2) return false;
    if (this.currentGame !== null) return false;
    
    // 호스트 제외 모든 플레이어가 준비 상태인지 체크
    const nonHostPlayers = this.players.filter(p => !p.isHost);
    return nonHostPlayers.every(p => p.isReady);
  }

  // JSON 변환 (클라이언트로 전송용)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady
      })),
      maxPlayers: this.maxPlayers,
      currentGame: this.currentGame,
      gameState: this.gameState ? this.gameState.getClientState() : null
    };
  }
}

module.exports = Room;