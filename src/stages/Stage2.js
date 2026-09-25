// src/stages/Stage2.js
class MakeMooncake {
    constructor(config = {}) {
        this.cakeTemplates = config.cakeTemplates || [
            { id: 1, name: "Bánh Múa Lân & Chú Tễu" },
            { id: 2, name: "Bánh Hoa Sen" },
            { id: 3, name: "Bánh Chị Hằng" },
            { id: 4, name: "Bánh Thỏ Trông Trăng" },
            { id: 5, name: "Bánh Rước Đèn" },
        ];

        this.selectedTemplateIndex = 0;
        this.currentStep = 1;

        this.bakeConfigs = {
            bake1: {
                initialTemp: 100,
                bottomTemp: 100,
                targetTemp: 180,
                tempTolerance: 10,
                gaugeMin: 80,
                gaugeMax: 220,
                minBakeSeconds: 7 * 60,
                maxBakeSeconds: 9 * 60,
                displayTimeRange: "7 - 9 phút",
                maxOverheatDuration: 30,
                heatRate: 110,
                coolRate: 25,
            },
            bake2: {
                initialTemp: 100,
                bottomTemp: 0,
                targetTemp: 180,
                tempTolerance: 15,
                gaugeMin: 0,
                gaugeMax: 220,
                minBakeSeconds: 5 * 60,
                maxBakeSeconds: 7 * 60,
                displayTimeRange: "5 - 7 phút",
                maxOverheatDuration: 30,
                heatRate: 110,
                coolRate: 35,
            },
        };

        this.ovenVisual = "f1";
        this.ovenState = {
            temperature: 100,
            isHeating: false,
            timerStarted: false,
            virtualSeconds: 0,
            overheatAccumulatedTime: 0,
        };

        this.brushProgress = 0;
    }

    prevTemplate() {
        if (this.currentStep !== 1) return null;
        this.selectedTemplateIndex =
            (this.selectedTemplateIndex - 1 + this.cakeTemplates.length) %
            this.cakeTemplates.length;
        return this.getSelectedTemplate();
    }

    nextTemplate() {
        if (this.currentStep !== 1) return null;
        this.selectedTemplateIndex =
            (this.selectedTemplateIndex + 1) % this.cakeTemplates.length;
        return this.getSelectedTemplate();
    }

    getSelectedTemplate() {
        const item = this.cakeTemplates[this.selectedTemplateIndex];
        return {
            ...item,
            unbakedAsset: `/assets/images/stage2/mooncakes/unbaked/${item.id}.png`,
            baked1Asset: `/assets/images/stage2/mooncakes/baked1/${item.id}.png`,
            bakedAsset: `/assets/images/stage2/mooncakes/baked/${item.id}.png`,
        };
    }

    confirmTemplate() {
        if (this.currentStep !== 1) return false;
        this.currentStep = 2;
        this.resetOvenState();
        return true;
    }

    setOvenVisual(visualKey) {
        this.ovenVisual = visualKey;
    }

    getOvenVisualAsset() {
        return `/assets/images/stage2/forno_a_legna/${this.ovenVisual}.png`;
    }

    resetOvenState() {
        const config = this.getCurrentBakeConfig();
        const baseTemp = config ? config.initialTemp : 100;

        this.ovenState = {
            temperature: baseTemp,
            isHeating: false,
            timerStarted: false,
            virtualSeconds: 0,
            overheatAccumulatedTime: 0,
        };
    }

    getCurrentBakeConfig() {
        if (this.currentStep === 2) return this.bakeConfigs.bake1;
        if (this.currentStep === 4) return this.bakeConfigs.bake2;
        return null;
    }

    setHeating(isHeating) {
        this.ovenState.isHeating = isHeating;
        if (isHeating && !this.ovenState.timerStarted) {
            this.ovenState.timerStarted = true;
        }
    }

