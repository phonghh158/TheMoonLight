// src/stages/Stage4.js
class Stage4Logic {
    constructor(results = {}) {
        this.results = results;
        this.isCakeCut = false;

        const isShoppingTea =
            Boolean(this.results.stage3 && this.results.stage3.isShopping) ||
            Boolean(
                this.results.stage3 &&
                this.results.stage3.selectedTea &&
                this.results.stage3.selectedTea.id === 4,
            );

        this.isPurchasedTea = isShoppingTea;
        this.isTeaPoured = isShoppingTea; // Đã mua sẵn nên không cần rót
        this.teaWater = isShoppingTea ? 100 : 0;
        this.cutLines = [false, false, false, false];
    }

    getCakeAsset() {
        if (this.results.stage2 && this.results.stage2.selectedTemplate) {
            return this.results.stage2.selectedTemplate.bakedAsset;
        }
        return "/assets/images/stage2/mooncakes/baked/1.png";
    }

    getTeapotAsset() {
        if (this.isPurchasedTea) {
            return "/assets/images/stage4/wuja.png";
        }
        if (
            this.results.stage3 &&
            this.results.stage3.teaResult &&
            this.results.stage3.teaResult.img
        ) {
            return this.results.stage3.teaResult.img;
        }
        return "/assets/images/stage3/final_teapot/final-teapot_1.png";
    }

    cutLine(index) {
        if (index >= 0 && index < 4) {
            this.cutLines[index] = true;
            if (this.cutLines.every((line) => line === true)) {
                this.isCakeCut = true;
            }
        }
        return this.isCakeCut;
    }

    fillTeaWater(dt) {
        if (this.teaWater < 100) {
            this.teaWater += dt * 35;
            if (this.teaWater > 100) this.teaWater = 100;
        }
        return this.teaWater;
    }

    checkTeaPourDone() {
        if (this.teaWater >= 75) {
            this.isTeaPoured = true;
            return true;
        }
        return false;
    }

    isAllCompleted() {
        return this.isCakeCut && this.isTeaPoured;
    }
}

export default Stage4Logic;
