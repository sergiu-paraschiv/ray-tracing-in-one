import React from 'react';

import './App.css';
import {
    Output,
    Canvas,
    AARenderer
} from './rtx-software';


const output = new Output(912, 576);
const renderer = new AARenderer(912, 576, 200);
export default function App() {
    const fpsElement = React.createRef<HTMLDivElement>();

    React.useEffect(() => {
        let animationFrame: ReturnType<typeof requestAnimationFrame> | undefined;

        if (fpsElement.current) {
            let then = 0;
            let totalFPS = 0;
            const frameTimes: number[] = [];
            let frameCursor = 0;
            let numFrames = 0;
            const maxFrames = 20;

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

                renderer.render(output);
                animationFrame = requestAnimationFrame(render);
            };

            animationFrame = requestAnimationFrame(render);
        }

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [ fpsElement.current ]);

    return (
        <div className="App">
            <Canvas
                output={output}
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
