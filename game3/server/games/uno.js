const { v4: uuidv4 } = require('uuid');

class UnoGame {
  constructor(players) {
    this.players = players.map(p => ({
      playerId: p.id,
      playerName: p.name,
      cards: [],
      hasDeclaratedUno: false
    }));
    
    this.deck = this.createDeck();
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = 1; // 1: 정방향, -1: 역방향
    this.drawCount = 0; // 연속 드로우 카드 효과
    this.lastPlayedCard = null;
    this.gameStatus = 'playing';
    this.winner = null;
    
    this.shuffleDeck();
    this.dealCards();
    this.startGame();
  }

  // 덱 생성
  createDeck() {
    const deck = [];
    const colors = ['red', 'blue', 'green', 'yellow'];
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const actions = ['skip', 'reverse', 'draw2'];
    
    // 숫자 카드 (0은 각 색깔마다 1장, 1-9는 각 색깔마다 2장)
    colors.forEach(color => {
      numbers.forEach(number => {
        const count = number === '0' ? 1 : 2;
        for (let i = 0; i < count; i++) {
          deck.push({
            id: uuidv4(),
            color: color,
            value: number
          });
        }
      });
      
      // 액션 카드 (각 색깔마다 2장씩)
      actions.forEach(action => {
        for (let i = 0; i < 2; i++) {
          deck.push({
            id: uuidv4(),
            color: color,
            value: action
          });
        }
      });
    });
    
    // 와일드 카드 (4장씩)
    for (let i = 0; i < 4; i++) {
      deck.push({
        id: uuidv4(),
        color: 'wild',
        value: 'wild'
      });
      
      deck.push({
        id: uuidv4(),
        color: 'wild',
        value: 'wild_draw4'
      });
    }
    
    return deck;
  }

  // 덱 셞플
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // 카드 배분
  dealCards() {
    // 각 플레이어에게 7장씩 배분
    for (let i = 0; i < 7; i++) {
      this.players.forEach(player => {
        if (this.deck.length > 0) {
          player.cards.push(this.deck.pop());
        }
      });
    }
    
    // 첫 번째 카드를 discard pile에 놓기 (와일드 카드가 아닐 때까지)
    let firstCard;
    do {
      if (this.deck.length === 0) {
        this.reshuffleDeck();
      }
      firstCard = this.deck.pop();
    } while (firstCard.color === 'wild');
    
    this.discardPile.push(firstCard);
    this.lastPlayedCard = firstCard;
  }

  // 게임 시작
  startGame() {
    // 첫 번째 카드가 액션 카드면 효과 적용
    if (this.lastPlayedCard) {
      this.applyCardEffect(this.lastPlayedCard, null, true);
    }
  }

  // 덱 재셞플 (discard pile 사용)
  reshuffleDeck() {
    if (this.discardPile.length <= 1) {
      throw new Error('게임을 계속할 수 없습니다. 카드가 부족합니다.');
    }
    
    // 마지막 카드를 제외하고 모든 카드를 덱으로 이동
    const lastCard = this.discardPile.pop();
    this.deck = [...this.discardPile];
    this.discardPile = [lastCard];
    
    // 와일드 카드 색상 초기화
    this.deck.forEach(card => {
      if (card.color === 'wild' || card.originalColor) {
        card.color = card.originalColor || 'wild';
        delete card.originalColor;
      }
    });
    
    this.shuffleDeck();
  }

  // 카드 플레이
  playCard(playerId, card) {
    const playerIndex = this.players.findIndex(p => p.playerId === playerId);
    if (playerIndex === -1) {
      throw new Error('플레이어를 찾을 수 없습니다.');
    }
    
    if (playerIndex !== this.currentPlayerIndex) {
      throw new Error('당신의 차례가 아닙니다.');
    }
    
    const player = this.players[playerIndex];
    const cardIndex = player.cards.findIndex(c => c.id === card.id);
    
    if (cardIndex === -1) {
      throw new Error('해당 카드를 가지고 있지 않습니다.');
    }
    
    // 카드 플레이 가능 여부 체크
    if (!this.canPlayCard(card)) {
      throw new Error('플레이할 수 없는 카드입니다.');
    }
    
    // 드로우 카드 효과 중인지 체크
    if (this.drawCount > 0 && !this.isDrawCard(card)) {
      throw new Error(`${this.drawCount}장을 뽑아야 합니다.`);
    }
    
    // 카드 플레이
    const playedCard = player.cards.splice(cardIndex, 1)[0];
    
    // 와일드 카드 색상 설정
    if (playedCard.value === 'wild' || playedCard.value === 'wild_draw4') {
      if (card.selectedColor) {
        playedCard.originalColor = playedCard.color;
        playedCard.color = card.selectedColor;
      } else {
        throw new Error('와일드 카드의 색상을 선택해야 합니다.');
      }
    }
    
    this.discardPile.push(playedCard);
    this.lastPlayedCard = playedCard;
    
    // 우노 체크 (카드가 1장 남았을 때 우노 선언했는지)
    if (player.cards.length === 1 && !player.hasDeclaratedUno) {
      // 우노 선언 안 했으면 페널티 (2장 드로우)
      this.drawCards(playerId, 2);
    }
    
    // 게임 종료 체크
    if (player.cards.length === 0) {
      return this.endGame(playerId);
    }
    
    // 카드 효과 적용
    this.applyCardEffect(playedCard, playerId);
    
    // 다음 플레이어로 턴 넘기기 (스킵 효과가 없으면)
    if (!this.skipNextPlayer) {
      this.nextPlayer();
    }
    this.skipNextPlayer = false;
    
    return {
      gameEnded: false,
      nextPlayer: this.players[this.currentPlayerIndex].playerId
    };
  }

