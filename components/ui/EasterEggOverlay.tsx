"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

type GameMode = "bot" | "versus";
type Direction = "up" | "down" | "left" | "right";
type PlayerId = "player1" | "player2";

type Position = {
  x: number;
  y: number;
};

type PlayerState = {
  id: PlayerId;
  position: Position;
  direction: Direction;
  trail: Position[];
  alive: boolean;
  control: "human" | "bot";
};

type GameSnapshot = {
  players: Record<PlayerId, PlayerState>;
  occupied: Set<string>;
  turns: number;
  mode: GameMode;
  level: number;
  tickRate: number;
};

type WinnerState =
  | { type: "player"; playerId: PlayerId }
  | { type: "draw" };

const KEY_SEQUENCE = ["t", "r", "o", "n"];
const KEY_SEQUENCE_TIMEOUT = 1600;

const GRID_COLS = 38;
const GRID_ROWS = 22;
const CELL_SIZE = 18;
const BOARD_WIDTH = GRID_COLS * CELL_SIZE;
const BOARD_HEIGHT = GRID_ROWS * CELL_SIZE;
const MAX_TURNS = GRID_COLS * GRID_ROWS;

const PLAYER_CONFIG = {
  player1: {
    color: "#00f7ff",
    glow: "rgba(0,247,255,0.45)",
    hint: "WASD",
  },
  player2: {
    color: "#ff295a",
    glow: "rgba(255,41,90,0.45)",
    hint: "Arrow Keys",
  },
} as const satisfies Record<PlayerId, { color: string; glow: string; hint: string }>;

const LOCAL_STORAGE_KEY = "tron-lightcycle-progress";

const computeTickRate = (level: number) => Math.max(60, 170 - level * 12);
const computeLevelScore = (level: number, turns: number, trailLength: number) => {
  const base = 420 + level * 180;
  const tempoBonus = Math.max(0, (MAX_TURNS - turns) * 4);
  const styleBonus = Math.round(trailLength * 2.5);
  return base + tempoBonus + styleBonus;
};

const directionVectors: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const turnLeft: Record<Direction, Direction> = {
  up: "left",
  down: "right",
  left: "down",
  right: "up",
};

const turnRight: Record<Direction, Direction> = {
  up: "right",
  down: "left",
  left: "up",
  right: "down",
};

const oppositeDirection: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const toKey = (position: Position): string => `${position.x},${position.y}`;

const isOpposite = (next: Direction, current: Direction) => oppositeDirection[current] === next;

const withinBounds = (position: Position) =>
  position.x >= 0 && position.x < GRID_COLS && position.y >= 0 && position.y < GRID_ROWS;

const defaultInputs: Record<PlayerId, Direction> = {
  player1: "right",
  player2: "left",
};

const createPlayers = (mode: GameMode): Record<PlayerId, PlayerState> => {
  const midpoint = Math.floor(GRID_ROWS / 2);
  return {
    player1: {
      id: "player1",
      position: { x: 5, y: midpoint },
      direction: "right",
      trail: [],
      alive: true,
      control: "human",
    },
    player2: {
      id: "player2",
      position: { x: GRID_COLS - 6, y: midpoint },
      direction: "left",
      trail: [],
      alive: true,
      control: mode === "bot" ? "bot" : "human",
    },
  };
};

const gsapSetDisplay = (element: HTMLElement | null, display: string) => {
  if (!element) return;
  gsap.set(element, { display });
};

const angleToOpponent = (self: Position, opponent: Position) =>
  Math.abs(self.x - opponent.x) + Math.abs(self.y - opponent.y);

