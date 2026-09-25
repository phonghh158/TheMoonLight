// src/ui/Stage4.js
import Stage4Logic from "../stages/Stage4.js";

class Stage4UI {
    constructor(container, results = {}, onComplete) {
        this.container = container;
        this.results = results;
        this.onComplete = onComplete || null;
        this.logic = new Stage4Logic(results);

        this.guideTimeout = null;
        this.animFrameId = null;
        this.lastTime = performance.now();
        this.isPouring = false;
        this.pourAnimInterval = null;
        this.pourFrameIndex = 0;

        this.initDOM();
        this.renderTableOverview();
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

    renderDashboardDock(label, targetVal, hintText, btnHtml = "") {
        this.dockEl.innerHTML = `
            <div class="tea-dashboard-dock">
                <div class="tea-stat-box">
                    <span class="tea-stat-label">${label}</span>
                    <span class="tea-stat-value">${targetVal}</span>
                </div>
                <div class="tea-action-hint">${hintText}</div>
                ${btnHtml}
            </div>
        `;
    }

    initDOM() {
        this.container.innerHTML = `
            <div class="stage4-wrapper">
                <div class="stage4-workspace" id="stage4-workspace"></div>
                <div class="stage4-dock" id="stage4-dock"></div>
            </div>
        `;
        this.workspaceEl = this.container.querySelector("#stage4-workspace");
        this.dockEl = this.container.querySelector("#stage4-dock");
    }

    renderTableOverview() {
        if (this.logic.isAllCompleted()) {
            this.renderFinalShowcase();
            return;
        }

        this.triggerGuide("Chọn bánh Trung Thu để cắt hoặc ấm trà để rót.");
        const cakeImg = this.logic.getCakeAsset();
        const teapotImg = this.logic.getTeapotAsset();

        this.workspaceEl.innerHTML = `
            <div class="table-overview-stage">
                <div class="table-item-box ${this.logic.isCakeCut ? "done-item" : ""}" id="table-cake-btn">
                    <div class="table-cake-wrap">
                        <img src="/assets/images/stage2/plate.png" class="table-plate-img" alt="Đĩa" />
                        <img src="${cakeImg}" class="table-cake-img" alt="Bánh" />
                        ${this.logic.isCakeCut ? '<div class="item-badge-done">Đã cắt</div>' : ""}
                    </div>
                </div>

                <div class="table-item-box ${this.logic.isTeaPoured ? "done-item" : ""}" id="table-tea-btn">
                    <div class="table-tea-wrap">
                        <img src="${teapotImg}" class="table-teapot-img" alt="Ấm trà" />
                        ${this.logic.isTeaPoured ? '<div class="item-badge-done">Đã rót</div>' : ""}
                    </div>
                </div>
            </div>
        `;

        this.renderDashboardDock(
            "Bàn tiệc Trung Thu",
            "Thưởng trà & Bánh",
            "Nhấn vào món chưa hoàn thành trên bàn để bắt đầu thưởng thức.",
        );

        this.workspaceEl.querySelector("#table-cake-btn").addEventListener("click", () => {
            if (!this.logic.isCakeCut) {
                this.renderCutCakeGame();
            }
        });

        this.workspaceEl.querySelector("#table-tea-btn").addEventListener("click", () => {
            if (!this.logic.isTeaPoured) {
                this.renderPourTeaGame();
            }
        });
    }

    renderCutCakeGame() {
        this.triggerGuide("Kéo chuột liền mạch từ đầu đến cuối từng nét đứt để cắt bánh.");
        const cakeImg = this.logic.getCakeAsset();

        this.workspaceEl.innerHTML = `
            <div class="cut-cake-stage">
                <div class="cut-plate-container">
                    <img src="/assets/images/stage2/plate.png" class="cut-plate-img" alt="Đĩa" />
                    <img src="${cakeImg}" class="cut-cake-img" alt="Bánh" />
                    
                    <svg class="cut-lines-svg" viewBox="0 0 300 300">
                        <line class="cake-cut-line ${this.logic.cutLines[0] ? "cut-done" : ""}" data-idx="0" x1="150" y1="20" x2="150" y2="280" />
                        <line class="cake-cut-line ${this.logic.cutLines[1] ? "cut-done" : ""}" data-idx="1" x1="20" y1="150" x2="280" y2="150" />
                        <line class="cake-cut-line ${this.logic.cutLines[2] ? "cut-done" : ""}" data-idx="2" x1="58" y1="58" x2="242" y2="242" />
                        <line class="cake-cut-line ${this.logic.cutLines[3] ? "cut-done" : ""}" data-idx="3" x1="242" y1="58" x2="58" y2="242" />
                    </svg>
                </div>
            </div>
        `;

        this.renderDashboardDock(
            "Cắt bánh",
            "Kéo trọn vẹn 4 đường",
            "Nhấn giữ chuột ở một đầu nét đứt và kéo thẳng sang đầu đối diện để hoàn thành nhát cắt.",
        );

        const svgEl = this.workspaceEl.querySelector(".cut-lines-svg");
        const lines = svgEl.querySelectorAll(".cake-cut-line");

        const lineConfigs = [
            { idx: 0, p1: { x: 150, y: 20 }, p2: { x: 150, y: 280 } },
            { idx: 1, p1: { x: 20, y: 150 }, p2: { x: 280, y: 150 } },
            { idx: 2, p1: { x: 58, y: 58 }, p2: { x: 242, y: 242 } },
            { idx: 3, p1: { x: 242, y: 58 }, p2: { x: 58, y: 242 } },
        ];

        let activeSlice = null;
        let isDown = false;

        const getSvgPoint = (e) => {
            const rect = svgEl.getBoundingClientRect();
            return {
                x: ((e.clientX - rect.left) / rect.width) * 300,
                y: ((e.clientY - rect.top) / rect.height) * 300,
            };
        };

        const dist = (pt1, pt2) => Math.hypot(pt1.x - pt2.x, pt1.y - pt2.y);

        const onMouseDown = (e) => {
            isDown = true;
            const pt = getSvgPoint(e);

            for (const cfg of lineConfigs) {
                if (this.logic.cutLines[cfg.idx]) continue;

                const d1 = dist(pt, cfg.p1);
                const d2 = dist(pt, cfg.p2);

                if (d1 < 24) {
                    activeSlice = { idx: cfg.idx, startEnd: 1, targetPt: cfg.p2, cfg };
                    break;
                } else if (d2 < 24) {
                    activeSlice = { idx: cfg.idx, startEnd: 2, targetPt: cfg.p1, cfg };
                    break;
                }
            }
        };

        const onMouseMove = (e) => {
            if (!isDown || !activeSlice) return;

            const pt = getSvgPoint(e);
            const lineDist = this.distToSegment(pt, activeSlice.cfg.p1, activeSlice.cfg.p2);

            // Bắt buộc di chuột bám sát đường nét đứt (sai lệch tối đa 20px)
            if (lineDist > 20) {
                activeSlice = null;
                return;
            }

            // Kiểm tra xem đã kéo đến sát đầu mút đối diện chưa
            if (dist(pt, activeSlice.targetPt) < 24) {
                const finishedIdx = activeSlice.idx;
                activeSlice = null;

                const targetLineEl = svgEl.querySelector(`[data-idx="${finishedIdx}"]`);
                if (targetLineEl) targetLineEl.classList.add("cut-done");

                const isAllCut = this.logic.cutLine(finishedIdx);
                if (isAllCut) {
                    window.removeEventListener("mousedown", onMouseDown);
                    window.removeEventListener("mouseup", onMouseUp);
                    window.removeEventListener("mousemove", onMouseMove);
                    this.triggerGuide("Bánh đã được cắt thành 8 miếng hoàn hảo!");
                    setTimeout(() => {
                        this.renderTableOverview();
                    }, 900);
                }
            }
        };

        const onMouseUp = () => {
            isDown = false;
            activeSlice = null;
        };

        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    distToSegment(p, v, w) {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }

    renderPourTeaGame() {
        this.triggerGuide("Nhấn giữ chuột để rót trà.");
        this.workspaceEl.innerHTML = `
            <div class="pour-tea-stage">
                <div class="pour-teapot-container">
                    <img src="/assets/images/stage4/tea_pouring/tcno_tpno.png" id="pour-interactive-img" class="pour-interactive-img" alt="Rót trà" />
                    <div class="gauge-wrapper" id="tea-pour-gauge">
                        <div class="gauge-tube">
                            <div class="gauge-target-line" style="bottom: 75%;"></div>
                            <div class="gauge-bar" id="tea-gauge-bar"></div>
                        </div>
                        <div class="gauge-readout" id="tea-gauge-val">0%</div>
                    </div>
                </div>
            </div>
        `;

        this.renderDashboardDock(
            "Rót trà",
            "Mức chuẩn: ≥ 75%",
            "Nhấn giữ chuột để rót trà vào tách. Đạt đủ mực nước thì thả chuột để hoàn thành.",
        );

        const pourImg = this.workspaceEl.querySelector("#pour-interactive-img");
        const gaugeBar = this.workspaceEl.querySelector("#tea-gauge-bar");
        const gaugeVal = this.workspaceEl.querySelector("#tea-gauge-val");

        const setImgFrame = (frameName) => {
            pourImg.src = `/assets/images/stage4/tea_pouring/${frameName}.png`;
        };

        const stopAnimTimer = () => {
            if (this.pourAnimInterval) {
                clearInterval(this.pourAnimInterval);
                this.pourAnimInterval = null;
            }
        };

        const startForwardAnim = () => {
            stopAnimTimer();
            this.pourAnimInterval = setInterval(() => {
                if (this.logic.teaWater >= 75) {
                    this.pourFrameIndex = 3;
                    setImgFrame("tchave_tphave");
                    stopAnimTimer();
                    return;
                }

                if (this.pourFrameIndex < 2) {
                    this.pourFrameIndex++;
                    const lowFrames = ["tcno_tpno", "tcno_tpsome", "tcno_tphave"];
                    setImgFrame(lowFrames[this.pourFrameIndex]);
                }
            }, 200);
        };

        const startBackwardAnim = (isComplete) => {
            stopAnimTimer();
            if (isComplete) {
                // Chuỗi hoàn thành: tchave_tphave -> tchave_tpsome -> tchave_tno
                const doneFrames = ["tchave_tphave", "tchave_tpsome", "tchave_tpno"];
                let idx = 0;
                setImgFrame(doneFrames[0]);

                this.pourAnimInterval = setInterval(() => {
                    idx++;
                    if (idx < doneFrames.length) {
                        setImgFrame(doneFrames[idx]);
                    } else {
                        stopAnimTimer();
                        this.triggerGuide("Rót trà hoàn tất!");
                        setTimeout(() => {
                            this.renderTableOverview();
                        }, 2400);
                    }
                }, 460);
            } else {
                // Chuỗi trả ngược khi chưa đủ 75%: tcno_tphave -> tcno_tpsome -> tcno_tpno
                const cancelFrames = ["tcno_tpno", "tcno_tpsome", "tcno_tphave"];
                this.pourAnimInterval = setInterval(() => {
                    if (this.pourFrameIndex > 0) {
                        this.pourFrameIndex--;
                        setImgFrame(cancelFrames[this.pourFrameIndex]);
                    } else {
                        stopAnimTimer();
                    }
                }, 250);
            }
        };

        const onMouseDown = () => {
            if (this.logic.isTeaPoured) return;
            this.isPouring = true;
            startForwardAnim();
        };

        const onMouseUp = () => {
            if (!this.isPouring) return;
            this.isPouring = false;

            if (this.logic.checkTeaPourDone()) {
                window.removeEventListener("mousedown", onMouseDown);
                window.removeEventListener("mouseup", onMouseUp);
                if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

                startBackwardAnim(true);
            } else {
                startBackwardAnim(false);
            }
        };

        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);

        this.lastTime = performance.now();
        const loop = (t) => {
            const dt = (t - this.lastTime) / 1000;
            this.lastTime = t;

            if (this.isPouring && !this.logic.isTeaPoured) {
                this.logic.fillTeaWater(dt);
                const pct = Math.round(this.logic.teaWater);
                gaugeBar.style.height = `${pct}%`;
                gaugeVal.textContent = `${pct}%`;

                if (this.logic.teaWater >= 75 && this.pourFrameIndex !== 3) {
                    this.pourFrameIndex = 3;
                    setImgFrame("tchave_tphave");
                    stopAnimTimer();
                }
            }

            this.animFrameId = requestAnimationFrame(loop);
        };
        this.animFrameId = requestAnimationFrame(loop);
    }

    renderFinalShowcase() {
        this.triggerGuide("Chúc mừng cậu đã hoàn thành trọn vẹn bàn tiệc Trung Thu!");
        this.workspaceEl.innerHTML = `
            <div class="final-showcase-stage">
                <img src="/assets/images/end.png" class="showcase-end-img" alt="Trung Thu Đoàn Viên" />
                <div class="showcase-poem">
                    <p class="poem-line-title">Trung Thu đoàn viên</p>
                    <p class="poem-line-sub">Ăn miếng nước, uống miếng bánh, ngồi ngắm trăng</p>
                </div>
            </div>
        `;

        this.dockEl.innerHTML = `
            <div class="dock-actions">
                <button class="dock-btn primary-btn" id="btn-replay-game">Chơi lại từ đầu</button>
            </div>
        `;

        this.dockEl.querySelector("#btn-replay-game").addEventListener("click", () => {
            if (window.gameState) {
                window.gameState.showStage(1);
            }
        });
    }
}

export default Stage4UI;
