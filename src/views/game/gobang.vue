<template>
    <div class="snake-game">
      <div class="game-board">
        <div
          v-for="(row, rowIndex) in board"
          :key="rowIndex"
          class="row"
        >
          <div
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            class="cell"
            :class="{ 'snake': isSnakeCell(rowIndex, cellIndex), 'food': isFoodCell(rowIndex, cellIndex) }"
          >
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  export default {
    setup() {
      const rows = 10;
      const cols = 10;
      const board = ref([]);
  
      const snake = [
        { x: 0, y: 0 },  // 初始蛇头位置
      ];
  
      const food = { x: 5, y: 5 };  // 初始食物位置
  
      function isSnakeCell(row, col) {
        return snake.some((cell) => cell.x === row && cell.y === col);
      }
  
      function isFoodCell(row, col) {
        return food.x === row && food.y === col;
      }
  
      // 初始化游戏板
      function initBoard() {
        const newBoard = [];
        for (let i = 0; i < rows; i++) {
          const newRow = [];
          for (let j = 0; j < cols; j++) {
            newRow.push(0);
          }
          newBoard.push(newRow);
        }
        board.value = newBoard;
      }
  
      onMounted(() => {
        initBoard();
      });
  
      onUnmounted(() => {
        // 清理工作
      });
  
      return {
        board,
        isSnakeCell,
        isFoodCell,
      };
    },
  };
  </script>
  
  <style>
  .game-board {
    display: flex;
    flex-wrap: wrap;
    border: 1px solid #ccc;
  }
  
  .row {
    display: flex;
  }
  
  .cell {
    width: 30px;
    height: 30px;
    border: 1px solid #fff;
    box-sizing: border-box;
  }
  
  .snake {
    background-color: green;
  }
  
  .food {
    background-color: red;
  }
  </style>