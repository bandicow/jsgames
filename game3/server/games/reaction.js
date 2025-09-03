class ReactionGame {
  constructor(players) {
    this.players = players.map(p => ({
      playerId: p.id,
      playerName: p.name,
      totalScore: 0,
      hasClicked: false,
      reactionTime: null
    }));
    
    this.currentRound = 0;
    this.totalRounds = 5;
    this.gameStatus = 'waiting'; // 'waiting' | 'ready' | 'go' | 'finished'
    this.roundResults = [];
    this.finalResults = [];
    this.startTime = null;
    this.readyTimeout = null;
    this.goTimeout = null;
    
    // 게임 시작
    this.startNextRound();
  }

  // 다음 라운드 시작
  startNextRound() {
    if (this.currentRound >= this.totalRounds) {
      this.endGame();
      return { gameEnded: true, results: this.finalResults };
    }
    
    this.currentRound++;
    this.gameStatus = 'waiting';
    
    // 플레이어 상태 초기화
    this.players.forEach(player => {
      player.hasClicked = false;
      player.reactionTime = null;
    });
    
    // 준비 단계 (2-5초 랜덤 대기)
    const readyDelay = Math.random() * 3000 + 2000; // 2-5초
    
    this.gameStatus = 'ready';
    this.readyTimeout = setTimeout(() => {
      this.gameStatus = 'go';
      this.startTime = Date.now();
      
      // 15초 후 강제 라운드 종료
      this.goTimeout = setTimeout(() => {
        this.endRound();
      }, 15000);
      
    }, readyDelay);
    
    return { gameEnded: false };
  }

  // 플레이어 클릭 처리
  playerClick(playerId) {
    const player = this.players.find(p => p.playerId === playerId);
    
    if (!player) {
      throw new Error('플레이어를 찾을 수 없습니다.');
    }
    
    if (player.hasClicked) {
      throw new Error('이미 클릭했습니다.');
    }
    
    let reactionTime = null;
    let roundEnded = false;
    
    if (this.gameStatus === 'ready') {
      // 너무 빨리 클릭 (페널티)
      reactionTime = -1;
      player.hasClicked = true;
      player.reactionTime = reactionTime;
    } else if (this.gameStatus === 'go' && this.startTime) {
      // 정상 클릭
      reactionTime = Date.now() - this.startTime;
      player.hasClicked = true;
      player.reactionTime = reactionTime;
      
      // 모든 플레이어가 클릭했는지 확인
      if (this.players.every(p => p.hasClicked)) {
        roundEnded = true;
        this.endRound();
      }
    } else {
      throw new Error('클릭할 수 없는 상태입니다.');
    }
    
    return { reactionTime, roundEnded };
  }

  // 라운드 종료
  endRound() {
    if (this.readyTimeout) {
      clearTimeout(this.readyTimeout);
      this.readyTimeout = null;
    }
    
    if (this.goTimeout) {
      clearTimeout(this.goTimeout);
      this.goTimeout = null;
    }
    
    // 점수 계산
    const validPlayers = this.players.filter(p => p.reactionTime > 0);
    validPlayers.sort((a, b) => a.reactionTime - b.reactionTime);
    
    const roundResult = {
      round: this.currentRound,
      results: []
    };
    
    // 순위별 점수 부여
    validPlayers.forEach((player, index) => {
      const rank = index + 1;
      let points;
      
      switch (rank) {
        case 1: points = 10; break;
        case 2: points = 7; break;
        case 3: points = 5; break;
        case 4: points = 3; break;
        default: points = 1; break;
      }
      
      player.totalScore += points;
      
      roundResult.results.push({
        playerId: player.playerId,
        playerName: player.playerName,
        reactionTime: player.reactionTime,
        rank: rank,
        points: points
      });
    });
    
    // 페널티 플레이어들 추가 (너무 빨리 클릭하거나 클릭하지 않음)
    this.players.forEach(player => {
      if (!validPlayers.includes(player)) {
        roundResult.results.push({
          playerId: player.playerId,
          playerName: player.playerName,
          reactionTime: player.reactionTime || 999999, // 클릭하지 않음
          rank: validPlayers.length + 1,
          points: 0
        });
      }
    });
    
    this.roundResults.push(roundResult);
  }

  // 다음 라운드로 진행
  nextRound() {
    return this.startNextRound();
  }

  // 게임 종료
  endGame() {
    this.gameStatus = 'finished';
    
    // 최종 결과 계산
    const sortedPlayers = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
    
    this.finalResults = sortedPlayers.map((player, index) => ({
      playerId: player.playerId,
      playerName: player.playerName,
      score: player.totalScore,
      rank: index + 1
    }));
  }

  // 게임 상태 반환 (전체)
  getState() {
    return {
      players: this.players,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      gameStatus: this.gameStatus,
      roundResults: this.roundResults,
      finalResults: this.finalResults,
      startTime: this.startTime
    };
  }

  // 클라이언트용 상태 반환 (민감한 정보 제외)
  getClientState() {
    return {
      players: this.players.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        totalScore: p.totalScore,
        hasClicked: p.hasClicked,
        reactionTime: p.reactionTime
      })),
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      gameStatus: this.gameStatus,
      roundResults: this.roundResults,
      finalResults: this.finalResults
    };
  }
}

module.exports = ReactionGame;