  // 카드 플레이 가능 여부 체크
  canPlayCard(card) {
    if (!this.lastPlayedCard) return true;
    
    // 드로우 카드 효과 중이면 드로우 카드만 플레이 가능
    if (this.drawCount > 0) {
      return this.isDrawCard(card);
    }
    
    // 와일드 카드는 언제나 플레이 가능
    if (card.color === 'wild') {
      return true;
    }
    
    // 색상이나 숫자/액션이 같으면 플레이 가능
    return (
      card.color === this.lastPlayedCard.color ||
      card.value === this.lastPlayedCard.value
    );
  }

  // 드로우 카드인지 체크
  isDrawCard(card) {
    return card.value === 'draw2' || card.value === 'wild_draw4';
  }

  // 카드 효과 적용
  applyCardEffect(card, playerId, isGameStart = false) {
    switch (card.value) {
      case 'skip':
        this.skipNextPlayer = true;
        if (!isGameStart) {
          this.nextPlayer();
        }
        break;
        
      case 'reverse':
        this.direction *= -1;
        if (this.players.length === 2 && !isGameStart) {
          // 2명일 때는 스킵과 같은 효과
          this.skipNextPlayer = true;
          this.nextPlayer();
        }
        break;
        
      case 'draw2':
        this.drawCount += 2;
        if (isGameStart) {
          // 게임 시작 시에는 첫 번째 플레이어가 뽑음
          this.drawCards(this.players[this.currentPlayerIndex].playerId, this.drawCount);
          this.drawCount = 0;
          this.nextPlayer();
        }
        break;
        
      case 'wild_draw4':
        this.drawCount += 4;
        if (isGameStart) {
          this.drawCards(this.players[this.currentPlayerIndex].playerId, this.drawCount);
          this.drawCount = 0;
          this.nextPlayer();
        }
        break;
    }
  }

  // 다음 플레이어로 턴 넘기기
  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    
    // 드로우 카드 효과 처리
    if (this.drawCount > 0) {
      const currentPlayer = this.players[this.currentPlayerIndex];
      this.drawCards(currentPlayer.playerId, this.drawCount);
      this.drawCount = 0;
      this.nextPlayer(); // 드로우 후 턴 넘기기
    }
  }

  // 카드 뽑기
  drawCards(playerId, count) {
    const player = this.players.find(p => p.playerId === playerId);
    if (!player) {
      throw new Error('플레이어를 찾을 수 없습니다.');
    }
    
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        this.reshuffleDeck();
      }
      
      if (this.deck.length > 0) {
        player.cards.push(this.deck.pop());
      }
    }
    
    // 우노 선언 해제
    player.hasDeclaratedUno = false;
  }

  // 우노 선언
  declareUno(playerId) {
    const player = this.players.find(p => p.playerId === playerId);
    if (!player) {
      throw new Error('플레이어를 찾을 수 없습니다.');
    }
    
    if (player.cards.length !== 1) {
      throw new Error('카드가 1장일 때만 우노를 선언할 수 있습니다.');
    }
    
    player.hasDeclaratedUno = true;
  }

  // 게임 종료
  endGame(winnerId) {
    this.gameStatus = 'finished';
    this.winner = winnerId;
    
    // 점수 계산
    const results = this.players.map((player, index) => {
      let score = 0;
      
      // 승자가 아닌 경우 손에 남은 카드 점수 계산
      if (player.playerId !== winnerId) {
        player.cards.forEach(card => {
          switch (card.value) {
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
              score += parseInt(card.value);
              break;
            case 'skip': case 'reverse': case 'draw2':
              score += 20;
              break;
            case 'wild': case 'wild_draw4':
              score += 50;
              break;
          }
        });
      }
      
      return {
        playerId: player.playerId,
        playerName: player.playerName,
        score: score,
        rank: player.playerId === winnerId ? 1 : (index + 1)
      };
    });
    
    // 점수 순으로 정렬 (점수가 낮을수록 높은 순위)
    results.sort((a, b) => a.score - b.score);
    results.forEach((result, index) => {
      if (result.playerId !== winnerId) {
        result.rank = index + 2; // 승자 다음 순위부터
      }
    });
    
    return {
      gameEnded: true,
      results: results
    };
  }

  // 게임 상태 반환
  getState() {
    return {
      deck: this.deck.length, // 덱에 남은 카드 수만 반환
      discardPile: this.discardPile,
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      direction: this.direction,
      drawCount: this.drawCount,
      lastPlayedCard: this.lastPlayedCard,
      gameStatus: this.gameStatus,
      winner: this.winner
    };
  }

  // 클라이언트용 상태 반환 (플레이어별로 다른 정보)
  getClientState(playerId) {
    const playerIndex = this.players.findIndex(p => p.playerId === playerId);
    
    return {
      deckCount: this.deck.length,
      discardPile: this.discardPile,
      players: this.players.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        cardCount: p.cards.length,
        cards: p.playerId === playerId ? p.cards : [], // 자신의 카드만 전송
        hasDeclaratedUno: p.hasDeclaratedUno
      })),
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayerId: this.players[this.currentPlayerIndex].playerId,
      direction: this.direction,
      drawCount: this.drawCount,
      lastPlayedCard: this.lastPlayedCard,
      gameStatus: this.gameStatus,
      winner: this.winner
    };
  }
}

module.exports = UnoGame;