    updateOvenTick(dt) {
        const config = this.getCurrentBakeConfig();
        if (!config) return { status: "idle" };

        const target = config.targetTemp;
        const tolerance = config.tempTolerance;
        const minValid = target - tolerance;
        const maxValid = target + tolerance;
        const bottomLimit = config.bottomTemp;

        if (this.ovenState.isHeating) {
            this.ovenState.temperature += 110 * dt;
            if (this.ovenState.temperature > 220) {
                this.ovenState.temperature = 220;
            }
        } else {
            const coolRate = config.coolRate || 40;
            this.ovenState.temperature -= coolRate * dt;
            if (this.ovenState.temperature <= bottomLimit) {
                this.ovenState.temperature = bottomLimit;
            }
        }

        if (this.ovenState.timerStarted) {
            const inGreenRange =
                this.ovenState.temperature >= minValid &&
                this.ovenState.temperature <= maxValid;
            const timeSpeed = inGreenRange
                ? 30
                : this.ovenState.temperature < minValid
                  ? 10
                  : 1;
            this.ovenState.virtualSeconds += dt * timeSpeed;

            if (this.ovenState.temperature > maxValid) {
                this.ovenState.overheatAccumulatedTime += dt * timeSpeed;
                if (this.ovenState.overheatAccumulatedTime >= config.maxOverheatDuration) {
                    return this.triggerBakeFailure(
                        "Bánh bị cháy do nhiệt độ lò quá cao trong thời gian dài!",
                    );
                }
            }

            if (this.ovenState.virtualSeconds > config.maxBakeSeconds + 60) {
                return this.triggerBakeFailure("Bánh bị khét do để trong lò nướng quá lâu!");
            }

            if (!this.ovenState.isHeating && this.ovenState.temperature <= bottomLimit) {
                const finalSecs = this.ovenState.virtualSeconds;
                if (finalSecs >= config.minBakeSeconds && finalSecs <= config.maxBakeSeconds) {
                    return this.completeCurrentBake();
                } else if (finalSecs < config.minBakeSeconds) {
                    return this.triggerBakeFailure("Bánh chưa đủ độ chín do lấy ra quá sớm!");
                } else {
                    return this.triggerBakeFailure(
                        "Bánh bị khét do thời gian nướng quá thời gian quy định!",
                    );
                }
            }
        }

        return {
            status: "baking",
            temperature: this.ovenState.temperature,
            virtualSeconds: this.ovenState.virtualSeconds,
            targetTemp: config.targetTemp,
            tempTolerance: tolerance,
            isInTargetRange:
                this.ovenState.temperature >= minValid &&
                this.ovenState.temperature <= maxValid,
            displayRange: config.displayTimeRange,
            ovenVisual: this.ovenVisual,
            gaugeMin: config.gaugeMin,
            gaugeMax: config.gaugeMax,
        };
    }

    triggerBakeFailure(reason) {
        this.currentStep = 1;
        this.ovenVisual = "f1";
        this.resetOvenState();
        return {
            status: "failed",
            reason: reason,
        };
    }

    completeCurrentBake() {
        if (this.currentStep === 2) {
            this.currentStep = 3;
            this.brushProgress = 0;
            this.ovenVisual = "f2";
            return {
                status: "success",
                nextStep: 3,
                message: "Nướng lần 1 hoàn tất! Chuyển sang bước quét mặt bánh.",
            };
        } else if (this.currentStep === 4) {
            this.ovenVisual = "f2";
            return {
                status: "completed",
                cake: this.getSelectedTemplate(),
                message: "Bánh Trung Thu đã ra lò hoàn hảo!",
            };
        }
        return { status: "idle" };
    }

    updateBrushProgress(percentage) {
        if (this.currentStep !== 3) return 0;
        this.brushProgress = Math.min(100, Math.max(0, percentage));
        return this.brushProgress;
    }

    checkBrushCompletion() {
        if (this.currentStep !== 3) return { success: false, reason: "Sai bước" };
        const rounded = Math.round(this.brushProgress);
        if (rounded < 96) {
            return {
                success: false,
                progress: rounded,
                message:
                    "Lớp trứng chưa đều, cậu quét thêm các góc còn sót để vỏ bánh vàng đều nhé!",
            };
        }

        this.currentStep = 4;
        this.resetOvenState();
        return {
            success: true,
            progress: rounded,
            nextStep: 4,
            message: "Quét mặt bánh hoàn hảo! Đưa vào nướng lần 2.",
        };
    }

    getState() {
        return {
            currentStep: this.currentStep,
            selectedTemplate: this.getSelectedTemplate(),
            ovenVisual: this.ovenVisual,
            ovenState: { ...this.ovenState },
            brushProgress: this.brushProgress,
        };
    }
}

export default MakeMooncake;