const computeBotDirection = (state: GameSnapshot, bot: PlayerState): Direction => {
  const opponent = state.players.player1;
  const difficulty = Math.max(1, state.level);
  const candidates: Direction[] = [
    bot.direction,
    turnLeft[bot.direction],
    turnRight[bot.direction],
    oppositeDirection[bot.direction],
  ];

  const safeMoves = candidates
    .map((dir) => {
      const vector = directionVectors[dir];
      const next = { x: bot.position.x + vector.x, y: bot.position.y + vector.y };
      if (!withinBounds(next)) return null;
      if (state.occupied.has(toKey(next))) return null;

      const distance = angleToOpponent(next, opponent.position);
      let openness = 0;
      if (difficulty >= 2) {
        const appraisalDirections: Direction[] =
          difficulty >= 5 ? [dir, turnLeft[dir], turnRight[dir], oppositeDirection[dir]] : [dir, turnLeft[dir], turnRight[dir]];
        appraisalDirections.forEach((lookDir) => {
          const lookVector = directionVectors[lookDir];
          const lookCell = { x: next.x + lookVector.x, y: next.y + lookVector.y };
          if (withinBounds(lookCell) && !state.occupied.has(toKey(lookCell))) {
            openness += 1;
          }
        });
      }
      return { dir, distance, openness };
    })
    .filter(
      (entry): entry is { dir: Direction; distance: number; openness: number } => Boolean(entry),
    );

  if (!safeMoves.length) {
    return bot.direction;
  }

  safeMoves.sort((a, b) => {
    if (a.distance === b.distance && difficulty >= 3) {
      return b.openness - a.openness;
    }
    return a.distance - b.distance;
  });

  const randomness = Math.max(0.05, 0.5 - difficulty * 0.06);
  if (Math.random() < randomness) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)].dir;
  }

  return safeMoves[0].dir;
};

const buildHeadline = (
  winner: WinnerState | null,
  mode: GameMode | null,
  names: { player1: string; player2: string },
): string => {
  if (!winner) {
    return mode === "bot" ? `${names.player1} vs ${names.player2} — Awaiting Launch` : "Awaiting Launch Sequence";
  }
  if (winner.type === "draw") {
    return mode === "bot" ? "Gridlock — No Derezzing This Cycle" : "Stalemate on the Grid";
  }
  if (winner.playerId === "player1") {
    return mode === "bot" ? `${names.player1} Derezzes ${names.player2}` : `${names.player1} Dominates`;
  }
  return mode === "bot" ? `${names.player2} Outspeeds ${names.player1}` : `${names.player2} Dominates`;
};

const buildWinner = (players: Record<PlayerId, PlayerState>, turns: number): WinnerState => {
  const alivePlayers = Object.values(players).filter((player) => player.alive);
  if (alivePlayers.length === 0) {
    return { type: "draw" };
  }
  if (alivePlayers.length === 2 && turns >= MAX_TURNS) {
    return { type: "draw" };
  }
  return {
    type: "player",
    playerId: alivePlayers[0].id,
  };
};

