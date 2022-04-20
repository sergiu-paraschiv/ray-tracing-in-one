import React from 'react';
import { faker } from '@faker-js/faker';

import './App.css';
import {
    Canvas,
    Renderer,
    World,
    Material,
    Color,
    Sphere,
    Point,
    Camera
} from './rtx-webgpu';


const WIDTH = 912; // 228 /  456 / 912
const HEIGHT = 576; // 144 / 288 / 576

faker.seed(1);
const world = new World();

let groundMaterial = Material.lambertian(new Color(0.5, 0.5, 0.5));
world.addMaterial(groundMaterial);
world.addSphere(new Sphere(new Point( 0.0,  -1000.0,   0.0), 1000.0), groundMaterial);

let lightMaterial = Material.difuseLight(new Color(4.0, 4.0, 4.0));
world.addMaterial(lightMaterial);
world.addSphere(new Sphere(new Point( 0.0,  20.0,   0.0), 3.0), lightMaterial);

for (let a = -3; a <= 3; a += 3) {
    for (let b = -3; b <= 3; b += 3) {
        let materialType = faker.datatype.number({ min: 1, max: 10 });
        let color = new Color(
            faker.datatype.float({ min: 0, max: 1, precision: 0.1 }),
            faker.datatype.float({ min: 0, max: 1, precision: 0.1 }),
            faker.datatype.float({ min: 0, max: 1, precision: 0.1 })
        );

        let material: Material;
        if (materialType < 6) {
            material = Material.lambertian(color);
        }
        else if (materialType < 8) {
            material = Material.metal(color);
        }
        else {
            material = Material.dielectric(
                1.2
            );
        }

        const radius = faker.datatype.float({ min: 0.4, max: 1.2, precision: 0.1 });
        const center = new Point(
            a + 0.3 * faker.datatype.float({ min: -1, max: 1, precision: 0.1 }),
            radius,
            b + 0.3 * faker.datatype.float({ min: -1, max: 1, precision: 0.1 })
        );

        world.addMaterial(material);
        world.addSphere(new Sphere(center, radius), material);
    }
}

const camera = new Camera(
    new Point(5.0, 2.0, 3.0),
    new Point(0.0, 0.0, 0.0),
    90.0,
    0.1,
    5.0
);

const renderer = new Renderer(
    WIDTH,
    HEIGHT,
    world,
    camera
);

export default function App() {
    const fpsElement = React.createRef<HTMLDivElement>();
    const [ initialized, setInitialized ] = React.useState(false);

    React.useEffect(() => {
        let animationFrame: ReturnType<typeof requestAnimationFrame> | undefined;

        if (fpsElement.current && initialized) {
            let then = 0;
            let totalFPS = 0;
            const frameTimes: number[] = [];
            let frameCursor = 0;
            let numFrames = 0;
            const maxFrames = 20;
            let frameIndex = 0;

            const render = (now: number) => {
                now *= 0.001;
                const deltaTime = now - then;
                then = now;
                const fps = 1 / deltaTime;

                if (fpsElement.current) {
                    fpsElement.current.textContent = fps.toFixed(1);
                }

                totalFPS += fps - (frameTimes[frameCursor] || 0);
                frameTimes[frameCursor++] = fps;
                numFrames = Math.max(numFrames, frameCursor);
                frameCursor %= maxFrames;

                const averageFPS = totalFPS / numFrames;

                if (fpsElement.current) {
                    fpsElement.current.textContent += ' / ' + averageFPS.toFixed(1);
                }

                renderer.render(frameIndex);
                frameIndex += 1;
                if (frameIndex > Number.MAX_SAFE_INTEGER) {
                    frameIndex = 0;
                }
                animationFrame = requestAnimationFrame(render);
            };

            animationFrame = requestAnimationFrame(render);
        }

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [ fpsElement.current, initialized ]);

    React.useEffect(() => {
        let mouseDown = false;
        let initialLookFrom = camera.lookFrom;
        let initialPointerX = 0;
        let initialPointerY = 0;

        const mouseDownListener = (event: MouseEvent): void => {
            initialPointerX = event.offsetX;
            initialPointerY = event.offsetY;
            initialLookFrom = camera.lookFrom;
            mouseDown = true;
        };

        const mouseUpListener = (event: MouseEvent): void => {
            mouseDown = false;
            initialLookFrom = camera.lookFrom;
        };

        const mouseMoveListener = (event: MouseEvent): void => {
            if (mouseDown) {
                const deltaX = (event.offsetX - initialPointerX) * 3;
                const deltaY = (event.offsetY - initialPointerY) * 3;

                const radsPerWidth = (180 / (180 / Math.PI)) / document.documentElement.clientWidth;
                const lng = deltaX * radsPerWidth;
                const lat = deltaY * radsPerWidth * (document.documentElement.clientWidth / document.documentElement.clientHeight);

                camera.lookFrom = initialLookFrom;

                const targetDelta = camera.lookFrom.subtract(camera.lookAt);
                const [ r, currentLat, currentLng ] = cartesianToLatLng(targetDelta);

                const newLat = clamp(currentLat + lat, -Math.PI/2, Math.PI/2);
                const newLng = currentLng - lng;
                camera.lookFrom = latLngToCartesian(r, newLat, newLng);
            }
        };

        const wheelListener = (event: WheelEvent): void => {
            const delta = event.deltaY / 1000;

            const targetDelta = camera.lookFrom.subtract(camera.lookAt);
            const [ r, currentLat, currentLng ] = cartesianToLatLng(targetDelta);

            const newRadius = Math.max(0.1, r + delta);
            camera.lookFrom = latLngToCartesian(newRadius, currentLat, currentLng);
        };

        document.addEventListener('mouseup', mouseUpListener);
        document.addEventListener('mousedown', mouseDownListener);
        document.addEventListener('mousemove', mouseMoveListener);
        document.addEventListener('wheel', wheelListener);

        return () => {
            document.removeEventListener('mouseup', mouseUpListener);
            document.removeEventListener('mousedown', mouseDownListener);
            document.removeEventListener('mousemove', mouseMoveListener);
            document.removeEventListener('wheel', wheelListener);
        };
    }, []);

    return (
        <div className="App">
            <Canvas
                width={WIDTH}
                height={HEIGHT}
                onInit={async context => {
                    if (initialized) {
                        return;
                    }

                    await renderer.init(context);
                    setInitialized(true);
                }}
            />

            <div
                className="FPS"
                ref={fpsElement}
            >
                0 / 0
            </div>
        </div>
    );
}

function normalizeAngle(angle: number) {
    const TWO_PI = Math.PI * 2;
    if (angle < 0) {
        return TWO_PI - (Math.abs(angle) % TWO_PI);
    }
    return angle % TWO_PI;
}

function cartesianToLatLng(point: Point) {
    const radius = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);
    return [
        radius,
        (Math.PI / 2) - Math.acos(point.y / radius),
        normalizeAngle(Math.atan2(point.x, -point.z))
    ];
}


function latLngToCartesian(radius: number, lat: number, lng: number): Point {
    lng = -lng + Math.PI / 2;
    return new Point(
        radius * Math.cos(lat) * Math.cos(lng),
        radius * Math.sin(lat),
        radius * -Math.cos(lat) * Math.sin(lng)
    );
}

function clamp(value: number, low: number, high: number) {
    low = low !== undefined ? low : Number.MIN_SAFE_INTEGER;
    high = high !== undefined ? high : Number.MAX_SAFE_INTEGER;
    if (value < low) {
        value = low;
    }
    if (value > high) {
        value = high;
    }
    return value;
}