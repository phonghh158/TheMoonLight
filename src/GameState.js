// src/GameState.js
import Stage1UI from "./ui/Stage1.js";
import Stage2UI from "./ui/Stage2.js";
import Stage3UI from "./ui/Stage3.js";
import Stage4UI from "./ui/Stage4.js";

class GameState {
    constructor() {
        this.currentStage = 1;
        this.currentInstance = null;
        this.results = {
            stage1: null,
            stage2: null,
            stage3: null,
            stage4: null,
        };

        this.stageSections = {
            1: document.querySelector("#stage-1"),
            2: document.querySelector("#stage-2"),
            3: document.querySelector("#stage-3"),
            4: document.querySelector("#stage-4"),
        };
    }

    init() {
        this.bindShortcuts();
        this.showStage(1);
    }

    bindShortcuts() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                if (this.currentStage < 4) {
                    this.showStage(this.currentStage + 1);
                }
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (this.currentStage > 1) {
                    this.showStage(this.currentStage - 1);
                }
            }
        });
    }

    cleanupCurrentStage() {
        if (this.currentInstance) {
            if (typeof this.currentInstance.stopBakeLoop === "function") {
                this.currentInstance.stopBakeLoop();
            }
            if (this.currentInstance.animFrameId) {
                cancelAnimationFrame(this.currentInstance.animFrameId);
                this.currentInstance.animFrameId = null;
            }
            if (this.currentInstance.guideTimeout) {
                clearTimeout(this.currentInstance.guideTimeout);
                this.currentInstance.guideTimeout = null;
            }
        }

        const guideEl = document.querySelector(".guide-notification");
        if (guideEl) {
            guideEl.classList.remove("guide-active");
        }
    }

    showStage(stageNumber) {
        if (stageNumber < 1 || stageNumber > 4) return;

        this.cleanupCurrentStage();
        this.currentStage = stageNumber;

        Object.values(this.stageSections).forEach((section) => {
            if (section) {
                section.classList.add("hidden");
                section.innerHTML = "";
            }
        });

        const activeSection = this.stageSections[stageNumber];
        if (!activeSection) return;

        activeSection.classList.remove("hidden");

        switch (stageNumber) {
            case 1:
                this.currentInstance = new Stage1UI(activeSection, (data) => {
                    this.results.stage1 = data;
                    this.showStage(2);
                });
                break;
            case 2:
                this.currentInstance = new Stage2UI(activeSection, (data) => {
                    this.results.stage2 = data;
                    this.showStage(3);
                });
                break;
            case 3:
                this.currentInstance = new Stage3UI(activeSection, (data) => {
                    this.results.stage3 = data;
                    this.showStage(4);
                });
                break;
            case 4:
                this.currentInstance = new Stage4UI(activeSection, this.results, (data) => {
                    this.results.stage4 = data;
                });
                break;
        }

        window.currentStageInstance = this.currentInstance;
    }
}

export default GameState;
