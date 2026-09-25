// src/utils/DragDrop.js
class DragDrop {
    constructor() {
        this.activeElement = null;
        this.dragProxy = null;
        this.offset = { x: 0, y: 0 };
        this.dropZones = [];
        this.callbacks = {};

        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
    }

    makeDraggable(element, options = {}) {
        if (!element) return;

        element.style.touchAction = "none";
        element.style.userSelect = "none";

        element.addEventListener("pointerdown", (event) => {
            this.callbacks = options;
            this.activeElement = element;

            const rect = element.getBoundingClientRect();

            // Tạo proxy clone theo trỏ chuột nếu có callback hoặc dùng ảnh raw
            if (typeof this.callbacks.createProxy === "function") {
                this.dragProxy = this.callbacks.createProxy(element);
            } else {
                this.dragProxy = element.cloneNode(true);
            }

            this.dragProxy.style.position = "fixed";
            this.dragProxy.style.pointerEvents = "none";
            this.dragProxy.style.zIndex = "99999";
            this.dragProxy.style.left = `${rect.left}px`;
            this.dragProxy.style.top = `${rect.top}px`;
            document.body.appendChild(this.dragProxy);

            this.offset = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };

            element.setPointerCapture(event.pointerId);

            if (typeof this.callbacks.onStart === "function") {
                this.callbacks.onStart(element, event);
            }

            window.addEventListener("pointermove", this.onPointerMove);
            window.addEventListener("pointerup", this.onPointerUp);
        });
    }

    registerDropZone(element, id) {
        if (!element) return;
        this.dropZones.push({ element, id });
    }

    clearDropZones() {
        this.dropZones = [];
    }

    onPointerMove(event) {
        if (!this.dragProxy) return;

        const currentX = event.clientX - this.offset.x;
        const currentY = event.clientY - this.offset.y;

        this.dragProxy.style.left = `${currentX}px`;
        this.dragProxy.style.top = `${currentY}px`;

        if (typeof this.callbacks.onDrag === "function") {
            this.callbacks.onDrag(
                this.activeElement,
                { x: event.clientX, y: event.clientY },
                event,
            );
        }
    }

    onPointerUp(event) {
        if (!this.activeElement) return;

        window.removeEventListener("pointermove", this.onPointerMove);
        window.removeEventListener("pointerup", this.onPointerUp);

        const dropTarget = this.checkDropTarget(event.clientX, event.clientY);

        if (dropTarget && typeof this.callbacks.onDrop === "function") {
            this.callbacks.onDrop(this.activeElement, dropTarget);
        } else if (typeof this.callbacks.onCancel === "function") {
            this.callbacks.onCancel(this.activeElement);
        }

        if (this.dragProxy && this.dragProxy.parentNode) {
            this.dragProxy.parentNode.removeChild(this.dragProxy);
        }

        if (event.pointerId) {
            try {
                this.activeElement.releasePointerCapture(event.pointerId);
            } catch (_) {}
        }

        this.dragProxy = null;
        this.activeElement = null;
        this.callbacks = {};
    }

    checkDropTarget(clientX, clientY) {
        for (const zone of this.dropZones) {
            const rect = zone.element.getBoundingClientRect();
            const isInZone =
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom;

            if (isInZone) {
                return zone;
            }
        }
        return null;
    }
}

export default DragDrop;
