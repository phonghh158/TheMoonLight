// src/ui/Stage2.js
import MakeMooncake from "../stages/Stage2.js";

class Stage2UI {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete || null;
        this.logic = new MakeMooncake();

        this.animFrameId = null;
        this.lastTime = performance.now();
        this.isMouseDown = false;
        this.guideTimeout = null;

        this.brushCanvas = null;
        this.brushCtx = null;
        this.isBrushing = false;

        this.init();
    }

    triggerGuide(text) {
        const guideEl = document.querySelector(".guide-notification");
        if (!guideEl) return;

        const textEl = guideEl.querySelector("span");
        if (textEl) textEl.textContent = text;

        guideEl.classList.remove("guide-active");
        if (this.guideTimeout) clearTimeout(this.guideTimeout);

        void guideEl.offsetWidth;
        guideEl.classList.add("guide-active");

        this.guideTimeout = setTimeout(() => {
            guideEl.classList.remove("guide-active");
        }, 2500);
    }

    init() {
        this.container.innerHTML = `
            <div class="stage2-wrapper">
                <div class="stage2-workspace" id="stage2-workspace"></div>
                <div class="stage2-dock" id="stage2-dock"></div>
            </div>
        `;

        this.workspaceEl = this.container.querySelector("#stage2-workspace");
        this.dockEl = this.container.querySelector("#stage2-dock");

        this.renderStep();
    }

    renderStep() {
        this.stopBakeLoop();

        const step = this.logic.currentStep;
        if (step === 1) {
            this.container.className = "stage-oven-bg";
            this.renderStep1Selection();
        } else if (step === 2) {
            this.container.className = "stage-oven-bg";
            this.renderStep2Bake(1);
        } else if (step === 3) {
            this.container.className = "stage-oven-bg";
            this.renderStep3Brush();
        } else if (step === 4) {
            this.container.className = "stage-oven-bg";
            this.renderStep2Bake(2);
        }
    }

    renderStep1Selection() {
        this.triggerGuide("Chọn một mẫu bánh Trung Thu và nhấn 'Chọn mẫu này'.");
        const current = this.logic.getSelectedTemplate();

        this.workspaceEl.innerHTML = `
            <div class="selection-container">
                <button class="slider-btn prev-btn" id="btn-prev-template">&#10094;</button>
                <div class="cake-preview-card">
                    <div class="cake-image-box">
                        <img src="${current.unbakedAsset}" id="template-cake-img" alt="${current.name}" />
                    </div>
                    <div class="cake-name" id="template-cake-name">${current.name}</div>
                </div>
                <button class="slider-btn next-btn" id="btn-next-template">&#10095;</button>
            </div>
        `;

        this.dockEl.innerHTML = `
            <div class="dock-actions">
                <button class="dock-btn primary-btn" id="btn-confirm-template">Chọn mẫu này</button>
            </div>
        `;

        const cakeImg = this.workspaceEl.querySelector("#template-cake-img");
        const cakeName = this.workspaceEl.querySelector("#template-cake-name");

        this.workspaceEl.querySelector("#btn-prev-template").addEventListener("click", () => {
            const next = this.logic.prevTemplate();
            cakeImg.src = next.unbakedAsset;
            cakeName.textContent = next.name;
        });

        this.workspaceEl.querySelector("#btn-next-template").addEventListener("click", () => {
            const next = this.logic.nextTemplate();
            cakeImg.src = next.unbakedAsset;
            cakeName.textContent = next.name;
        });

        this.dockEl.querySelector("#btn-confirm-template").addEventListener("click", () => {
            this.logic.confirmTemplate();
            this.renderStep();
        });
    }

    renderStep2Bake(bakeRound) {
        const config = this.logic.getCurrentBakeConfig();
        const minTarget = config.targetTemp - config.tempTolerance;
        const maxTarget = config.targetTemp + config.tempTolerance;
        const gaugeRange = config.gaugeMax - config.gaugeMin;

        this.triggerGuide(
            bakeRound === 1
                ? "Nướng lần 1: Giữ nhiệt độ ổn định trong dải xanh. Khi timer đạt đủ 7-9 phút hãy thả chuột để nhiệt độ hạ hết."
                : "Nướng lần 2: Giữ nhiệt độ trong dải xanh 5-7 phút. Khi đủ thời gian hãy thả chuột để hạ nhiệt độ.",
        );

        this.workspaceEl.innerHTML = `
            <div class="bake-arena">
                <div class="oven-timer-display" id="oven-timer">00:00</div>
                <div class="bake-main-stage">
                    <div class="oven-viewport">
                        <img src="${this.logic.getOvenVisualAsset()}" id="oven-state-img" alt="Lò nướng" />
                    </div>
                    <div class="thermometer-container" id="thermometer-gauge">
                        <div class="thermometer-tube">
                            <div class="target-heat-zone" id="target-heat-zone"></div>
                            <div class="heat-liquid-bar" id="heat-liquid-bar"></div>
                        </div>
                        <div class="temp-readout" id="temp-readout">${this.logic.ovenState.temperature}°C</div>
                    </div>
                </div>
            </div>
        `;

        const targetZoneEl = this.workspaceEl.querySelector("#target-heat-zone");
        const bottomPct = ((minTarget - config.gaugeMin) / gaugeRange) * 100;
        const heightPct = ((maxTarget - minTarget) / gaugeRange) * 100;
        targetZoneEl.style.bottom = `${bottomPct}%`;
        targetZoneEl.style.height = `${heightPct}%`;

        this.dockEl.innerHTML = `
            <div class="bake-dashboard-dock">
                <div class="bake-stat-box">
                    <span class="stat-label">Nhiệt độ chuẩn</span>
                    <span class="stat-value">${config.targetTemp}°C (±${config.tempTolerance}°C)</span>
                </div>
                <div class="bake-stat-box">
                    <span class="stat-label">Thời gian nướng</span>
                    <span class="stat-value">${config.displayTimeRange}</span>
                </div>
                <div class="bake-action-hint" id="bake-action-hint">
                    Nhấn giữ chuột để tăng nhiệt độ lò. Thả chuột khi timer đạt ${config.displayTimeRange} để hạ nhiệt an toàn.
                </div>
            </div>
        `;

        this.ovenImgEl = this.workspaceEl.querySelector("#oven-state-img");
        this.timerEl = this.workspaceEl.querySelector("#oven-timer");
        this.liquidBarEl = this.workspaceEl.querySelector("#heat-liquid-bar");
        this.tempReadoutEl = this.workspaceEl.querySelector("#temp-readout");
        this.hintEl = this.dockEl.querySelector("#bake-action-hint");

        this.playInsertCakeSequence(() => {
            this.bindBakeControls();
            this.startBakeLoop();
        });
    }

    playInsertCakeSequence(onReady) {
        this.logic.setOvenVisual("f3");
        this.ovenImgEl.src = this.logic.getOvenVisualAsset();

        setTimeout(() => {
            this.logic.setOvenVisual("f4");
            this.ovenImgEl.src = this.logic.getOvenVisualAsset();
            if (typeof onReady === "function") onReady();
        }, 800);
    }

    bindBakeControls() {
        this.onMouseDownHandler = (e) => {
            e.preventDefault();
            this.isMouseDown = true;
            this.logic.setHeating(true);
            if (this.hintEl)
                this.hintEl.textContent =
                    "Đang gia nhiệt. Duy trì mức nhiệt trong dải xanh lá.";
        };

        this.onMouseUpHandler = () => {
            if (!this.isMouseDown) return;
            this.isMouseDown = false;
            this.logic.setHeating(false);
            if (this.hintEl)
                this.hintEl.textContent = "Đang hạ nhiệt. Chờ nhiệt độ trở về mức an toàn.";
        };

        window.addEventListener("mousedown", this.onMouseDownHandler);
        window.addEventListener("mouseup", this.onMouseUpHandler);
    }

    unbindBakeControls() {
        if (this.onMouseDownHandler) {
            window.removeEventListener("mousedown", this.onMouseDownHandler);
            this.onMouseDownHandler = null;
        }
        if (this.onMouseUpHandler) {
            window.removeEventListener("mouseup", this.onMouseUpHandler);
            this.onMouseUpHandler = null;
        }
    }

    startBakeLoop() {
        this.lastTime = performance.now();
        const loop = (currentTime) => {
            const dt = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            const res = this.logic.updateOvenTick(dt);

            if (res.status === "baking") {
                this.updateBakeUI(res);
                this.animFrameId = requestAnimationFrame(loop);
            } else if (res.status === "failed") {
                this.stopBakeLoop();
                this.unbindBakeControls();
                this.triggerGuide(res.reason);
                setTimeout(() => {
                    this.renderStep();
                }, 2500);
            } else if (res.status === "success") {
                this.stopBakeLoop();
                this.unbindBakeControls();
                this.triggerGuide(res.message);
                this.playExtractCakeSequence(() => {
                    this.renderStep();
                });
            } else if (res.status === "completed") {
                this.stopBakeLoop();
                this.unbindBakeControls();
                this.triggerGuide(res.message);
                this.playExtractCakeSequence(() => {
                    this.renderFinalCake(res.cake);
                });
            }
        };
        this.animFrameId = requestAnimationFrame(loop);
    }

    stopBakeLoop() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        this.unbindBakeControls();
    }

    updateBakeUI(state) {
        const totalSec = Math.floor(state.virtualSeconds);
        const mins = String(Math.floor(totalSec / 60)).padStart(2, "0");
        const secs = String(totalSec % 60).padStart(2, "0");
        this.timerEl.textContent = `${mins}:${secs}`;

        const temp = Math.round(state.temperature);
        const gaugeRange = state.gaugeMax - state.gaugeMin;
        const tempPct = Math.min(
            100,
            Math.max(0, ((temp - state.gaugeMin) / gaugeRange) * 100),
        );
        this.liquidBarEl.style.height = `${tempPct}%`;
        this.tempReadoutEl.textContent = `${temp}°C`;

        if (state.isInTargetRange) {
            this.liquidBarEl.style.background = "#2ecc71";
        } else {
            this.liquidBarEl.style.background = temp > state.targetTemp ? "#e74c3c" : "#f39c12";
        }
    }

    playExtractCakeSequence(onComplete) {
        this.logic.setOvenVisual("f3");
        this.ovenImgEl.src = this.logic.getOvenVisualAsset();

        setTimeout(() => {
            this.logic.setOvenVisual("f2");
            this.ovenImgEl.src = this.logic.getOvenVisualAsset();
            setTimeout(() => {
                if (typeof onComplete === "function") onComplete();
            }, 600);
        }, 800);
    }

    renderStep3Brush() {
        this.triggerGuide(
            "Dùng chổi quét đều lòng đỏ trứng lên mặt bánh. Bấm 'Kiểm tra' để xem độ phủ.",
        );
        const current = this.logic.getSelectedTemplate();

        this.workspaceEl.innerHTML = `
            <div class="brush-work-area" id="brush-work-area">
                <div class="brush-feedback-fancy" id="brush-feedback-fancy"></div>
                <div class="brush-cake-container">
                    <img src="${current.baked1Asset}" class="brush-underlay-img" alt="${current.name}" />
                    <canvas class="brush-mask-canvas" id="brush-canvas" width="400" height="400"></canvas>
                </div>
                <img src="/assets/images/stage2/mini_broom.png" class="brush-cursor-follower" id="brush-follower" alt="Chổi quét" />
            </div>
        `;

        this.dockEl.innerHTML = `
            <div class="brush-dashboard-dock">
                <button class="dock-btn secondary-btn" id="btn-check-brush">Kiểm tra</button>
                <button class="dock-btn primary-btn" id="btn-finish-brush">Hoàn thành</button>
            </div>
        `;

        this.initBrushCanvas(current.baked1Asset);

        const feedbackEl = this.workspaceEl.querySelector("#brush-feedback-fancy");

        this.dockEl.querySelector("#btn-check-brush").addEventListener("click", () => {
            const currentPct = Math.round(this.logic.brushProgress);
            feedbackEl.textContent = `${currentPct}%`;
            feedbackEl.style.color = "#8d6e63";
            feedbackEl.classList.remove("pop");
            void feedbackEl.offsetWidth;
            feedbackEl.classList.add("pop");
        });

        this.dockEl.querySelector("#btn-finish-brush").addEventListener("click", () => {
            const check = this.logic.checkBrushCompletion();
            if (!check.success) {
                feedbackEl.textContent = "";
                this.triggerGuide(check.message);
            } else {
                feedbackEl.textContent = `${check.progress}%`;
                feedbackEl.style.color = "#27ae60";
                feedbackEl.classList.remove("pop");
                void feedbackEl.offsetWidth;
                feedbackEl.classList.add("pop");

                this.triggerGuide(check.message);
                setTimeout(() => {
                    this.renderStep();
                }, 1500);
            }
        });
    }

    initBrushCanvas(assetPath) {
        this.brushCanvas = this.workspaceEl.querySelector("#brush-canvas");
        this.brushCtx = this.brushCanvas.getContext("2d", { willReadFrequently: true });
        const follower = this.workspaceEl.querySelector("#brush-follower");
        const workArea = this.workspaceEl.querySelector("#brush-work-area");

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = assetPath;
        img.onload = () => {
            this.brushCtx.save();
            this.brushCtx.filter = "saturate(30%) brightness(125%) contrast(70%)";
            this.brushCtx.drawImage(img, 0, 0, 400, 400);
            this.brushCtx.restore();
        };

        const getPos = (e) => {
            const rect = this.brushCanvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) * (this.brushCanvas.width / rect.width),
                y: (e.clientY - rect.top) * (this.brushCanvas.height / rect.height),
            };
        };

        const eraseAt = (x, y) => {
            this.brushCtx.save();
            this.brushCtx.globalCompositeOperation = "destination-out";
            this.brushCtx.beginPath();
            this.brushCtx.arc(x, y, 26, 0, Math.PI * 2);
            this.brushCtx.fill();
            this.brushCtx.restore();
            this.calculateBrushProgress();
        };

        workArea.addEventListener("mousemove", (e) => {
            follower.style.left = `${e.clientX}px`;
            follower.style.top = `${e.clientY}px`;

            if (this.isBrushing) {
                const pos = getPos(e);
                eraseAt(pos.x, pos.y);
            }
        });

        this.brushCanvas.addEventListener("mousedown", (e) => {
            this.isBrushing = true;
            const pos = getPos(e);
            eraseAt(pos.x, pos.y);
        });

        window.addEventListener("mouseup", () => {
            this.isBrushing = false;
        });
    }

    calculateBrushProgress() {
        const w = this.brushCanvas.width;
        const h = this.brushCanvas.height;
        const imgData = this.brushCtx.getImageData(0, 0, w, h).data;

        let transparentCount = 0;
        const step = 8;
        let totalSamples = 0;

        for (let i = 3; i < imgData.length; i += 4 * step) {
            totalSamples++;
            if (imgData[i] < 30) {
                transparentCount++;
            }
        }

        const percentage = (transparentCount / totalSamples) * 100;
        this.logic.updateBrushProgress(percentage);
    }

    renderFinalCake(cake) {
        this.triggerGuide(`Chúc mừng cậu đã hoàn thành ${cake.name}!`);
        this.container.className = "stage-plate-bg";

        this.workspaceEl.innerHTML = `
        <div class="final-cake-stage">
            <div class="final-plate-container">
                <img src="/assets/images/stage2/plate.png" class="final-plate-img" alt="Đĩa gốm" />
                <img src="${cake.bakedAsset}" class="final-plated-cake" alt="${cake.name}" />
            </div>
            <div class="final-cake-congrats">
                <span class="congrats-sub">Congrats! Đã hoàn thành</span>
                <span class="congrats-main">${cake.name}</span>
            </div>
        </div>
    `;

        this.dockEl.innerHTML = `
        <div class="dock-actions">
            <button class="dock-btn primary-btn" id="btn-finish-stage2">Tiếp tục sang Stage 3</button>
        </div>
    `;

        this.dockEl.querySelector("#btn-finish-stage2").addEventListener("click", () => {
            if (typeof this.onComplete === "function") {
                this.onComplete(this.logic.getState());
            }
        });
    }
}

export default Stage2UI;