const clearCanvas = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const drawState = (canvas: HTMLCanvasElement | null, state: GameSnapshot | null) => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(9, 11, 18, 0.96)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(120, 255, 214, 0.05)");
  gradient.addColorStop(1, "rgba(255, 110, 199, 0.05)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let x = 1; x < GRID_COLS; x += 1) {
    const px = x * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height);
    ctx.stroke();
  }
  for (let y = 1; y < GRID_ROWS; y += 1) {
    const py = y * CELL_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width, py);
    ctx.stroke();
  }

  if (!state) return;

  Object.values(state.players).forEach((player) => {
    const { color, glow } = PLAYER_CONFIG[player.id];

    ctx.fillStyle = glow;
    player.trail.forEach((cell) => {
      ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 28;
    ctx.fillRect(player.position.x * CELL_SIZE, player.position.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.shadowBlur = 0;
  });
};

const EasterEggOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [gameStatus, setGameStatus] = useState<"idle" | "menu" | "playing" | "ended">("idle");
  const [winner, setWinner] = useState<WinnerState | null>(null);
  const [playerName, setPlayerName] = useState("Player One");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [highestLevel, setHighestLevel] = useState(1);
  const [lastScoreDelta, setLastScoreDelta] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [versusLevelSelect, setVersusLevelSelect] = useState(1);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [touchControlsEnabled, setTouchControlsEnabled] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const playerNameRef = useRef("Player One");
  const storageReadyRef = useRef(false);

  const overlayTimelineRef = useRef<gsap.core.Tween | null>(null);
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const inputRef = useRef<Record<PlayerId, Direction>>({ ...defaultInputs });
  const gameStateRef = useRef<GameSnapshot | null>(null);
  const gameModeRef = useRef<GameMode | null>(null);

  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  }, []);

  const handleVersusLevelChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    setVersusLevelSelect(Number.isNaN(nextValue) ? 1 : Math.max(1, Math.min(10, nextValue)));
  }, []);

  const queueLeaderboardSync = useCallback(
    (payload: { player: string; score: number; level: number }) => {
      // TODO : Integrate with leaderboard service.
      void payload;
    },
    [],
  );

  const handleTouchInput = useCallback((direction: Direction) => {
    inputRef.current.player1 = direction;
  }, []);

  useEffect(() => {
    const trimmed = playerName.trim();
    playerNameRef.current = trimmed.length > 0 ? trimmed : "Player One";
  }, [playerName]);

  useEffect(() => {
    setHighScore((prev) => (score > prev ? score : prev));
  }, [score]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setTouchControlsEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (storageReadyRef.current) return;

    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{ score: number; level: number; player: string }>;
        if (typeof parsed.score === "number") {
          setHighScore(parsed.score);
        }
        if (typeof parsed.level === "number") {
          setHighestLevel(Math.max(1, parsed.level));
        }
        if (typeof parsed.player === "string" && parsed.player.trim().length > 0) {
          setPlayerName(parsed.player);
        }
      }
    } catch {
      // Ignore malformed storage entries.
    } finally {
      storageReadyRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!storageReadyRef.current || typeof window === "undefined") return;
    try {
      const payload = {
        score: highScore,
        level: highestLevel,
        player: playerNameRef.current,
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      queueLeaderboardSync(payload);
    } catch {
      // Silently ignore storage quota errors.
    }
  }, [highScore, highestLevel, queueLeaderboardSync]);

  const openOverlay = useCallback(() => {
    if (isOpen) return;
    setIsOpen(true);
    setGameStatus("menu");
    setWinner(null);
    inputRef.current = { ...defaultInputs };
  }, [isOpen]);

  useEffect(() => {
    window.showTronOverlay = openOverlay;
    return () => {
      if (window.showTronOverlay === openOverlay) {
        delete window.showTronOverlay;
      }
    };
  }, [openOverlay]);

  const stopLoop = useCallback(() => {
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
  }, []);

  const resetGame = useCallback(() => {
    stopLoop();
    gameStateRef.current = null;
    gameModeRef.current = null;
    setWinner(null);
    setActiveMode(null);
    setActiveLevel(null);
    setLastScoreDelta(null);
    clearCanvas(canvasRef.current);
  }, [stopLoop]);

  const closeOverlay = useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    setGameStatus("idle");
    resetGame();
  }, [isOpen, resetGame]);

  const advanceGame = useCallback(() => {
    const snapshot = gameStateRef.current;
    if (!snapshot) return;

    const { players, occupied } = snapshot;

    const plannedMoves: Record<
      PlayerId,
      {
        nextPosition: Position;
        nextDirection: Direction;
        willCollide: boolean;
      }
    > = {
      player1: {
        nextPosition: players.player1.position,
        nextDirection: players.player1.direction,
        willCollide: false,
      },
      player2: {
        nextPosition: players.player2.position,
        nextDirection: players.player2.direction,
        willCollide: false,
      },
    };

    (Object.keys(players) as PlayerId[]).forEach((playerId) => {
      const player = players[playerId];
      if (!player.alive) return;

      let nextDirection = player.direction;
      if (player.control === "human") {
        const desired = inputRef.current[playerId];
        if (desired && !isOpposite(desired, player.direction)) {
          nextDirection = desired;
        }
      } else {
        nextDirection = computeBotDirection(snapshot, player);
      }

      const vector = directionVectors[nextDirection];
      const nextPosition = { x: player.position.x + vector.x, y: player.position.y + vector.y };
      const willCollide = !withinBounds(nextPosition) || occupied.has(toKey(nextPosition));

      plannedMoves[playerId] = {
        nextDirection,
        nextPosition,
        willCollide,
      };
    });

    const headOnCollision =
      players.player1.alive &&
      players.player2.alive &&
      plannedMoves.player1.nextPosition.x === plannedMoves.player2.nextPosition.x &&
      plannedMoves.player1.nextPosition.y === plannedMoves.player2.nextPosition.y;

    (Object.keys(players) as PlayerId[]).forEach((playerId) => {
      const player = players[playerId];
      if (!player.alive) return;

      const { nextDirection, nextPosition, willCollide } = plannedMoves[playerId];
      const collided = willCollide || headOnCollision;

      if (collided) {
        player.alive = false;
        return;
      }

      player.trail.push({ ...player.position });
      player.position = nextPosition;
      player.direction = nextDirection;
      occupied.add(toKey(nextPosition));
    });

    snapshot.turns += 1;

    const alivePlayers = Object.values(players).filter((player) => player.alive).length;
    const maxTurnsReached = snapshot.turns >= MAX_TURNS;

    if (alivePlayers <= 1 || maxTurnsReached) {
      stopLoop();
      setGameStatus("ended");
      const result = buildWinner(players, snapshot.turns);
      setWinner(result);

      if (snapshot.mode === "bot") {
        const playedLevel = snapshot.level;
        setActiveLevel(playedLevel);

        if (result.type === "player" && result.playerId === "player1") {
          setHighestLevel((prev) => Math.max(prev, playedLevel));
          const delta = computeLevelScore(playedLevel, snapshot.turns, players.player1.trail.length);
          setScore((prev) => prev + delta);
          setLastScoreDelta(delta);
          setLevel((prev) => Math.max(prev, playedLevel + 1));
        } else {
          setScore(0);
          setLevel(1);
          setActiveLevel(1);
          setLastScoreDelta(null);
        }
      }
    }

    drawState(canvasRef.current, gameStateRef.current);
  }, [stopLoop]);

  const startLoop = useCallback(
    (rate: number) => {
      stopLoop();
      loopRef.current = setInterval(advanceGame, rate);
    },
    [advanceGame, stopLoop],
  );

  const startGame = useCallback(
    (mode: GameMode, levelOverride?: number) => {
      const resolvedLevel =
        mode === "bot"
          ? Math.max(1, levelOverride ?? level)
          : Math.max(1, Math.min(10, levelOverride ?? versusLevelSelect));
      const tickRate = computeTickRate(resolvedLevel);

      setGameStatus("playing");
      setWinner(null);
      setActiveMode(mode);
      if (mode === "bot") {
        setActiveLevel(resolvedLevel);
        if (levelOverride === undefined) {
          setLastScoreDelta(null);
        }
      } else {
        setActiveLevel(resolvedLevel);
        setLastScoreDelta(null);
      }

      inputRef.current = { ...defaultInputs };

      const players = createPlayers(mode);
      const occupied = new Set<string>([
        toKey(players.player1.position),
        toKey(players.player2.position),
      ]);

      gameStateRef.current = {
        players,
        occupied,
        turns: 0,
        mode,
        level: resolvedLevel,
        tickRate,
      };
      gameModeRef.current = mode;

      drawState(canvasRef.current, gameStateRef.current);
      startLoop(tickRate);
    },
    [level, startLoop, versusLevelSelect],
  );

  const handleRematch = useCallback(() => {
    if (!gameModeRef.current) return;
    const snapshotLevel = gameStateRef.current?.level ?? activeLevel ?? (gameModeRef.current === "bot" ? level : versusLevelSelect);
    startGame(gameModeRef.current, snapshotLevel);
  }, [activeLevel, level, startGame, versusLevelSelect]);

  const returnToMenu = useCallback(() => {
    resetGame();
    setGameStatus("menu");
    setActiveMode(null);
    setActiveLevel(null);
  }, [resetGame]);

  useEffect(() => {
    const buffer: string[] = [];
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }

      const key = event.key.toLowerCase();

      buffer.push(key);
      if (buffer.length > KEY_SEQUENCE.length) {
        buffer.shift();
      }

      if (KEY_SEQUENCE.every((expected, index) => buffer[index] === expected)) {
        buffer.length = 0;
        if (!isOpen) {
          openOverlay();
        }
      }

      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        buffer.length = 0;
      }, KEY_SEQUENCE_TIMEOUT);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isOpen, openOverlay]);

  useEffect(() => {
    const { body } = document;
    if (isOpen) {
      body.classList.add("tron-overlay-open");
    } else {
      body.classList.remove("tron-overlay-open");
    }
    return () => {
      body.classList.remove("tron-overlay-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameStatus !== "playing") return;

      const mappings: Record<string, Direction | undefined> = {
        w: "up",
        s: "down",
        a: "left",
        d: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const direction = mappings[event.key];
      if (!direction) return;

      if (["w", "a", "s", "d"].includes(event.key)) {
        inputRef.current.player1 = direction;
      } else {
      if (gameModeRef.current === "versus") {
        inputRef.current.player2 = direction;
      } else {
        inputRef.current.player1 = direction;
      }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStatus]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    overlayTimelineRef.current?.kill();
    if (isOpen) {
      gsapSetDisplay(overlay, "flex");
      overlayTimelineRef.current = gsap.to(overlay, {
        autoAlpha: 1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          if (headlineRef.current) {
            gsap.fromTo(
              headlineRef.current,
              { yPercent: 20, autoAlpha: 0 },
              { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", delay: 0.1 },
            );
          }
        },
      });
    } else {
      overlayTimelineRef.current = gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => gsapSetDisplay(overlay, "none"),
      });
    }

    return () => {
      overlayTimelineRef.current?.kill();
      overlayTimelineRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  useEffect(() => {
    if (isOpen && gameStatus === "menu") {
      drawState(canvasRef.current, null);
    }
  }, [gameStatus, isOpen]);

  const displayMode = activeMode ?? gameModeRef.current ?? "bot";
  const safePlayerName = useMemo(() => {
    const trimmed = playerName.trim();
    return trimmed.length > 0 ? trimmed : "Player One";
  }, [playerName]);

  const opponentName = useMemo(() => (displayMode === "bot" ? "Tim" : "Player Two"), [displayMode]);

  const headline = useMemo(
    () => buildHeadline(winner, displayMode ?? null, { player1: safePlayerName, player2: opponentName }),
    [winner, displayMode, safePlayerName, opponentName],
  );

  const scoreDeltaLabel = useMemo(() => {
    if (lastScoreDelta === null) return null;
    return `${lastScoreDelta >= 0 ? "+" : ""}${lastScoreDelta}`;
  }, [lastScoreDelta]);

  const formattedScore = useMemo(() => score.toLocaleString(), [score]);
  const formattedHighScore = useMemo(() => Math.max(highScore, score).toLocaleString(), [highScore, score]);
  const currentAttemptLevel = activeLevel ?? highestLevel;

  const playerDescriptors = useMemo(
    () => ({
      player1: { name: safePlayerName, hint: PLAYER_CONFIG.player1.hint },
      player2: {
        name: opponentName,
        hint: displayMode === "bot" ? "AI" : PLAYER_CONFIG.player2.hint,
      },
    }),
    [displayMode, opponentName, safePlayerName],
  );

  const isBotMode = displayMode === "bot";
  const lostToTim = isBotMode && winner?.type === "player" && winner.playerId === "player2";
  const drawWithTim = isBotMode && winner?.type === "draw";
  const replayLevelTarget = lostToTim || drawWithTim ? 1 : currentAttemptLevel;
  const replayLabel = lostToTim || drawWithTim ? "Restart Level 1" : `Replay Level ${replayLevelTarget}`;
  const scoreDeltaClass =
    scoreDeltaLabel === null ? "" : lastScoreDelta !== null && lastScoreDelta >= 0 ? "is-positive" : "is-negative";
  const canAdvanceLevel =
    gameStatus === "ended" && isBotMode && winner?.type === "player" && winner.playerId === "player1";

  const resultTitle = useMemo(() => {
    if (!winner) return null;
    if (winner.type === "draw") {
      return "Grid Draw";
    }
    if (winner.playerId === "player1") {
      return isBotMode ? `${safePlayerName} Levels Up` : `${safePlayerName} Victory`;
    }
    const opponent = opponentName;
    return isBotMode ? `${opponent} Prevails` : `${opponent} Victory`;
  }, [isBotMode, opponentName, safePlayerName, winner]);

  const resultCopy = useMemo(() => {
    if (!winner) return null;
    if (winner.type === "draw") {
      return "No victor this cycle. Run it back?";
    }
    if (!isBotMode) {
      return "Swap pilots or launch another round.";
    }
    if (winner.playerId === "player1") {
      const deltaText = scoreDeltaLabel ? `Score ${scoreDeltaLabel}. ` : "";
      return `${deltaText}${safePlayerName} edges ahead. High score ${formattedHighScore}. Tim's adapting.`;
    }
    return "Tim grabbed the lead. Reset your lines and reclaim the grid.";
  }, [formattedHighScore, isBotMode, safePlayerName, scoreDeltaLabel, winner]);

  const defaultStatusCopy = useMemo(() => {
    if (gameStatus === "menu") {
      return isBotMode
        ? `Tim is scanning the grid. Highest level cleared: ${highestLevel}.`
        : "Select a mode to deploy your lightcycle and rule the grid.";
    }
    if (isBotMode) {
      const levelLabel = activeLevel ?? highestLevel;
      return `Level ${levelLabel}: WASD to steer. Derezz Tim before he boxes you in.`;
    }
    return "Dual pilots: WASD vs Arrow keys. Last cycle standing wins.";
  }, [activeLevel, gameStatus, highestLevel, isBotMode]);

  const statusCopy = winner ? resultCopy ?? defaultStatusCopy : defaultStatusCopy;

  return (
    <div ref={overlayRef} className="tron-arcade" aria-hidden={!isOpen}>
      {/* <div
        className={`tron-arcade__grid${touchControlsEnabled && gameStatus !== "playing" ? " tron-arcade__grid--hidden" : ""}`}
        aria-hidden={touchControlsEnabled && gameStatus !== "playing"}
      /> */}
      <div className="tron-arcade__glow" />
      <div className="tron-arcade__shell">
        <header className="tron-arcade__header">
          <span className="tron-arcade__tag">LIGHTCYCLE PROTOCOL</span>
          <div className="tron-arcade__divider" />
          <button type="button" className="tron-arcade__close" onClick={closeOverlay}>
            Close
          </button>
        </header>

        <div className="tron-arcade__stage">
          <aside className="tron-arcade__panel">
            <div className="tron-arcade__status">
              <p className="tron-arcade__status-label">Grid Status</p>
              <h2 ref={headlineRef} className="tron-arcade__headline">
                {headline}
              </h2>
              <p className="tron-arcade__subhead">{statusCopy}</p>
            </div>

            {((touchControlsEnabled && gameStatus !== "playing") || !touchControlsEnabled) && (
              <div className="tron-arcade__form">
                <label htmlFor="tron-player-name" className="tron-arcade__form-label">
                  Pilot Handle
                </label>
                <input
                  id="tron-player-name"
                  className="tron-arcade__input"
                  value={playerName}
                  onChange={handleNameChange}
                  maxLength={18}
                  placeholder="Enter your call sign"
                  autoComplete="off"
                />
              </div>
            )}
            
            {((touchControlsEnabled && gameStatus !== "playing") || !touchControlsEnabled) && (
              <div className="tron-arcade__players">
                {(Object.keys(PLAYER_CONFIG) as PlayerId[]).map((id) => (
                  <div key={id} className="tron-arcade__player">
                    <span className="tron-arcade__player-swatch" data-player={id} />
                    <div className="tron-arcade__player-copy">
                      <span className="tron-arcade__player-label">{playerDescriptors[id].name}</span>
                      <span className="tron-arcade__player-hint">{playerDescriptors[id].hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isBotMode && !(touchControlsEnabled && gameStatus === "playing") && (
              <div className="tron-arcade__metrics">
                <div className="tron-arcade__metric">
                  <span className="tron-arcade__metric-label">Score</span>
                  <span className="tron-arcade__metric-value">{formattedScore}</span>
                  {scoreDeltaLabel && (
                    <span className={`tron-arcade__metric-delta ${scoreDeltaClass}`.trim()}>{scoreDeltaLabel}</span>
                  )}
                </div>
                <div className="tron-arcade__metric">
                  <span className="tron-arcade__metric-label">Current Level</span>
                  <span className="tron-arcade__metric-value">{currentAttemptLevel}</span>
                </div>
                <div className="tron-arcade__metric">
                  <span className="tron-arcade__metric-label">High Score</span>
                  <span className="tron-arcade__metric-value">{formattedHighScore}</span>
                </div>
                <div className="tron-arcade__metric">
                  <span className="tron-arcade__metric-label">Highest Level</span>
                  <span className="tron-arcade__metric-value">{highestLevel}</span>
                </div>
              </div>
            )}

            <div className="tron-arcade__actions">
              {gameStatus === "menu" && (
                <>
                  <button type="button" className="tron-arcade__button" onClick={() => startGame("bot")}>
                    VS Tim (AI)
                  </button>
                  {!touchControlsEnabled && (
                      <div className="tron-arcade__level-control">
                        <label htmlFor="tron-versus-level" className="tron-arcade__form-label">
                          Dual Pilot Difficulty
                        </label>
                        <div className="tron-arcade__level-control-row">
                          <input
                            id="tron-versus-level"
                            type="range"
                            min={1}
                            max={10}
                            step={1}
                            value={versusLevelSelect}
                            onChange={handleVersusLevelChange}
                            className="tron-arcade__slider"
                          />
                          <span className="tron-arcade__level-indicator">Level {versusLevelSelect}</span>
                        </div>
                      </div>
                    )}
                    {!touchControlsEnabled && (
                      <button
                        type="button"
                        className="tron-arcade__button tron-arcade__button--outline"
                        onClick={() => startGame("versus", versusLevelSelect)}
                      >
                        Dual Pilot (WASD + Arrows)
                      </button>
                  )}
                </>
              )}

              {gameStatus === "ended" && (
                <>
                  {isBotMode && (
                    <>
                      <button
                        type="button"
                        className="tron-arcade__button"
                        onClick={() => startGame("bot", replayLevelTarget)}
                      >
                        {replayLabel}
                      </button>
                      {canAdvanceLevel && (
                        <button
                          type="button"
                          className="tron-arcade__button tron-arcade__button--accent"
                          onClick={() => startGame("bot")}
                        >
                          Advance Difficulty
                        </button>
                      )}
                    </>
                  )}
                  {!isBotMode && (
                    <button
                      type="button"
                      className="tron-arcade__button"
                      onClick={handleRematch}
                    >
                      Rematch
                    </button>
                  )}
                  <button
                    type="button"
                    className="tron-arcade__button tron-arcade__button--outline"
                    onClick={returnToMenu}
                  >
                    Back to Mode Select
                  </button>
                </>
              )}

              {gameStatus === "playing" && isBotMode && (
                <span className="tron-arcade__hint">Level {currentAttemptLevel} — Tim adapts each cycle.</span>
              )}
            </div>

            {touchControlsEnabled && gameStatus === "playing" && (
              <div className="tron-arcade__touch-controls" role="group" aria-label="Touch controls">
                <div className="tron-arcade__touch-grid">
                  <button
                    type="button"
                    className="tron-arcade__touch-button tron-arcade__touch-button--up"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      handleTouchInput("up");
                    }}
                    onClick={() => handleTouchInput("up")}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <div className="tron-arcade__touch-row">
                    <button
                      type="button"
                      className="tron-arcade__touch-button"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        handleTouchInput("left");
                      }}
                      onClick={() => handleTouchInput("left")}
                      aria-label="Move left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="tron-arcade__touch-button"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        handleTouchInput("down");
                      }}
                      onClick={() => handleTouchInput("down")}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="tron-arcade__touch-button"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        handleTouchInput("right");
                      }}
                      onClick={() => handleTouchInput("right")}
                      aria-label="Move right"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {((touchControlsEnabled && gameStatus !== "playing") || !touchControlsEnabled) && (
              <div className="tron-arcade__legend">
                <p>
                  Hold steady: trails are lethal on contact. Keep to the vector, claim the grid, and
                  derez anything in your path.
                </p>
              </div>
            )}
          </aside>

            {((touchControlsEnabled && gameStatus === "playing") || !touchControlsEnabled) && (
            <div className="tron-arcade__board">
              <canvas ref={canvasRef} width={BOARD_WIDTH} height={BOARD_HEIGHT} />
              {gameStatus === "menu" && (
                <div className="tron-arcade__overlay">
                  <p className="tron-arcade__overlay-title">Select Mode</p>
                  <p className="tron-arcade__overlay-copy">
                    Deploy solo against Tim’s lightcycle AI, or run dual pilots with shared controls.
                  </p>
                </div>
              )}

              {gameStatus === "ended" && winner && (
                <div className="tron-arcade__overlay tron-arcade__overlay--result">
                  <p className="tron-arcade__overlay-title">{resultTitle ?? "Grid Update"}</p>
                  <p className="tron-arcade__overlay-copy">{resultCopy ?? "Re-initialize your lightcycle to continue."}</p>
                </div>
              )}
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EasterEggOverlay;
