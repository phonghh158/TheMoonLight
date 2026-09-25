// src/stages/Stage3.js
class MakeTea {
    constructor() {
        this.step = 1;
        this.selectedTea = null;
        this.teaSpoons = 0;
        this.waterAmount = 0;
        this.shakeClicks = 0;
        this.teaResult = null;
        this.isShopping = false;

        this.teas = [
            {
                id: 1,
                name: "Trà xanh Thái Nguyên",
                brewMinutes: 3,
                img: "/assets/images/stage3/tea/1.png",
            },
            {
                id: 2,
                name: "Trà Ô Long",
                brewMinutes: 5,
                img: "/assets/images/stage3/tea/2.png",
            },
            {
                id: 3,
                name: "Trà hoa cúc",
                brewMinutes: 7,
                img: "/assets/images/stage3/tea/3.png",
            },
            { id: 4, name: "Hồng trà", brewMinutes: 0, img: "/assets/images/stage3/tea/4.png" },
        ];
    }

    fillRinseWater(dt) {
        if (this.waterAmount < 66) {
            this.waterAmount += dt * 35;
            if (this.waterAmount > 66) this.waterAmount = 66;
        }
        return this.waterAmount;
    }

    checkRinseWater() {
        return this.waterAmount >= 50;
    }

    recordShakeClick() {
        this.shakeClicks += 1;
        return this.shakeClicks;
    }

    drainWater(dt) {
        if (this.waterAmount > 0) {
            this.waterAmount -= dt * 50;
            if (this.waterAmount < 0) this.waterAmount = 0;
        }
        return this.waterAmount;
    }

    selectTea(id) {
        this.selectedTea = this.teas.find((t) => t.id === id);
        if (id === 4) {
            this.isShopping = true;
        }
        return this.selectedTea;
    }

    chooseTeaAmount(spoons) {
        this.teaSpoons = spoons;
    }

    fillAwakenWater(dt) {
        if (this.waterAmount < 30) {
            this.waterAmount += dt * 25;
            if (this.waterAmount > 30) this.waterAmount = 30;
        }
        return this.waterAmount;
    }

    checkAwakenWater() {
        return this.waterAmount >= 20;
    }

    fillBrewWater(dt) {
        if (this.waterAmount < 100) {
            this.waterAmount += dt * 35;
            if (this.waterAmount > 100) this.waterAmount = 100;
        }
        return this.waterAmount;
    }

    checkBrewWater() {
        return this.waterAmount >= 66 && this.waterAmount <= 96;
    }

    calculateTeaResult() {
        if (this.teaSpoons === 1 && this.waterAmount <= 75) {
            this.teaResult = {
                title: "Trà vừa",
                img: "/assets/images/stage3/final_teapot/final-teapot_1.png",
            };
        } else if (this.teaSpoons === 2 && this.waterAmount > 75) {
            this.teaResult = {
                title: "Trà vừa",
                img: "/assets/images/stage3/final_teapot/final-teapot_1.png",
            };
        } else if (this.teaSpoons === 2 && this.waterAmount <= 75) {
            this.teaResult = {
                title: "Trà đặc",
                img: "/assets/images/stage3/final_teapot/final-teapot_2.png",
            };
        } else {
            this.teaResult = {
                title: "Trà thanh",
                img: "/assets/images/stage3/final_teapot/final-teapot_3.png",
            };
        }
        return this.teaResult;
    }

    getState() {
        return {
            selectedTea: this.selectedTea,
            teaSpoons: this.teaSpoons,
            waterAmount: this.waterAmount,
            teaResult: this.teaResult,
            isShopping: this.isShopping,
        };
    }
}

export default MakeTea;
