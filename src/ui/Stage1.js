// src/ui/Stage1.js
import MakeLantern from "../stages/Stage1.js";
import DragDrop from "../utils/DragDrop.js";

class Stage1UI {
    constructor(container, onComplete) {
        this.container = container;
        this.onComplete = onComplete;
        this.logic = new MakeLantern();
        this.dragDrop = new DragDrop();

        this.selectedTip = null;
        this.selectedColor = null;
        this.isStringSelected = false;
        this.guideTimeout = null;

        this.stepInstructions = {
            1: "Lắp khung lồng đèn",
            2: "Buộc khung lồng đèn",
            3: "Buộc các đỉnh của 2 khung lồng đèn",
            4: "Dán giấy cho lồng đèn",
            5: "Chọn sticker trang trí",
            6: "Đang gắn thanh chống lồng đèn...",
        };

        const SCALE = 500 / 360;

        this.rodConfig = [
            {
                id: 1,
                name: "rod_1",
                raw: "/assets/images/stage1/rods/raws/rod_1.png",
                mat: "/assets/images/stage1/rods/materials/rod_1.png",
                x1: Math.round(98 * SCALE),
                y1: Math.round(301 * SCALE),
                x2: Math.round(180 * SCALE),
                y2: Math.round(52 * SCALE),
                box: {
                    left: `${Math.round(95 * SCALE)}px`,
                    top: `${Math.round(50 * SCALE)}px`,
                    width: `${Math.round(88 * SCALE)}px`,
                    height: `${Math.round(254 * SCALE)}px`,
                },
            },
            {
                id: 2,
                name: "rod_2",
                raw: "/assets/images/stage1/rods/raws/rod_2.png",
                mat: "/assets/images/stage1/rods/materials/rod_2.png",
                x1: Math.round(180 * SCALE),
                y1: Math.round(52 * SCALE),
                x2: Math.round(262 * SCALE),
                y2: Math.round(301 * SCALE),
                box: {
                    left: `${Math.round(177 * SCALE)}px`,
                    top: `${Math.round(50 * SCALE)}px`,
                    width: `${Math.round(88 * SCALE)}px`,
                    height: `${Math.round(254 * SCALE)}px`,
                },
            },
            {
                id: 3,
                name: "rod_3",
                raw: "/assets/images/stage1/rods/raws/rod_3.png",
                mat: "/assets/images/stage1/rods/materials/rod_3.png",
                x1: Math.round(44 * SCALE),
                y1: Math.round(150 * SCALE),
                x2: Math.round(330 * SCALE),
                y2: Math.round(150 * SCALE),
                box: {
                    left: `${Math.round(40 * SCALE)}px`,
                    top: `${Math.round(138 * SCALE)}px`,
                    width: `${Math.round(294 * SCALE)}px`,
                    height: `${Math.round(24 * SCALE)}px`,
                },
            },
            {
                id: 4,
                name: "rod_4",
                raw: "/assets/images/stage1/rods/raws/rod_4.png",
                mat: "/assets/images/stage1/rods/materials/rod_4.png",
                x1: Math.round(98 * SCALE),
                y1: Math.round(301 * SCALE),
                x2: Math.round(330 * SCALE),
                y2: Math.round(150 * SCALE),
                box: {
                    left: `${Math.round(96 * SCALE)}px`,
                    top: `${Math.round(144 * SCALE)}px`,
                    width: `${Math.round(236 * SCALE)}px`,
                    height: `${Math.round(160 * SCALE)}px`,
                },
            },
            {
                id: 5,
                name: "rod_5",
                raw: "/assets/images/stage1/rods/raws/rod_5.png",
                mat: "/assets/images/stage1/rods/materials/rod_5.png",
                x1: Math.round(44 * SCALE),
                y1: Math.round(150 * SCALE),
                x2: Math.round(262 * SCALE),
                y2: Math.round(301 * SCALE),
                box: {
                    left: `${Math.round(42 * SCALE)}px`,
                    top: `${Math.round(144 * SCALE)}px`,
                    width: `${Math.round(236 * SCALE)}px`,
                    height: `${Math.round(160 * SCALE)}px`,
                },
            },
        ];

        this.joints = [
            {
                id: "tip_top",
                x: Math.round(180 * SCALE),
                y: Math.round(60 * SCALE),
                type: "tip",
            },
            {
                id: "tip_right",
                x: Math.round(320 * SCALE),
                y: Math.round(154 * SCALE),
                type: "tip",
            },
            {
                id: "tip_bottom_right",
                x: Math.round(264 * SCALE),
                y: Math.round(292 * SCALE),
                type: "tip",
            },
            {
                id: "tip_bottom_left",
                x: Math.round(104 * SCALE),
                y: Math.round(292 * SCALE),
                type: "tip",
            },
            {
                id: "tip_left",
                x: Math.round(54 * SCALE),
                y: Math.round(154 * SCALE),
                type: "tip",
            },
            {
                id: "inner_top_left",
                x: Math.round(147 * SCALE),
                y: Math.round(150 * SCALE),
                type: "inner",
            },
            {
                id: "inner_top_right",
                x: Math.round(213 * SCALE),
                y: Math.round(150 * SCALE),
                type: "inner",
            },
            {
                id: "inner_bottom_right",
                x: Math.round(232 * SCALE),
                y: Math.round(210 * SCALE),
                type: "inner-large",
            },
            {
                id: "inner_bottom",
                x: Math.round(186 * SCALE),
                y: Math.round(240 * SCALE),
                type: "inner-large",
            },
            {
                id: "inner_bottom_left",
                x: Math.round(130 * SCALE),
                y: Math.round(204 * SCALE),
                type: "inner-large",
            },
        ];

        this.colorMaterials = [
            {
                id: "gold",
                name: "Vàng",
                icon: "/assets/images/stage1/papers/paper_gold.png",
                pattern: "/assets/images/stage1/colors/gold.png",
            },
            {
                id: "green",
                name: "Xanh lá",
                icon: "/assets/images/stage1/papers/paper_green.png",
                pattern: "/assets/images/stage1/colors/green.png",
            },
            {
                id: "pink",
                name: "Hồng",
                icon: "/assets/images/stage1/papers/paper_pink.png",
                pattern: "/assets/images/stage1/colors/pink.png",
            },
            {
                id: "purple",
                name: "Tím",
                icon: "/assets/images/stage1/papers/paper_purple.png",
                pattern: "/assets/images/stage1/colors/purple.png",
            },
        ];

        this.initDOM();
        this.bindEvents();
        this.triggerGuide(this.stepInstructions[1]);

        // Test
        window.stage1 = this;
        window.addEventListener("keydown", (e) => {
            const num = Number(e.key);
            if (num >= 1 && num <= 6) {
                this.jumpToStep(num);
            }
        });
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

    initDOM() {
        const createStarBox = (starIndex) => `
            <div class="star-assembly-box" id="star-box-${starIndex}">
                <svg class="star-canvas-svg" viewBox="0 0 500 500">
                    <g id="dashed-group-${starIndex}">
                        ${this.rodConfig
                            .map(
                                (r) => `
                            <line class="dashed-line dashed-${r.name}" data-rod="${r.name}" x1="${r.x1}" y1="${r.y1}" x2="${r.x2}" y2="${r.y2}" />
                        `,
                            )
                            .join("")}
                    </g>
                </svg>
                <div class="rods-layer" id="rods-layer-${starIndex}"></div>
                <div class="joints-layer" id="joints-layer-${starIndex}">
                    ${this.joints
                        .map(
                            (j) => `
                        <div class="joint-node" data-joint="${j.id}" data-type="${j.type}" data-star="${starIndex}" style="left: ${j.x}px; top:${j.y}px;">
                            <span class="tie-wrap-h"></span>
                            <span class="tie-wrap-d1"></span>
                            <span class="tie-wrap-d2"></span>
                        </div>
                    `,
                        )
                        .join("")}
                </div>
            </div>
        `;

        this.container.innerHTML = `
            <div class="stage1-wrapper">
                <button class="guide-trigger-btn" id="btn-show-guide" type="button">?</button>

                <div class="workspace-card">
                    <div class="stars-container" id="stars-container">
                        <div class="star-frame" id="star-frame-1" data-star="1">
                            ${createStarBox(1)}
                        </div>
                        <div class="star-frame" id="star-frame-2" data-star="2">
                            ${createStarBox(2)}
                        </div>
                    </div>

                    <div class="paper-star-container hidden" id="paper-star-container">
                        <div class="side-controls">
                            <button class="dock-btn active" id="btn-side-front">Mặt trước</button>
                            <button class="dock-btn" id="btn-side-back">Mặt sau</button>
                        </div>
                        <div class="star-paper-mount">
                            <img src="/assets/images/stage1/star_frame.png" class="star-overlay-frame" alt="Khung sao" />
                            <svg class="paper-svg" viewBox="0 0 500 500">
                                <defs>
                                    ${this.colorMaterials
                                        .map(
                                            (c) => `
                                        <pattern id="pat-${c.id}" patternUnits="userSpaceOnUse" width="500" height="500">
                                            <image href="${c.pattern}" x="0" y="0" width="500" height="500" preserveAspectRatio="none" />
                                        </pattern>
                                    `,
                                        )
                                        .join("")}
                                </defs>
                                <polygon class="paper-section" data-zone="1" points="250,48 304,190 194,190" />
                                <polygon class="paper-section" data-zone="2" points="450,190 304,190 334,288" />
                                <polygon class="paper-section" data-zone="3" points="384,448 334,288 250,352" />
                                <polygon class="paper-section" data-zone="4" points="110,452 250,352 168,288" />
                                <polygon class="paper-section" data-zone="5" points="48,190 168,288 194,190" />
                                <polygon class="paper-section" data-zone="6" points="194,190 304,190 334,288 250,352 168,288" />
                            </svg>
                            <div class="sticker-mount" id="sticker-mount"></div>
                        </div>
                    </div>

                    <div class="cutscene-box hidden" id="cutscene-box">
                        <div class="cutscene-label">Đang gắn thanh chống lồng đèn...</div>
                        <img src="/assets/images/stage1/star_frame.png" class="lantern-complete-img" alt="Khung lồng đèn" />
                        <button class="dock-btn hidden" id="btn-finish-stage1">Tiếp tục sang Stage 2</button>
                    </div>
                </div>

                <div class="bottom-dock">
                    <div class="dock-group" id="dock-rods">
                        ${this.rodConfig
                            .map(
                                (r) => `
                            <div class="material-slot" data-rod="${r.name}" data-raw="${r.raw}">
                                <img src="${r.mat}" alt="${r.name}" class="material-img" />
                            </div>
                        `,
                            )
                            .join("")}
                    </div>

                    <div class="dock-group hidden" id="dock-string">
                        <div class="material-slot string-slot" id="string-source" data-raw="/assets/images/stage1/string_roll.png">
                            <img src="/assets/images/stage1/string_roll.png" alt="Dây buộc" class="material-img" />
                        </div>
                    </div>

                    <div class="dock-group hidden" id="dock-colors">
                        ${this.colorMaterials
                            .map(
                                (c) => `
                            <div class="material-slot paper-slot" data-color="${c.id}">
                                <img src="${c.icon}" alt="${c.name}" class="material-img" />
                            </div>
                        `,
                            )
                            .join("")}
                    </div>

                    <div class="dock-group hidden" id="dock-stickers">
                        <div class="material-slot btn-sticker" data-sticker="sticker_rabbit_angel">
                            <img src="/assets/images/stage1/stickers/sticker_rabbit_angel.png" alt="Thỏ thiên thần" class="material-img" />
                        </div>
                        <div class="material-slot btn-sticker" data-sticker="sticker_rabbit_in_the_moon">
                            <img src="/assets/images/stage1/stickers/sticker_rabbit_in_the_moon.png" alt="Thỏ ngắm trăng" class="material-img" />
                        </div>
                        <div class="material-slot btn-sticker" data-sticker="sticker_rabbit_mooncake">
                            <img src="/assets/images/stage1/stickers/sticker_rabbit_mooncake.png" alt="Thỏ bánh nướng" class="material-img" />
                        </div>
                        <button class="dock-btn" id="btn-confirm-sticker">Xong</button>
                    </div>
                </div>
            </div>
        `;

        this.guideBtn = this.container.querySelector("#btn-show-guide");
        this.starsContainer = this.container.querySelector("#stars-container");
        this.starFrame1 = this.container.querySelector("#star-frame-1");
        this.starFrame2 = this.container.querySelector("#star-frame-2");
        this.rodsLayer1 = this.container.querySelector("#rods-layer-1");
        this.rodsLayer2 = this.container.querySelector("#rods-layer-2");
        this.jointsLayer1 = this.container.querySelector("#joints-layer-1");
        this.jointsLayer2 = this.container.querySelector("#joints-layer-2");

        this.paperContainer = this.container.querySelector("#paper-star-container");
        this.btnSideFront = this.container.querySelector("#btn-side-front");
        this.btnSideBack = this.container.querySelector("#btn-side-back");
        this.stickerMount = this.container.querySelector("#sticker-mount");

        this.cutsceneBox = this.container.querySelector("#cutscene-box");
        this.btnFinishStage1 = this.container.querySelector("#btn-finish-stage1");

        this.dockRods = this.container.querySelector("#dock-rods");
        this.dockString = this.container.querySelector("#dock-string");
        this.stringSource = this.container.querySelector("#string-source");
        this.dockColors = this.container.querySelector("#dock-colors");
        this.dockStickers = this.container.querySelector("#dock-stickers");
        this.btnConfirmSticker = this.container.querySelector("#btn-confirm-sticker");
    }

    handleTieJoint(starIndex, jointId) {
        const res = this.logic.tieJoint(starIndex, jointId);
        if (res) {
            const jointsLayer = starIndex === 1 ? this.jointsLayer1 : this.jointsLayer2;
            const node = jointsLayer.querySelector(`[data-joint="${res.jointId}"]`);
            if (node) node.classList.add("tied");

            if (res.isStepCompleted) {
                this.setupStep3();
            }
            return true;
        }
        return false;
    }

    bindEvents() {
        this.guideBtn.addEventListener("click", () => {
            this.triggerGuide(this.stepInstructions[this.logic.step]);
        });

        this.dragDrop.registerDropZone(this.starFrame1, 1);
        this.dragDrop.registerDropZone(this.starFrame2, 2);

        this.dockRods.querySelectorAll(".material-slot").forEach((slot) => {
            this.dragDrop.makeDraggable(slot, {
                createProxy: (el) => {
                    const img = document.createElement("img");
                    img.src = el.dataset.raw;
                    img.className = "drag-proxy-raw";
                    return img;
                },
                onDrop: (element, target) => {
                    const starIndex = Number(target.id);
                    const rodType = element.dataset.rod;
                    const res = this.logic.placeRod(starIndex, rodType);

                    if (res) {
                        const targetLayer = starIndex === 1 ? this.rodsLayer1 : this.rodsLayer2;
                        const rodData = this.rodConfig.find((r) => r.name === rodType);

                        const dashedLine = target.element.querySelector(
                            `line.dashed-${rodType}`,
                        );
                        if (dashedLine) {
                            dashedLine.style.display = "none";
                        }

                        const placedImg = document.createElement("img");
                        placedImg.src = rodData.raw;
                        placedImg.className = "placed-rod-img";
                        placedImg.style.left = rodData.box.left;
                        placedImg.style.top = rodData.box.top;
                        placedImg.style.width = rodData.box.width;
                        placedImg.style.height = rodData.box.height;
                        placedImg.style.zIndex = res.zIndex;
                        targetLayer.appendChild(placedImg);

                        const done1 = this.logic.star1Rods.includes(rodType);
                        const done2 = this.logic.star2Rods.includes(rodType);
                        if (done1 && done2) {
                            element.style.opacity = "0.2";
                            element.style.pointerEvents = "none";
                        }

                        if (res.isStepCompleted) {
                            this.setupStep2();
                        }
                        return true;
                    }
                    return false;
                },
            });
        });

        // Step 2: Chọn cuộn dây ở dock
        this.stringSource.addEventListener("click", () => {
            if (this.logic.step !== 2) return;
            this.isStringSelected = !this.isStringSelected;
            if (this.isStringSelected) {
                this.stringSource.classList.add("selected");
                document.body.classList.add("string-cursor");
            } else {
                this.stringSource.classList.remove("selected");
                document.body.classList.remove("string-cursor");
            }
        });

        // Step 2: Click trực tiếp vào khớp để buộc
        const setupJointClickForStar = (layer, starIndex) => {
            layer.querySelectorAll(".joint-node").forEach((node) => {
                node.addEventListener("click", () => {
                    if (this.logic.step === 2) {
                        if (!this.isStringSelected) {
                            this.triggerGuide("Hãy chọn cuộn dây ở bên dưới trước!");
                            return;
                        }
                        const jointId = node.dataset.joint;
                        this.handleTieJoint(starIndex, jointId);
                    }
                });
            });
        };
        setupJointClickForStar(this.jointsLayer1, 1);
        setupJointClickForStar(this.jointsLayer2, 2);

        this.btnSideFront.addEventListener("click", () => {
            this.logic.setPaperSide("front");
            this.btnSideFront.classList.add("active");
            this.btnSideBack.classList.remove("active");
            this.updatePaperVisuals();
        });

        this.btnSideBack.addEventListener("click", () => {
            this.logic.setPaperSide("back");
            this.btnSideBack.classList.add("active");
            this.btnSideFront.classList.remove("active");
            this.updatePaperVisuals();
        });

        this.dockColors.querySelectorAll(".paper-slot").forEach((slot) => {
            slot.addEventListener("click", () => {
                this.dockColors
                    .querySelectorAll(".paper-slot")
                    .forEach((s) => s.classList.remove("selected"));
                slot.classList.add("selected");
                this.selectedColor = slot.dataset.color;
            });
        });

        this.paperContainer.querySelectorAll(".paper-section").forEach((sec) => {
            sec.addEventListener("click", () => {
                if (!this.selectedColor) {
                    this.triggerGuide("Hãy chọn một loại giấy ở bên dưới trước!");
                    return;
                }
                const zIndex = Number(sec.dataset.zone);
                const res = this.logic.applyPaperToZone(zIndex, this.selectedColor);
                if (res) {
                    sec.style.fill = `url(#pat-${this.selectedColor})`;
                    const isFrontCompleted =
                        Object.keys(this.logic.paperColors.front).length === 6;
                    if (res.isStepCompleted || isFrontCompleted) {
                        this.setupStep5();
                    }
                }
            });
        });

        this.dockStickers.querySelectorAll(".btn-sticker").forEach((btn) => {
            btn.addEventListener("click", () => {
                this.dockStickers
                    .querySelectorAll(".btn-sticker")
                    .forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                const stickerName = btn.dataset.sticker;
                this.logic.applySticker(stickerName);
                this.stickerMount.innerHTML = `<img src="/assets/images/stage1/stickers/${stickerName}.png" class="mounted-sticker" />`;
            });
        });

        this.btnConfirmSticker.addEventListener("click", () => {
            this.logic.skipOrConfirmSticker();
            this.setupStep6();
        });

        this.btnFinishStage1.addEventListener("click", () => {
            if (typeof this.onComplete === "function") {
                this.onComplete(this.logic.getState());
            }
        });
    }

    setupStep2() {
        this.triggerGuide(this.stepInstructions[2]);
        this.dockRods.classList.add("hidden");
        this.dockString.classList.remove("hidden");

        this.jointsLayer1
            .querySelectorAll(".joint-node")
            .forEach((n) => n.classList.add("clickable-joint"));
        this.jointsLayer2
            .querySelectorAll(".joint-node")
            .forEach((n) => n.classList.add("clickable-joint"));
    }

    setupStep3() {
        this.triggerGuide(this.stepInstructions[3]);
        this.dockString.classList.add("hidden");
        this.isStringSelected = false;
        document.body.classList.remove("string-cursor");

        const tipsMap = {
            tip_top: "top",
            tip_right: "right",
            tip_bottom_right: "bottom_right",
            tip_bottom_left: "bottom_left",
            tip_left: "left",
        };

        this.selectedSource = null;

        const setupConnectForStar = (layer, starIndex) => {
            Object.keys(tipsMap).forEach((jointId) => {
                const node = layer.querySelector(`[data-joint="${jointId}"]`);
                if (!node) return;
                node.classList.remove("clickable-joint");
                node.classList.add("tip-connectable");

                node.addEventListener("click", () => {
                    if (this.logic.step !== 3) return;
                    if (node.classList.contains("tip-matched")) return;

                    const tipType = tipsMap[jointId];

                    if (!this.selectedSource) {
                        this.selectedSource = { starIndex, tipType, node };
                        node.classList.add("tip-picked");
                        return;
                    }

                    if (this.selectedSource.starIndex === starIndex) {
                        this.selectedSource.node.classList.remove("tip-picked");
                        if (this.selectedSource.tipType === tipType) {
                            this.selectedSource = null;
                        } else {
                            this.selectedSource = { starIndex, tipType, node };
                            node.classList.add("tip-picked");
                        }
                        return;
                    }

                    if (this.selectedSource.tipType !== tipType) {
                        this.triggerGuide("Nối sai đỉnh! Hãy nối cùng một đỉnh giữa 2 khung.");
                        return;
                    }

                    const res = this.logic.connectTips(tipType, tipType);

                    if (res && res.success) {
                        node.classList.add("tip-matched");
                        this.selectedSource.node.classList.remove("tip-picked");
                        this.selectedSource.node.classList.add("tip-matched");
                        this.selectedSource = null;

                        if (res.isStepCompleted) {
                            this.playMerge();
                        }
                    } else {
                        this.triggerGuide(res ? res.message : "Nối sai đỉnh!");
                    }
                });
            });
        };

        setupConnectForStar(this.jointsLayer1, 1);
        setupConnectForStar(this.jointsLayer2, 2);
    }

    playMerge() {
        this.starFrame1.classList.add("merge-center-left");
        this.starFrame2.classList.add("merge-center-right");

        setTimeout(() => {
            this.setupStep4();
        }, 900);
    }

    setupStep4() {
        this.triggerGuide(this.stepInstructions[4]);
        this.starsContainer.classList.add("hidden");
        this.paperContainer.classList.remove("hidden");
        this.dockColors.classList.remove("hidden");
        this.updatePaperVisuals();
    }

    updatePaperVisuals() {
        const sideData = this.logic.paperColors[this.logic.currentSide];
        this.paperContainer.querySelectorAll(".paper-section").forEach((sec) => {
            const zId = Number(sec.dataset.zone);
            sec.style.fill = sideData[zId]
                ? `url(#pat-${sideData[zId]})`
                : "rgba(241, 241, 241, 0.05)";
        });
    }

    setupStep5() {
        this.triggerGuide(this.stepInstructions[5]);
        this.dockColors.classList.add("hidden");
        this.dockStickers.classList.remove("hidden");
    }

    // src/ui/Stage1.js
    setupStep6() {
        this.triggerGuide(this.stepInstructions[6]);
        this.paperContainer.classList.add("hidden");
        this.dockStickers.classList.add("hidden");
        this.cutsceneBox.classList.remove("hidden");

        const frontColors = this.logic.paperColors.front;
        const stickerName = this.logic.selectedSticker;

        const c1 = frontColors[1] || "pink";
        const c2 = frontColors[2] || "purple";
        const c3 = frontColors[3] || "green";
        const c4 = frontColors[4] || "purple";
        const c5 = frontColors[5] || "green";
        const c6 = frontColors[6] || "gold";

        this.cutsceneBox.innerHTML = `
            <div class="cutscene-label">Chiếc lồng đèn của cậu đã hoàn thành!</div>
            <div class="final-lantern-assembly">
                <div class="final-star-container">
                    <!-- Khung nan tre 3D -->
                    <img src="/assets/images/stage1/final_frame.png" class="final-frame-img" alt="Khung lồng đèn" />

                    <!-- Gộp chung gậy rước, dây đỏ và lồng đèn vào một SVG 500x620 duy nhất -->
                    <svg class="final-star-svg" viewBox="0 0 500 620">
                        <defs>
                            ${this.colorMaterials
                                .map(
                                    (c) => `
                                <pattern id="fin-pat-${c.id}" patternUnits="userSpaceOnUse" width="500" height="500">
                                    <image href="${c.pattern}" x="0" y="0" width="720" height="720" preserveAspectRatio="none" />
                                </pattern>
                            `,
                                )
                                .join("")}
                            <linearGradient id="stickBambooGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#8a4f1d" />
                                <stop offset="35%" stop-color="#d39e55" />
                                <stop offset="70%" stop-color="#f5cd79" />
                                <stop offset="100%" stop-color="#8a4f1d" />
                            </linearGradient>
                            <filter id="caneShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.4)" />
                            </filter>
                        </defs>

                        <!-- Cán gậy rước đèn (đặt ở phần trống 120px phía trên cùng) -->
                        <line x1="160" y1="35" x2="360" y2="45" stroke="url(#stickBambooGrad)" stroke-width="11" stroke-linecap="round" filter="url(#caneShadow)" />
                        
                        <!-- Nút buộc lạt đỏ trên cán gậy -->
                        <rect x="315" y="36" width="10" height="10" rx="2" fill="#c0392b" transform="rotate(5 320 41)" />
                        
                        <!-- Dây treo màu đỏ kết nối khít khao từ cán gậy (320, 41) xuống thẳng chóp buộc lồng đèn (248, 124) -->
                        <path d="M 320 41 L 248 124" fill="none" stroke="#d63031" stroke-width="3" stroke-linecap="round" />
                        <circle cx="248" cy="124" r="4.5" fill="#c0392b" />

                        <!-- Tịnh tiến Y + 120px cho toàn bộ 5 cánh để khớp tuyệt đối với chóp dây (248, 124) -->
                        <g class="lantern-polygons">
                            <!-- Khung sao phía trước -->
                            <polygon points="248,124 160,318 280,320" fill="url(#fin-pat-${c1})" stroke-width="2" />
                            <polygon points="490,320 280,320 314,434" fill="url(#fin-pat-${c2})" stroke-width="2" />
                            <polygon points="394,612 314,434 214,504" fill="url(#fin-pat-${c3})" stroke-width="2" />
                            <polygon points="98,602 214,504 126,430" fill="url(#fin-pat-${c4})" stroke-width="2" />
                            <polygon points="12,314 126,430 160,318" fill="url(#fin-pat-${c5})" stroke-width="2" />
                            <polygon points="160,318 280,320 314,434 214,504 126,430" fill="url(#fin-pat-${c6})" stroke-width="2" />

                            <!-- Phần còn lại -->
                            <polygon points="248,124 330,294 280,320" fill="url(#fin-pat-${c1})" stroke-width="2" />
                            <polygon points="490,320 280,320 330,294" fill="url(#fin-pat-${c2})" stroke-width="2" />
                            <polygon points="490,320 370,434 314,434" fill="url(#fin-pat-${c2})" stroke-width="2" />
                            <polygon points="394,612 314,434 370,434" fill="url(#fin-pat-${c3})" stroke-width="2" />
                            <polygon points="98,602 214,504 238,522 172,562 116,596" fill="url(#fin-pat-${c4})" stroke-width="2" />
                            <polygon points="12,314 170,292 160,318" fill="url(#fin-pat-${c5})" stroke-width="2" />

                            <!-- Phần dư không đáng kể -->
                            <polygon points="248,124 160,318 240,128" fill="url(#fin-pat-${c1})" stroke-width="2" />
                            <polygon points="394,612 214,504 238,522 300,562 386,608" fill="url(#fin-pat-${c3})" stroke-width="2" />
                            <polygon points="98,600 126,430 124,428 106,524" fill="url(#fin-pat-${c4})" stroke-width="2" />
                            <polygon points="12,314 170,292 44,306 36,308 28,310 20,312" fill="url(#fin-pat-${c5})" stroke-width="2" />
                        </g>
                    </svg>

                    <!-- Sticker định vị chính xác ở tâm lồng đèn có mốc tịnh tiến Y (+120px) -->
                    ${
                        stickerName
                            ? `
                        <div class="final-sticker-mount">
                            <img src="/assets/images/stage1/stickers/${stickerName}.png" alt="Sticker" />
                        </div>
                    `
                            : ""
                    }
                </div>
            </div>
            <button class="dock-btn" id="btn-finish-stage1">Tiếp tục sang Stage 2</button>
        `;

        this.btnFinishStage1 = this.cutsceneBox.querySelector("#btn-finish-stage1");
        this.btnFinishStage1.addEventListener("click", () => {
            if (typeof this.onComplete === "function") {
                this.onComplete(this.logic.getState());
            }
        });
    }
}

export default Stage1UI;
