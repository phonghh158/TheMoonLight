// src/main.js
import "./styles/stage-1.css";
import "./styles/stage-2.css";
import GameState from "./GameState.js";

window.addEventListener("DOMContentLoaded", () => {
    const game = new GameState();
    game.init();
});
