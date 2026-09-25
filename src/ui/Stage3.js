// src/ui/Stage3.js
import MakeTea from "../stages/Stage3.js";

class Stage3UI {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete || null;
        this.logic = new MakeTea();

        this.animFrameId = null;
        this.isPouring = false;
        this.isDraining = false;
        this.lastTime = performance.now();
        this.selectedTeaIdx = 0;
        this.guideTimeout = null;

        this.onWindowMouseDown = null;
        this.onWindowMouseUp = null;

        this.initDOM();
        this.startStep1();
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

    unbindMouseControls() {
        if (this.onWindowMouseDown) {
            window.removeEventListener("mousedown", this.onWindowMouseDown);
            this.onWindowMouseDown = null;
        }
        if (this.onWindowMouseUp) {
            window.removeEventListener("mouseup", this.onWindowMouseUp);
            this.onWindowMouseUp = null;
        }
        this.isPouring = false;
        this.isDraining = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
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
            <div class="stage3-wrapper">
                <div class="stage3-workspace" id="stage3-workspace"></div>
                <div class="stage3-dock" id="stage3-dock"></div>
            </div>
        `;
        this.workspaceEl = this.container.querySelector("#stage3-workspace");
        this.dockEl = this.container.querySelector("#stage3-dock");
    }

    startStep1() {
        this.unbindMouseControls();
        this.triggerGuide("Nhấn vào nắp ấm để mở ấm trà ra.");
        this.workspaceEl.innerHTML = `
            <div class="pot-stage-box">
                <img src="/assets/images/stage3/close_normal.png" id="pot-main-img" class="pot-view-img" alt="Ấm trà" />
                <div class="pot-hitbox-lid" id="pot-lid-hitbox"></div>
                <div class="gauge-wrapper hidden" id="water-gauge">
                    <div class="gauge-tube" id="gauge-tube-el">
                        <div class="gauge-bar" id="gauge-fill-bar"></div>
                    </div>
                    <div class="gauge-readout" id="gauge-val">0%</div>
                </div>
            </div>
        `;
        this.renderDashboardDock(
            "Bước thực hiện",
            "Mở nắp ấm",
            "Nhấn vào nắp ấm để chuẩn bị tráng nước sôi.",
        );

        const potImg = this.workspaceEl.querySelector("#pot-main-img");
        const lidHitbox = this.workspaceEl.querySelector("#pot-lid-hitbox");

        lidHitbox.addEventListener("click", () => {
            potImg.src = "/assets/images/stage3/no_tea_no_water/open_1.png";
            setTimeout(() => {
                potImg.src = "/assets/images/stage3/no_tea_no_water/open_2.png";
                setTimeout(() => {
                    potImg.src = "/assets/images/stage3/no_tea_no_water/teapot.png";
                    lidHitbox.remove();
                    this.setupRinsePouring();
                }, 750);
            }, 375);
        });
    }

    setupRinsePouring() {
        this.unbindMouseControls();
        this.triggerGuide(
            "Nhấn giữ chuột để rót nước tráng ấm (mức chuẩn: ≥ 50%, tối đa 66%).",
        );

        const gaugeEl = this.workspaceEl.querySelector("#water-gauge");
        const gaugeTube = this.workspaceEl.querySelector("#gauge-tube-el");
        gaugeEl.classList.remove("hidden");

        const oldTarget = gaugeTube.querySelector(".gauge-target-line");
        if (oldTarget) oldTarget.remove();
        const line50 = document.createElement("div");
        line50.className = "gauge-target-line";
        line50.style.bottom = "50%";
        gaugeTube.appendChild(line50);

        const potImg = this.workspaceEl.querySelector("#pot-main-img");
        const fillBar = this.workspaceEl.querySelector("#gauge-fill-bar");
        const valReadout = this.workspaceEl.querySelector("#gauge-val");

        this.renderDashboardDock(
            "Mực nước tráng",
            "≥ 50% (Chặn ở 66%)",
            "Nhấn giữ chuột để rót nước vào ấm. Sau khi đủ lượng nước thì bấm nút để hoàn thành.",
            `<button class="dock-btn primary-btn" id="btn-done-rinse-pour">Xong rót nước</button>`,
        );

        const updateVisual = () => {
            const pct = this.logic.waterAmount;
            fillBar.style.height = `${pct}%`;
            valReadout.textContent = `${Math.round(pct)}%`;

            if (pct >= 36) {
                potImg.src = "/assets/images/stage3/just_water/50.png";
            } else if (pct >= 10) {
                potImg.src = "/assets/images/stage3/just_water/10.png";
            } else {
                potImg.src = "/assets/images/stage3/no_tea_no_water/teapot.png";
            }
        };

        this.onWindowMouseDown = (e) => {
            if (e.target.closest("#btn-done-rinse-pour")) return;
            this.isPouring = true;
        };
        this.onWindowMouseUp = () => {
            this.isPouring = false;
        };

        window.addEventListener("mousedown", this.onWindowMouseDown);
        window.addEventListener("mouseup", this.onWindowMouseUp);

        this.lastTime = performance.now();
        const loop = (t) => {
            const dt = (t - this.lastTime) / 1000;
            this.lastTime = t;
            if (this.isPouring) {
                this.logic.fillRinseWater(dt);
                updateVisual();
            }
            this.animFrameId = requestAnimationFrame(loop);
        };
        this.animFrameId = requestAnimationFrame(loop);

        this.dockEl.querySelector("#btn-done-rinse-pour").addEventListener("click", () => {
            if (!this.logic.checkRinseWater()) {
                this.triggerGuide("Chưa đủ nước tráng ấm! Hãy rót tối thiểu 50%.");
                return;
            }
            this.unbindMouseControls();

            potImg.src = "/assets/images/stage3/just_water/open_2.png";
            setTimeout(() => {
                potImg.src = "/assets/images/stage3/just_water/open_1.png";
                setTimeout(() => {
                    potImg.src = "/assets/images/stage3/close_steam.png";
                    this.setupRinseShake();
                }, 750);
            }, 375);
        });
    }

    setupRinseShake() {
        this.unbindMouseControls();
        this.triggerGuide("Nhấn liên tục vào ấm trà trong 3 giây để tráng ấm!");
        const potImg = this.workspaceEl.querySelector(".pot-view-img");
        potImg.src = "/assets/images/stage3/close_steam.png";

        this.renderDashboardDock(
            "Thao tác",
            "Tráng ấm trà",
            "Nhấn chuột liên tục vào ấm trà trong 3 giây để nước tráng đều lòng ấm.",
        );

        let timer = 3;
        let isStarted = false;
        let timerInterval = null;

        const onPotClick = () => {
            if (!isStarted) {
                isStarted = true;
                timerInterval = setInterval(() => {
                    timer -= 1;
                    if (timer <= 0) {
                        clearInterval(timerInterval);
                        potImg.removeEventListener("click", onPotClick);
                        if (this.logic.shakeClicks >= 10) {
                            this.setupDrainWater(true);
                        } else {
                            this.triggerGuide("Chưa đủ lực tráng ấm, hãy thử lại!");
                            this.logic.shakeClicks = 0;
                            setTimeout(() => this.setupRinseShake(), 750);
                        }
                    }
                }, 1000);
            }
            this.logic.recordShakeClick();
            potImg.classList.remove("pot-shake");
            void potImg.offsetWidth;
            potImg.classList.add("pot-shake");
        };

        potImg.addEventListener("click", onPotClick);
    }

    setupDrainWater(isFirstRinse) {
        this.unbindMouseControls();
        this.triggerGuide("Nhấn giữ chuột vào ấm để đổ hết nước ra.");
        const potImg = this.workspaceEl.querySelector(".pot-view-img");
        const fillBar =
            this.workspaceEl.querySelector("#gauge-fill-bar") ||
            this.workspaceEl.querySelector("#awaken-bar");
        const valReadout =
            this.workspaceEl.querySelector("#gauge-val") ||
            this.workspaceEl.querySelector("#awaken-val");

        if (potImg) potImg.src = "/assets/images/stage3/close_steam.png";
        this.renderDashboardDock(
            "Thao tác",
            "Đổ nước ra",
            "Nhấn giữ chuột vào thân ấm để xả toàn bộ lượng nước bên trong ra ngoài.",
        );

        const updateDrainVisual = () => {
            const pct = this.logic.waterAmount;
            if (fillBar) fillBar.style.height = `${pct}%`;
            if (valReadout) valReadout.textContent = `${Math.round(pct)}%`;
        };

        this.onWindowMouseDown = () => {
            this.isDraining = true;
        };
        this.onWindowMouseUp = () => {
            this.isDraining = false;
        };

        window.addEventListener("mousedown", this.onWindowMouseDown);
        window.addEventListener("mouseup", this.onWindowMouseUp);

        this.lastTime = performance.now();
        const loop = (t) => {
            const dt = (t - this.lastTime) / 1000;
            this.lastTime = t;
            if (this.isDraining) {
                this.logic.drainWater(dt);
                updateDrainVisual();
                if (this.logic.waterAmount <= 0) {
                    this.unbindMouseControls();
                    if (potImg) potImg.src = "/assets/images/stage3/close_normal.png";
                    if (isFirstRinse) {
                        setTimeout(() => this.setupSelectTeaStep(), 450);
                    } else {
                        setTimeout(() => this.setupBrewPotOpen(), 450);
                    }
                    return;
                }
            }
            this.animFrameId = requestAnimationFrame(loop);
        };
        this.animFrameId = requestAnimationFrame(loop);
    }

    setupSelectTeaStep() {
        this.unbindMouseControls();
        this.triggerGuide("Chọn loại trà cậu muốn pha.");
        const teas = this.logic.teas;
        this.selectedTeaIdx = 0;

        const renderTeaCard = () => {
            const item = teas[this.selectedTeaIdx];
            this.workspaceEl.innerHTML = `
                <div class="selection-container">
                    <button class="slider-btn prev-btn" id="btn-prev-tea">&#10094;</button>
                    <div class="cake-preview-card">
                        <div class="cake-image-box">
                            <img src="${item.img}" id="tea-img" alt="${item.name}" />
                        </div>
                        <div class="cake-name" id="tea-name">${item.name}</div>
                    </div>
                    <button class="slider-btn next-btn" id="btn-next-tea">&#10095;</button>
                </div>
            `;
            this.dockEl.innerHTML = `
                <div class="dock-actions">
                    <button class="dock-btn primary-btn" id="btn-confirm-tea">Chọn loại trà này</button>
                </div>
            `;

            this.workspaceEl.querySelector("#btn-prev-tea").addEventListener("click", () => {
                this.selectedTeaIdx = (this.selectedTeaIdx - 1 + teas.length) % teas.length;
                renderTeaCard();
            });
            this.workspaceEl.querySelector("#btn-next-tea").addEventListener("click", () => {
                this.selectedTeaIdx = (this.selectedTeaIdx + 1) % teas.length;
                renderTeaCard();
            });

            this.dockEl.querySelector("#btn-confirm-tea").addEventListener("click", () => {
                const chosen = this.logic.selectTea(teas[this.selectedTeaIdx].id);
                if (chosen.id === 4) {
                    this.renderShoppingScreen();
                } else {
                    this.setupOpenPotForTea();
                }
            });
        };

        renderTeaCard();
    }

    renderShoppingScreen() {
        this.unbindMouseControls();
        this.triggerGuide("Hồng trà đi mua sẵn uống cho ngon!");
        this.workspaceEl.innerHTML = `
            <div class="shopping-container">
                <img src="/assets/images/stage3/shopping.png" class="shopping-img" alt="Đi mua hồng trà" />
            </div>
        `;
        this.dockEl.innerHTML = `
            <div class="dock-actions">
                <button class="dock-btn primary-btn" id="btn-finish-shopping">Hoàn thành Stage 3</button>
            </div>
        `;
        this.dockEl.querySelector("#btn-finish-shopping").addEventListener("click", () => {
            if (typeof this.onComplete === "function") {
                this.onComplete(this.logic.getState());
            }
        });
    }

    setupOpenPotForTea() {
        this.unbindMouseControls();
        this.triggerGuide("Nhấn vào nắp ấm để mở ấm trà ra.");
        this.workspaceEl.innerHTML = `
            <div class="pot-stage-box">
                <img src="/assets/images/stage3/close_normal.png" id="pot-tea-img" class="pot-view-img" alt="Ấm trà" />
                <div class="pot-hitbox-lid" id="pot-tea-lid"></div>
            </div>
        `;
        this.renderDashboardDock(
            "Bước thực hiện",
            "Mở nắp ấm",
            "Nhấn vào nắp để mở ấm chuẩn bị đong trà khô vào.",
        );

        const potImg = this.workspaceEl.querySelector("#pot-tea-img");
        const lidHitbox = this.workspaceEl.querySelector("#pot-tea-lid");

        lidHitbox.addEventListener("click", () => {
            potImg.src = "/assets/images/stage3/no_tea_no_water/open_1.png";
            setTimeout(() => {
                potImg.src = "/assets/images/stage3/no_tea_no_water/open_2.png";
                setTimeout(() => {
                    potImg.src = "/assets/images/stage3/no_tea_no_water/teapot.png";
                    lidHitbox.remove();
                    this.setupAddTeaAmount();
                }, 750);
            }, 375);
        });
    }

    setupAddTeaAmount() {
        this.unbindMouseControls();
        this.triggerGuide("Chọn lượng trà cho vào ấm.");
        this.renderDashboardDock(
            "Định lượng",
            "1 hoặc 2 thìa",
            "Chọn số lượng thìa trà khô để cho vào ấm.",
            `<div style="display:flex; gap:12px;">
                <button class="dock-btn secondary-btn" id="btn-tea-1">1 thìa trà</button>
                <button class="dock-btn primary-btn" id="btn-tea-2">2 thìa trà</button>
            </div>`,
        );

        const potImg = this.workspaceEl.querySelector("#pot-tea-img");

        const applyTea = (spoons) => {
            this.logic.chooseTeaAmount(spoons);
            if (spoons === 1) {
                potImg.src = "/assets/images/stage3/tea_fills/tea_fill_1.png";
                setTimeout(() => {
                    potImg.src = "/assets/images/stage3/tea_fills/tea_filled_1.png";
                    setTimeout(() => {
                        this.setupAwakenPourStep();
                    }, 900);
                }, 450);
            } else {
                potImg.src = "/assets/images/stage3/tea_fills/tea_fill_1.png";
                setTimeout(() => {
                    potImg.src = "/assets/images/stage3/tea_fills/tea_filled_1.png";
                    setTimeout(() => {
                        potImg.src = "/assets/images/stage3/tea_fills/tea_fill_2.png";
                        setTimeout(() => {
                            potImg.src = "/assets/images/stage3/tea_fills/tea_filled_2.png";
                            setTimeout(() => {
                                this.setupAwakenPourStep();
                            }, 750);
                        }, 450);
                    }, 450);
                }, 450);
            }
        };

        this.dockEl.querySelector("#btn-tea-1").addEventListener("click", () => applyTea(1));
        this.dockEl.querySelector("#btn-tea-2").addEventListener("click", () => applyTea(2));
    }

    setupAwakenPourStep() {
        this.unbindMouseControls();
        this.triggerGuide("Nhấn giữ chuột để rót nước tráng trà (mức chuẩn: 20% - 30%).");
        this.logic.waterAmount = 0;

        this.workspaceEl.innerHTML = `
            <div class="pot-stage-box">
                <img src="/assets/images/stage3/tea_fills/tea_filled_${this.logic.teaSpoons}.png" id="pot-awaken-img" class="pot-view-img" alt="Ấm trà" />
                <div class="gauge-wrapper" id="awaken-gauge">
                    <div class="gauge-tube" id="awaken-tube-el">
                        <div class="gauge-target-line" style="bottom: 20%;"></div>
                        <div class="gauge-target-line" style="bottom: 30%;"></div>
                        <div class="gauge-bar" id="awaken-bar"></div>
                    </div>
                    <div class="gauge-readout" id="awaken-val">0%</div>
                </div>
            </div>
        `;

        this.renderDashboardDock(
            "Mực nước tráng",
            "20% - 30%",
            "Nhấn giữ chuột để rót nước đánh thức búp trà khô.",
            `<button class="dock-btn primary-btn" id="btn-done-awaken">Xong rót nước</button>`,
        );

        const potImg = this.workspaceEl.querySelector("#pot-awaken-img");
        const fillBar = this.workspaceEl.querySelector("#awaken-bar");
        const valReadout = this.workspaceEl.querySelector("#awaken-val");

        const updateVisual = () => {
            const pct = this.logic.waterAmount;
            fillBar.style.height = `${pct}%`;
            valReadout.textContent = `${Math.round(pct)}%`;

            if (pct >= 20) {
                potImg.src = "/assets/images/stage3/tea_and_water/50.png";
            } else if (pct >= 10) {
                potImg.src = "/assets/images/stage3/tea_and_water/10.png";
            }
        };

        this.onWindowMouseDown = (e) => {
            if (e.target.closest("#btn-done-awaken")) return;
            this.isPouring = true;
        };
        this.onWindowMouseUp = () => {
            this.isPouring = false;
        };

        window.addEventListener("mousedown", this.onWindowMouseDown);
        window.addEventListener("mouseup", this.onWindowMouseUp);

        this.lastTime = performance.now();
        const loop = (t) => {
            const dt = (t - this.lastTime) / 1000;
            this.lastTime = t;
            if (this.isPouring) {
                this.logic.fillAwakenWater(dt);
                updateVisual();
            }
            this.animFrameId = requestAnimationFrame(loop);
        };
        this.animFrameId = requestAnimationFrame(loop);

        this.dockEl.querySelector("#btn-done-awaken").addEventListener("click", () => {
            if (!this.logic.checkAwakenWater()) {
                this.triggerGuide("Mực nước chưa đủ! Cần từ 20% đến 30%.");
                return;
            }
            this.unbindMouseControls();

            potImg.src = "/assets/images/stage3/tea_and_water/open_2.png";
            setTimeout(() => {
                potImg.src = "/assets/images/stage3/tea_and_water/open_1.png";
                setTimeout(() => {
                    potImg.src = "/assets/images/stage3/close_steam.png";
                    this.runAwakenTimer();
                }, 675);
            }, 340);
        });
    }

    runAwakenTimer() {
        this.unbindMouseControls();
        this.triggerGuide("Đang tráng trà trong 30 giây...");
        const potImg = this.workspaceEl.querySelector(".pot-view-img");
        if (potImg) potImg.src = "/assets/images/stage3/close_steam.png";

        let virtualSecs = 0;
        const totalTarget = 30;
        this.renderDashboardDock(
            "Thời gian tráng",
            `<div class="timer-fast" id="timer-display">00:00</div>`,
            "Chờ trà ngấm đều trong 30 giây.",
        );
        const timerDisplay = this.dockEl.querySelector("#timer-display");

        const interval = setInterval(() => {
            virtualSecs += 1;
            const m = String(Math.floor(virtualSecs / 60)).padStart(2, "0");
            const s = String(virtualSecs % 60).padStart(2, "0");
            timerDisplay.textContent = `${m}:${s}`;

            if (virtualSecs >= totalTarget) {
                clearInterval(interval);
                this.setupDrainWater(false);
            }
        }, 333);
    }

    setupBrewPotOpen() {
        this.unbindMouseControls();
        this.triggerGuide("Nhấn vào nắp ấm để mở ấm bắt đầu pha trà.");
        const folder = this.logic.teaSpoons === 1 ? "tea_and_water_1" : "tea_and_water_2";

        this.workspaceEl.innerHTML = `
            <div class="pot-stage-box">
                <img src="/assets/images/stage3/close_steam.png" id="pot-brew-img" class="pot-view-img" alt="Ấm trà" />
                <div class="pot-hitbox-lid" id="pot-brew-lid"></div>
                <div class="gauge-wrapper hidden" id="brew-gauge">
                    <div class="gauge-tube" id="brew-tube-el">
                        <div class="gauge-target-line" style="bottom: 66%;"></div>
                        <div class="gauge-target-line" style="bottom: 96%;"></div>
                        <div class="gauge-bar" id="brew-bar"></div>
                    </div>
                    <div class="gauge-readout" id="brew-val">0%</div>
                </div>
            </div>
        `;
        this.renderDashboardDock(
            "Bước thực hiện",
            "Mở nắp ấm",
            "Nhấn vào nắp ấm để chuẩn bị rót nước hãm trà chính.",
        );

        const potImg = this.workspaceEl.querySelector("#pot-brew-img");
        const lidHitbox = this.workspaceEl.querySelector("#pot-brew-lid");

        lidHitbox.addEventListener("click", () => {
            potImg.src = `/assets/images/stage3/${folder}/open_1.png`;
            setTimeout(() => {
                potImg.src = `/assets/images/stage3/${folder}/open_2.png`;
                setTimeout(() => {
                    potImg.src = `/assets/images/stage3/${folder}/teapot.png`;
                    lidHitbox.remove();
                    this.setupBrewPourStep();
                }, 900);
            }, 450);
        });
    }

    setupBrewPourStep() {
        this.unbindMouseControls();
        this.triggerGuide("Rót nước hãm trà lần cuối (cần đạt 66% - 96%).");
        this.logic.waterAmount = 0;

        const folder = this.logic.teaSpoons === 1 ? "tea_and_water_1" : "tea_and_water_2";
        const gaugeEl = this.workspaceEl.querySelector("#brew-gauge");
        gaugeEl.classList.remove("hidden");

        this.renderDashboardDock(
            "Lượng nước hãm",
            "66% - 96%",
            "Nhấn giữ chuột để rót lượng nước chuẩn hãm trà.",
            `<button class="dock-btn primary-btn" id="btn-done-brew">Xong rót nước</button>`,
        );

        const potImg = this.workspaceEl.querySelector("#pot-brew-img");
        const fillBar = this.workspaceEl.querySelector("#brew-bar");
        const valReadout = this.workspaceEl.querySelector("#brew-val");

        const updateVisual = () => {
            const pct = this.logic.waterAmount;
            fillBar.style.height = `${pct}%`;
            valReadout.textContent = `${Math.round(pct)}%`;

            if (pct > 75) {
                potImg.src = `/assets/images/stage3/${folder}/100.png`;
            } else if (pct >= 33) {
                potImg.src = `/assets/images/stage3/${folder}/50.png`;
            } else {
                potImg.src = `/assets/images/stage3/${folder}/teapot.png`;
            }
        };

        this.onWindowMouseDown = (e) => {
            if (e.target.closest("#btn-done-brew")) return;
            this.isPouring = true;
        };
        this.onWindowMouseUp = () => {
            this.isPouring = false;
        };

        window.addEventListener("mousedown", this.onWindowMouseDown);
        window.addEventListener("mouseup", this.onWindowMouseUp);

        this.lastTime = performance.now();
        const loop = (t) => {
            const dt = (t - this.lastTime) / 1000;
            this.lastTime = t;
            if (this.isPouring) {
                this.logic.fillBrewWater(dt);
                updateVisual();
            }
            this.animFrameId = requestAnimationFrame(loop);
        };
        this.animFrameId = requestAnimationFrame(loop);

        this.dockEl.querySelector("#btn-done-brew").addEventListener("click", () => {
            if (!this.logic.checkBrewWater()) {
                this.triggerGuide("Mực nước chưa chuẩn! Cần trong khoảng 66% - 96%.");
                return;
            }
            this.unbindMouseControls();

            potImg.src = `/assets/images/stage3/${folder}/close_1.png`;
            setTimeout(() => {
                potImg.src = `/assets/images/stage3/${folder}/close_2.png`;
                setTimeout(() => {
                    potImg.src = "/assets/images/stage3/close_steam.png";
                    this.runBrewTimer();
                }, 800);
            }, 400);
        });
    }

    runBrewTimer() {
        this.unbindMouseControls();
        const brewMinutes = this.logic.selectedTea ? this.logic.selectedTea.brewMinutes : 3;
        this.triggerGuide(
            `Đang hãm ${this.logic.selectedTea.name} trong ${brewMinutes} phút...`,
        );

        const potImg = this.workspaceEl.querySelector(".pot-view-img");
        if (potImg) potImg.src = "/assets/images/stage3/close_steam.png";

        let virtualSecs = 0;
        const totalTarget = brewMinutes * 60;
        this.renderDashboardDock(
            "Thời gian hãm",
            `<div class="timer-fast" id="timer-display">00:00</div>`,
            `Chờ hãm trà trong ${brewMinutes} phút.`,
        );
        const timerDisplay = this.dockEl.querySelector("#timer-display");

        const interval = setInterval(() => {
            virtualSecs += 60;
            const m = String(Math.floor(virtualSecs / 60)).padStart(2, "0");
            const s = String(virtualSecs % 60).padStart(2, "0");
            timerDisplay.textContent = `${m}:${s}`;

            if (virtualSecs >= totalTarget) {
                clearInterval(interval);
                this.setupOpenFinalPot();
            }
        }, 1000);
    }

    setupOpenFinalPot() {
        this.unbindMouseControls();
        this.triggerGuide("Nhấn vào nắp ấm để mở ra xem thành phẩm.");
        const potImg = this.workspaceEl.querySelector(".pot-view-img");

        this.renderDashboardDock(
            "Hoàn thành",
            "Mở nắp",
            "Nhấn vào nắp ấm để thưởng thức thành phẩm trà vừa pha.",
        );

        if (potImg) {
            potImg.style.cursor = "pointer";
            potImg.addEventListener(
                "click",
                () => {
                    this.renderFinalTeapot();
                },
                { once: true },
            );
        }
    }

    renderFinalTeapot() {
        this.unbindMouseControls();
        const result = this.logic.calculateTeaResult();
        const teaName = this.logic.selectedTea.name;
        this.triggerGuide(`Pha trà hoàn tất: ${result.title}!`);

        this.workspaceEl.innerHTML = `
            <div class="final-tea-box">
                <img src="${result.img}" class="final-pot-img" alt="${result.title}" />
                <div class="final-tea-info">
                    <span class="final-tea-name">${teaName}</span>
                    <span class="final-tea-quality">${result.title}</span>
                </div>
            </div>
        `;

        this.dockEl.innerHTML = `
            <div class="dock-actions">
                <button class="dock-btn primary-btn" id="btn-finish-stage3">Tiếp tục sang Stage 4</button>
            </div>
        `;

        this.dockEl.querySelector("#btn-finish-stage3").addEventListener("click", () => {
            if (typeof this.onComplete === "function") {
                this.onComplete(this.logic.getState());
            }
        });
    }
}

export default Stage3UI;
