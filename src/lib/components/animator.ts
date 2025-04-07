export interface AnimatorOptions {
    elem1: HTMLElement;
    elem2?: HTMLElement;
    rotateXSpeed?: number;
    rotateYSpeed?: number;
    rotateZSpeed?: number;
    rotateXAmmount?: number;
    rotateYAmmount?: number;
    rotateZAmmount?: number;
}

/**
 * Applies a continuous 3D rotation animation to two elements.
 * 
 * - The animation rotates the elements on the X, Y, and Z axes using sine wave functions to create a smooth, oscillating effect.
 * - The speed and amount of rotation for each axis can be customized via options.
 * 
 * @param {Object} options - The configuration options for the animation.
 * @param {HTMLElement} options.elem1 - The first element to animate.
 * @param {HTMLElement} options.elem2 - The second element to animate.
 * @param {number} [options.rotateXSpeed=3000] - The speed of the rotation along the X axis (in milliseconds for a full cycle).
 * @param {number} [options.rotateYSpeed=4000] - The speed of the rotation along the Y axis (in milliseconds for a full cycle).
 * @param {number} [options.rotateZSpeed=2500] - The speed of the rotation along the Z axis (in milliseconds for a full cycle).
 * @param {number} [options.rotateXAmmount=10] - The maximum rotation amount along the X axis (in degrees).
 * @param {number} [options.rotateYAmmount=10] - The maximum rotation amount along the Y axis (in degrees).
 * @param {number} [options.rotateZAmmount=2] - The maximum rotation amount along the Z axis (in degrees).
 * 
 * @returns {Function} A function that, when called, cancels the animation.
 */
export function cardAnimation({ 
    elem1, 
    elem2, 
    rotateXSpeed = 3000, 
    rotateYSpeed = 4000, 
    rotateZSpeed = 2500,
    rotateXAmmount = 10,
    rotateYAmmount = 10,
    rotateZAmmount = 2 }: AnimatorOptions) {

    let animationFrameId: number;
    let startTime = performance.now() + Math.random() * 10000;

    // Animation function
    function animate() {
        const time = performance.now() - startTime;

        const rotateX = rotateXAmmount * Math.sin(time / rotateXSpeed);   
        const rotateY = rotateYAmmount * Math.sin(time / rotateYSpeed);   
        const rotateZ = rotateZAmmount * Math.sin(time / rotateZSpeed);   

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
