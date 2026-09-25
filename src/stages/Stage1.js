// src/stages/Stage1.js
class MakeLantern {
    constructor() {
        this.step = 1;

        this.star1Rods = [];
        this.star2Rods = [];

        this.star1TiedJoints = [];
        this.star2TiedJoints = [];

        this.connectedTips = [];

        this.currentSide = "front";
        this.paperColors = {
            front: {},
            back: {},
        };

        this.selectedSticker = null;
        this.isBraced = false;

        this.requiredRods = ["rod_1", "rod_2", "rod_3", "rod_4", "rod_5"];
        this.requiredJoints = [
            "tip_top",
            "tip_right",
            "tip_bottom_right",
            "tip_bottom_left",
            "tip_left",
            "inner_top_left",
            "inner_top_right",
            "inner_bottom_right",
            "inner_bottom",
            "inner_bottom_left",
        ];
        this.requiredTips = ["top", "right", "bottom_right", "bottom_left", "left"];
    }

    placeRod(starIndex, rodType) {
        if (this.step !== 1) return null;
        if (!this.requiredRods.includes(rodType)) return null;

        const targetList = starIndex === 1 ? this.star1Rods : this.star2Rods;
        if (targetList.includes(rodType)) return null;

        targetList.push(rodType);
        const zIndex = targetList.length;

        const isStar1Done = this.requiredRods.every((r) => this.star1Rods.includes(r));
        const isStar2Done = this.requiredRods.every((r) => this.star2Rods.includes(r));

        let isStepCompleted = false;
        if (isStar1Done && isStar2Done) {
            this.step = 2;
            isStepCompleted = true;
        }

        return {
            starIndex,
            rodType,
            zIndex,
            isStepCompleted,
        };
    }

    tieJoint(starIndex, jointId) {
        if (this.step !== 2) return null;
        if (!this.requiredJoints.includes(jointId)) return null;

        const targetList = starIndex === 1 ? this.star1TiedJoints : this.star2TiedJoints;
        if (targetList.includes(jointId)) return null;

        targetList.push(jointId);

        const isStar1Tied = this.requiredJoints.every((j) => this.star1TiedJoints.includes(j));
        const isStar2Tied = this.requiredJoints.every((j) => this.star2TiedJoints.includes(j));

        let isStepCompleted = false;
        if (isStar1Tied && isStar2Tied) {
            this.step = 3;
            isStepCompleted = true;
        }

        return {
            starIndex,
            jointId,
            isStepCompleted,
        };
    }

    connectTips(tip1, tip2) {
        if (this.step !== 3) return null;
        if (!this.requiredTips.includes(tip1) || !this.requiredTips.includes(tip2)) {
            return { success: false, message: "Đỉnh không hợp lệ!" };
        }

        // Nối cùng loại đỉnh giữa 2 khung (top - top, right - right,...)
        if (tip1 !== tip2) {
            return {
                success: false,
                message: "Nối sai đỉnh! Hãy nối cùng một đỉnh giữa 2 khung.",
            };
        }

        if (this.connectedTips.includes(tip1)) {
            return { success: false, message: "Đỉnh này đã được nối trước đó!" };
        }

        this.connectedTips.push(tip1);
        const isStepCompleted = this.requiredTips.every((t) => this.connectedTips.includes(t));

        if (isStepCompleted) {
            this.step = 4;
        }

        return {
            success: true,
            tip: tip1,
            isStepCompleted,
        };
    }

    setPaperSide(side) {
        if (side === "front" || side === "back") {
            this.currentSide = side;
            return true;
        }
        return false;
    }

    applyPaperToZone(zoneIndex, color) {
        if (this.step !== 4) return null;
        this.paperColors.front[zoneIndex] = color;
        this.paperColors.back[zoneIndex] = color;

        const isStepCompleted = Object.keys(this.paperColors.front).length === 6;
        if (isStepCompleted) {
            this.step = 5;
        }

        return {
            zoneIndex,
            color,
            isStepCompleted,
        };
    }

    applySticker(stickerName) {
        if (this.step !== 5) return null;
        this.selectedSticker = stickerName;
        return { stickerName };
    }

    skipOrConfirmSticker() {
        if (this.step === 5) {
            this.step = 6;
            return true;
        }
        return false;
    }

    finishBracing() {
        if (this.step === 6) {
            this.isBraced = true;
            return true;
        }
        return false;
    }

    getState() {
        return {
            step: this.step,
            star1Rods: this.star1Rods,
            star2Rods: this.star2Rods,
            connectedTips: this.connectedTips,
            paperColors: this.paperColors,
            selectedSticker: this.selectedSticker,
            isBraced: this.isBraced,
        };
    }
}

export default MakeLantern;
