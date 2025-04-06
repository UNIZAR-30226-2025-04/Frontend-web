export interface AnimatorOptions {
    elem1: HTMLElement;
    elem2?: HTMLElement;
    rotateXSpeed?: number;
    rotateYSpeed?: number;
    rotateZSpeed?: number;
}

export function cardAnimation({ elem1, elem2, rotateXSpeed = 3000, rotateYSpeed = 4000, rotateZSpeed = 2500 }: AnimatorOptions) {
    let animationFrameId: number;
    let startTime = performance.now() + Math.random() * 10000;

    // Función de animación
    function animate() {
        const time = performance.now() - startTime;

        const rotateX = 10 * Math.sin(time / rotateXSpeed);   // 3s cycle
        const rotateY = 10 * Math.sin(time / rotateYSpeed);   // 4s cycle
        const rotateZ = 2 * Math.sin(time / rotateZSpeed);    // 2.5s cycle

        if (elem1) {
            elem1.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        }

        if (elem2) {
            elem2.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    
    animate();

    return () => cancelAnimationFrame(animationFrameId);
}
