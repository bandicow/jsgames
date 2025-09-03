const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const Room = require('./models/Room');
const UnoGame = require('./games/uno');
const ReactionGame = require('./games/reaction');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // 개발 환경에서는 모든 로컬 네트워크 접속 허용
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ];
      
      // 로컬 네트워크 IP 패턴 허용 (192.168.x.x:3000)
      const localNetworkPattern = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/;
      
      // origin이 없는 경우 (모바일 앱 등) 또는 허용된 origin인 경우
      if (!origin || 
          allowedOrigins.includes(origin) || 
          localNetworkPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS 정책에 의해 차단됨'), false);
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 전역 상태
const rooms = new Map(); // roomId -> Room 객체
const playerToRoom = new Map(); // socketId -> roomId

// Socket.io 연결 처리
io.on('connection', (socket) => {
  console.log(`클라이언트 연결됨: ${socket.id}`);

  // 방 생성
  socket.on('createRoom', (roomName, playerName) => {
    try {
      const roomId = uuidv4();
      const room = new Room(roomId, roomName);
      
      const player = {
        id: socket.id,
        name: playerName,
        isHost: true,
        isReady: false
      };
      
      room.addPlayer(player);
      rooms.set(roomId, room);
      playerToRoom.set(socket.id, roomId);
      
      socket.join(roomId);
      socket.emit('roomCreated', room.toJSON());
      
      console.log(`방 생성됨: ${roomName} (${roomId}), 호스트: ${playerName}`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // 방 참가
  socket.on('joinRoom', (roomId, playerName) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        throw new Error('존재하지 않는 방입니다.');
      }
      
      if (room.players.length >= room.maxPlayers) {
        throw new Error('방이 가득 찼습니다.');
      }
      
      const player = {
        id: socket.id,
        name: playerName,
        isHost: false,
        isReady: false
      };
      
      room.addPlayer(player);
      playerToRoom.set(socket.id, roomId);
      
      socket.join(roomId);
      socket.emit('roomJoined', room.toJSON());
      socket.to(roomId).emit('playerJoined', player);
      
      console.log(`플레이어 참가: ${playerName} -> ${room.name}`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // 준비 상태 토글
  socket.on('toggleReady', () => {
    try {
      const roomId = playerToRoom.get(socket.id);
      const room = rooms.get(roomId);
      
      if (!room) {
        throw new Error('방을 찾을 수 없습니다.');
      }
      
      const player = room.getPlayer(socket.id);
      if (!player) {
        throw new Error('플레이어를 찾을 수 없습니다.');
      }
      
      player.isReady = !player.isReady;
      
      io.to(roomId).emit('playerReady', player.id, player.isReady);
      console.log(`플레이어 준비 상태 변경: ${player.name} - ${player.isReady ? '준비' : '준비 해제'}`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // 게임 시작
  socket.on('startGame', (gameType) => {
    try {
      const roomId = playerToRoom.get(socket.id);
      const room = rooms.get(roomId);
      
      if (!room) {
        throw new Error('방을 찾을 수 없습니다.');
      }
      
      const player = room.getPlayer(socket.id);
      if (!player || !player.isHost) {
        throw new Error('호스트만 게임을 시작할 수 있습니다.');
      }
      
      const allReady = room.players.every(p => p.isReady || p.isHost);
      if (!allReady) {
        throw new Error('모든 플레이어가 준비 상태가 아닙니다.');
      }
      
      if (room.players.length < 2) {
        throw new Error('최소 2명의 플레이어가 필요합니다.');
      }
      
      // 게임 객체 생성
      let game;
      if (gameType === 'uno') {
        game = new UnoGame(room.players.map(p => ({ id: p.id, name: p.name })));
      } else if (gameType === 'reaction') {
        game = new ReactionGame(room.players.map(p => ({ id: p.id, name: p.name })));
      } else {
        throw new Error('알 수 없는 게임 타입입니다.');
      }
      
      room.currentGame = gameType;
      room.gameState = game;
      
      io.to(roomId).emit('gameStarted', gameType);
      io.to(roomId).emit('gameStateChanged', game.getState());
      
      console.log(`게임 시작: ${gameType} in ${room.name}`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // 우노 카드 플레이
  socket.on('playUnoCard', (card) => {
    try {
      const roomId = playerToRoom.get(socket.id);
      const room = rooms.get(roomId);
      
      if (!room || !room.gameState || room.currentGame !== 'uno') {
        throw new Error('우노 게임이 진행 중이 아닙니다.');
      }
      
      const result = room.gameState.playCard(socket.id, card);
      
      io.to(roomId).emit('unoCardPlayed', socket.id, card);
      io.to(roomId).emit('gameStateChanged', room.gameState.getState());
      
      if (result.nextPlayer) {
        io.to(roomId).emit('unoTurnChanged', result.nextPlayer);
      }
      
      if (result.gameEnded) {
        io.to(roomId).emit('gameEnded', result.results);
        room.currentGame = null;
        room.gameState = null;
      }
      
      console.log(`우노 카드 플레이: ${socket.id} - ${card.color} ${card.value}`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // 우노 선언
  socket.on('declareUno', () => {
    try {
      const roomId = playerToRoom.get(socket.id);
      const room = rooms.get(roomId);
      
      if (!room || !room.gameState || room.currentGame !== 'uno') {
        throw new Error('우노 게임이 진행 중이 아닙니다.');
      }
      
      room.gameState.declareUno(socket.id);
      io.to(roomId).emit('unoPlayerDeclaration', socket.id);
      io.to(roomId).emit('gameStateChanged', room.gameState.getState());
      
      console.log(`우노 선언: ${socket.id}`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // 반응속도 게임 클릭
  socket.on('reactionClick', () => {
    try {
      const roomId = playerToRoom.get(socket.id);
      const room = rooms.get(roomId);
      
      if (!room || !room.gameState || room.currentGame !== 'reaction') {
        throw new Error('반응속도 게임이 진행 중이 아닙니다.');
      }
      
      const result = room.gameState.playerClick(socket.id);
      
      if (result.reactionTime !== null) {
        io.to(roomId).emit('reactionPlayerClicked', socket.id, result.reactionTime);
        io.to(roomId).emit('gameStateChanged', room.gameState.getState());
        
        if (result.roundEnded) {
          // 라운드 종료 처리
          setTimeout(() => {
            const gameResult = room.gameState.nextRound();
            io.to(roomId).emit('gameStateChanged', room.gameState.getState());
            
            if (gameResult.gameEnded) {
              io.to(roomId).emit('gameEnded', gameResult.results);
              room.currentGame = null;
              room.gameState = null;
            }
          }, 3000); // 3초 후 다음 라운드
        }
      }
      
      console.log(`반응속도 클릭: ${socket.id} - ${result.reactionTime}ms`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // 방 나가기
  socket.on('leaveRoom', () => {
    handlePlayerLeave(socket.id);
  });

  // 연결 끊김
  socket.on('disconnect', () => {
    console.log(`클라이언트 연결 끊김: ${socket.id}`);
    handlePlayerLeave(socket.id);
  });

  // 플레이어 떠나기 처리
  function handlePlayerLeave(playerId) {
    const roomId = playerToRoom.get(playerId);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        const player = room.getPlayer(playerId);
        room.removePlayer(playerId);
        
        if (room.players.length === 0) {
          // 방이 비었으면 삭제
          rooms.delete(roomId);
          console.log(`빈 방 삭제: ${room.name}`);
        } else {
          // 호스트가 나갔으면 다음 플레이어를 호스트로 지정
          if (player && player.isHost && room.players.length > 0) {
            room.players[0].isHost = true;
          }
          
          // 게임 중이면 게임 종료
          if (room.currentGame) {
            io.to(roomId).emit('gameEnded', []);
            room.currentGame = null;
            room.gameState = null;
          }
          
          io.to(roomId).emit('playerLeft', playerId);
        }
      }
      
      playerToRoom.delete(playerId);
    }
  }
});

// 서버 상태 엔드포인트
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    rooms: rooms.size,
    players: playerToRoom.size
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`🌐 로컬 네트워크: http://[IP 주소]:${PORT}`);
});