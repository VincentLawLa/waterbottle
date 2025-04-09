import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";

const COLORS = {
  RED: "#ff5555",
  BLUE: "#5599ff",
  GREEN: "#55dd55",
  YELLOW: "#ffdd55",
  PURPLE: "#cc55ff",
  PINK: "#ff77cc",
  BROWN: "#aa6633",
  ORANGE: "#ff9944",
};

const INITIAL_STATE = {
  bottles: [
    ["RED", "BLUE", "GREEN", "YELLOW"],
    ["PURPLE", "PINK", "BROWN", "ORANGE"],
    ["YELLOW", "RED", "BLUE", "PURPLE"],
    ["GREEN", "ORANGE", "PINK", "BROWN"],
    ["BLUE", "GREEN", "PURPLE", "RED"],
    ["BROWN", "ORANGE", "YELLOW", "PINK"],
    ["ORANGE", "PURPLE", "YELLOW", "GREEN"],
    ["PINK", "RED", "BROWN", "BLUE"],
    [],
    [],
  ],
  selectedBottle: null,
  moves: 0,
  won: false,
  level: 1,
};

const WaterSortGame = () => {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [showSettings, setShowSettings] = useState(false);
  const [difficulty, setDifficulty] = useState("normal");

  // Reset game with new bottles based on difficulty
  const resetGame = (difficultyLevel = difficulty) => {
    const newBottles = generateBottles(difficultyLevel);
    setGameState({
      ...INITIAL_STATE,
      bottles: newBottles,
      level: gameState.level,
    });
    setDifficulty(difficultyLevel);
  };

  // Generate random bottles based on difficulty
  const generateBottles = (difficultyLevel) => {
    let colorCount, bottleCount, emptyBottles;

    switch (difficultyLevel) {
      case "easy":
        colorCount = 4;
        bottleCount = 6;
        emptyBottles = 2;
        break;
      case "hard":
        colorCount = 8;
        bottleCount = 12;
        emptyBottles = 2;
        break;
      case "normal":
      default:
        colorCount = 6;
        bottleCount = 8;
        emptyBottles = 2;
    }

    const colorKeys = Object.keys(COLORS).slice(0, colorCount);
    const filledBottles = bottleCount - emptyBottles;

    // Create segments (4 of each color)
    let segments = [];
    colorKeys.forEach((color) => {
      for (let i = 0; i < 4; i++) {
        segments.push(color);
      }
    });

    // Shuffle segments
    segments = shuffleArray(segments);

    // Distribute to bottles
    const bottles = [];
    for (let i = 0; i < filledBottles; i++) {
      bottles.push(segments.slice(i * 4, (i + 1) * 4));
    }

    // Add empty bottles
    for (let i = 0; i < emptyBottles; i++) {
      bottles.push([]);
    }

    return bottles;
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Check if game is won
  useEffect(() => {
    const checkWin = () => {
      // Game is won if each bottle is either empty or contains 4 segments of the same color
      const isWon = gameState.bottles.every(
        (bottle) =>
          bottle.length === 0 ||
          (bottle.length === 4 && bottle.every((color) => color === bottle[0]))
      );

      if (isWon && !gameState.won) {
        setGameState((prev) => ({
          ...prev,
          won: true,
          level: prev.level + 1,
        }));
      }
    };

    checkWin();
  }, [gameState.bottles, gameState.won]);

  // Handle bottle click
  const handleBottleClick = (index) => {
    if (gameState.won) return;

    // If no bottle is selected, select this one if it's not empty
    if (gameState.selectedBottle === null) {
      if (gameState.bottles[index].length > 0) {
        setGameState({
          ...gameState,
          selectedBottle: index,
        });
      }
      return;
    }

    // If clicking the same bottle, deselect it
    if (gameState.selectedBottle === index) {
      setGameState({
        ...gameState,
        selectedBottle: null,
      });
      return;
    }

    // Try to pour from selected bottle to this one
    const sourceBottle = gameState.bottles[gameState.selectedBottle];
    const targetBottle = gameState.bottles[index];

    // Can't pour if target bottle is full
    if (targetBottle.length === 4) {
      setGameState({
        ...gameState,
        selectedBottle: null,
      });
      return;
    }

    // Get the color to pour and how many consecutive segments of that color
    const colorToPour = sourceBottle[sourceBottle.length - 1];
    let amountToPour = 0;

    for (let i = sourceBottle.length - 1; i >= 0; i--) {
      if (sourceBottle[i] === colorToPour) {
        amountToPour++;
      } else {
        break;
      }
    }

    // Limit amount based on space in target bottle
    amountToPour = Math.min(amountToPour, 4 - targetBottle.length);

    // Can only pour if target bottle is empty or top color matches
    const canPour =
      targetBottle.length === 0 ||
      targetBottle[targetBottle.length - 1] === colorToPour;

    if (canPour && amountToPour > 0) {
      // Create new bottle arrays
      const newSourceBottle = [...sourceBottle];
      const newTargetBottle = [...targetBottle];

      // Pour the liquid
      for (let i = 0; i < amountToPour; i++) {
        newTargetBottle.push(newSourceBottle.pop());
      }

      // Update state with new bottles and increment moves
      const newBottles = [...gameState.bottles];
      newBottles[gameState.selectedBottle] = newSourceBottle;
      newBottles[index] = newTargetBottle;

      setGameState({
        ...gameState,
        bottles: newBottles,
        selectedBottle: null,
        moves: gameState.moves + 1,
      });
    } else {
      // If can't pour, just deselect
      setGameState({
        ...gameState,
        selectedBottle: null,
      });
    }
  };

  // Start a new level
  const startNextLevel = () => {
    resetGame();
  };

  // Render a single bottle
  const renderBottle = (bottle, index) => {
    const isSelected = gameState.selectedBottle === index;
    const bottleHeight = 160;
    const bottleWidth = 50;

    return (
      <div
        style={{
          position: "relative",
          marginLeft: "0.5rem",
          marginRight: "0.5rem",
          marginBottom: "1rem",
          cursor: "pointer",
          transform: isSelected ? "scale(1.1)" : "none",
          transition: "all 0.2s ease",
        }}
        onClick={() => handleBottleClick(index)}
      >
        {/* Bottle neck */}
        <div
          style={{
            width: bottleWidth * 0.6,
            height: bottleHeight * 0.1,
            backgroundColor: "rgba(136, 136, 136, 0.2)",
            borderLeft: "2px solid rgba(85, 85, 85, 0.3)",
            borderRight: "2px solid rgba(85, 85, 85, 0.3)",
            borderTop: "2px solid rgba(85, 85, 85, 0.3)",
            borderTopLeftRadius: "9999px",
            borderTopRightRadius: "9999px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />

        {/* Bottle body */}
        <div
          style={{
            position: "relative",
            width: bottleWidth,
            height: bottleHeight,
            backgroundColor: "rgba(136, 136, 136, 0.3)",
            border: "2px solid",
            borderTop: "0",
            borderColor: isSelected ? "#ffffff" : "rgba(85, 85, 85, 0.3)",
            boxShadow: isSelected
              ? "0 0 15px rgba(255, 255, 255, 0.5)"
              : "none",
            borderBottomLeftRadius: "1.5rem",
            borderBottomRightRadius: "1.5rem",
            overflow: "hidden",
          }}
        >
          {/* Empty bottle sections */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {/* Filled liquid sections */}
            {bottle.map((color, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  bottom: `${i * 25}%`,
                  height: "25%",
                  width: "100%",
                  backgroundColor: COLORS[color],
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#234e70", // dark blue
        color: "white",
        padding: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              borderRadius: "9999px",
              backgroundColor: "#6b46c1", // purple
              padding: "0.5rem",
              marginRight: "0.5rem",
            }}
          >
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              🧙‍♂️
            </div>
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            水分类游戏
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginRight: "1rem",
            }}
          >
            关卡 {gameState.level}
          </div>
          <button
            style={{
              borderRadius: "9999px",
              backgroundColor: "#2563eb", // blue
              padding: "0.5rem",
            }}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            backgroundColor: "#1e40af", // darker blue
            borderRadius: "0.5rem",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            设置
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                marginBottom: "0.5rem",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                难度:
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <button
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.25rem",
                    backgroundColor:
                      difficulty === "easy" ? "#10b981" : "#2563eb", // green if selected, blue otherwise
                  }}
                  onClick={() => resetGame("easy")}
                >
                  简单
                </button>
                <button
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.25rem",
                    backgroundColor:
                      difficulty === "normal" ? "#10b981" : "#2563eb",
                  }}
                  onClick={() => resetGame("normal")}
                >
                  普通
                </button>
                <button
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.25rem",
                    backgroundColor:
                      difficulty === "hard" ? "#10b981" : "#2563eb",
                  }}
                  onClick={() => resetGame("hard")}
                >
                  困难
                </button>
              </div>
            </div>
            <button
              style={{
                backgroundColor: "#dc2626", // red
                padding: "0.25rem 0.75rem",
                borderRadius: "0.25rem",
              }}
              onClick={() => resetGame(difficulty)}
            >
              重新开始
            </button>
          </div>
        </div>
      )}

      {/* Game board */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-end",
          maxWidth: "48rem",
        }}
      >
        {gameState.bottles.map((bottle, index) => renderBottle(bottle, index))}
      </div>

      {/* Game info */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "1.125rem",
          }}
        >
          步数: {gameState.moves}
        </div>
      </div>

      {/* Win screen */}
      {gameState.won && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              backgroundColor: "#1e40af", // darker blue
              borderRadius: "0.5rem",
              padding: "1.5rem",
              maxWidth: "28rem",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              恭喜！
            </h2>
            <p
              style={{
                marginBottom: "1rem",
              }}
            >
              您完成了第 {gameState.level - 1} 关，用了 {gameState.moves} 步!
            </p>
            <button
              style={{
                backgroundColor: "#16a34a", // green
                padding: "0.5rem 1.5rem",
                borderRadius: "0.5rem",
                fontSize: "1.125rem",
                fontWeight: "bold",
              }}
              onClick={startNextLevel}
            >
              下一关
            </button>
          </div>
        </div>
      )}

      {/* Footer buttons */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          backgroundColor: "#6b46c1", // purple
          padding: "0.5rem",
        }}
      >
        <button
          style={{
            borderRadius: "9999px",
            backgroundColor: "#16a34a", // green
            padding: "0.75rem",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-0.25rem",
              right: "-0.25rem",
              backgroundColor: "#ef4444", // red
              fontSize: "0.75rem",
              borderRadius: "9999px",
              width: "1.25rem",
              height: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            5
          </span>
          🔄
        </button>
        <button
          style={{
            borderRadius: "9999px",
            backgroundColor: "#16a34a", // green
            padding: "0.75rem",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-0.25rem",
              right: "-0.25rem",
              backgroundColor: "#ef4444", // red
              fontSize: "0.75rem",
              borderRadius: "9999px",
              width: "1.25rem",
              height: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            2
          </span>
          🧹
        </button>
        <button
          style={{
            borderRadius: "9999px",
            backgroundColor: "#16a34a", // green
            padding: "0.75rem",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-0.25rem",
              right: "-0.25rem",
              backgroundColor: "#ef4444", // red
              fontSize: "0.75rem",
              borderRadius: "9999px",
              width: "1.25rem",
              height: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            1
          </span>
          💡
        </button>
      </div>
    </div>
  );
};

export default WaterSortGame;
