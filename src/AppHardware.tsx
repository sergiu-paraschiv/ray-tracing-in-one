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
    Triangle,
    Point,
    Camera
} from './rtx-webgpu';


const WIDTH = 500; // 228 /  456 / 912
const HEIGHT = 500; // 144 / 288 / 576



const camera = new Camera(
    new Point(0, 0, -11),
    new Point(0, 0, 0),
    40.0,
    0.15,
    5.0
);


faker.seed(1);
const world = new World();

const white = Material.lambertian(new Color(0.73, 0.73, 0.73));
world.addMaterial(white);

const red = Material.lambertian(new Color(0.65, 0.05, 0.05));
world.addMaterial(red);

const green = Material.lambertian(new Color(0.12, 0.45, 0.15));
world.addMaterial(green);

const light = Material.difuseLight(new Color(15, 15, 15));
world.addMaterial(light);

const blue = Material.lambertian(new Color(0.12, 0.15, 0.45));
world.addMaterial(blue);

const glass = Material.dielectric(1.5);
world.addMaterial(glass);

// floor
world.addObject(new Triangle(
    new Point(3, -3, -3),
    new Point(-3, -3, 3),
    new Point(3, -3, 3)
), white);
world.addObject(new Triangle(
    new Point(3, -3, -3),
    new Point(-3, -3, -3),
    new Point(-3, -3, 3)
), white);

// back wall
world.addObject(new Triangle(
    new Point(3, -3, 3),
    new Point(-3, -3, 3),
    new Point(-3, 3, 3)
), white);
world.addObject(new Triangle(
    new Point(3, -3, 3),
    new Point(-3, 3, 3),
    new Point(3, 3, 3)
), white);

// left wall
world.addObject(new Triangle(
    new Point(3, -3, -3),
    new Point(3, -3, 3),
    new Point(3, 3, 3)
), red);
world.addObject(new Triangle(
    new Point(3, -3, -3),
    new Point(3, 3, 3),
    new Point(3, 3, -3)
), red);

// right wall
world.addObject(new Triangle(
    new Point(-3, -3, -3),
    new Point(-3, 3, 3),
    new Point(-3, -3, 3)
), green);
world.addObject(new Triangle(
    new Point(-3, -3, -3),
    new Point(-3, 3, -3),
    new Point(-3, 3, 3)
), green);

// ceiling
world.addObject(new Triangle(
    new Point(3, 3, -3),
    new Point(3, 3, 3),
    new Point(-3, 3, 3)
), white);
world.addObject(new Triangle(
    new Point(3, 3, -3),
    new Point(-3, 3, 3),
    new Point(-3, 3, -3)
), white);


// light
world.addObject(new Triangle(
    new Point(1, 2.999, -1),
    new Point(1, 2.999, 1),
    new Point(-1, 2.999, 1)
), light);
world.addObject(new Triangle(
    new Point(1, 2.999, -1),
    new Point(-1, 2.999, 1),
    new Point(-1, 2.999, -1)
), light);

world.addObject(new Sphere(
    new Point(0, 0, 0),
    1.0
), blue);

world.addObject(new Sphere(
    new Point(0, 0, 0),
    1.1
), glass);

/*
let groundMaterial = Material.lambertian(new Color(0.5, 0.5, 0.5));
world.addMaterial(groundMaterial);
world.addObject(new Sphere(new Point( 0.0,  -1000.0,   0.0), 1000.0), groundMaterial);

let lightMaterial = Material.difuseLight(new Color(4.0, 4.0, 4.0));
world.addMaterial(lightMaterial);
world.addObject(new Sphere(new Point( 0.0,  20.0,   0.0), 3.0), lightMaterial);

for (let a = -3; a <= 3; a += 3) {
    for (let b = -3; b <= 3; b += 3) {
        let materialType = faker.datatype.number({ min: 1, max: 10 });
        let color = new Color(
            faker.datatype.float({ min: 0, max: 1, precision: 0.1 }),
            faker.datatype.float({ min: 0, max: 1, precision: 0.1 }),
            faker.datatype.float({ min: 0, max: 1, precision: 0.1 })
        );

        let material: Material;
        if (materialType < 3) {
            material = Material.lambertian(color);
        }
        else if (materialType < 9) {
            material = Material.metal(color);
        }
        else {
            material = Material.dielectric(
                1.2
            );
        }

        const radius = faker.datatype.float({ min: 0.7, max: 1.2, precision: 0.1 });
        const center = new Point(
            a + 0.3 * faker.datatype.float({ min: -1, max: 1, precision: 0.1 }),
            radius,
            b + 0.3 * faker.datatype.float({ min: -1, max: 1, precision: 0.1 })
        );

        world.addMaterial(material);
        world.addObject(new Sphere(center, radius), material);
    }
}
*/

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

        if (initialized) {
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
    }, [ fpsElement, initialized ]);

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