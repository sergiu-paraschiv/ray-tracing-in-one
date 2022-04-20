import React from 'react';

import './Canvas.css';
import { Output } from './Output';


export function Canvas(props: {
    output: Output
}) {
    const canvas = React.createRef<HTMLCanvasElement>();
    const output = props.output;

    React.useEffect(() => {
        let context: CanvasRenderingContext2D | null;

        if (canvas.current) {
            context = canvas.current.getContext('2d');
            if (context) {
                context.imageSmoothingEnabled = false;
            }
        }

        output.onImageData(imageData => {
            if (context) {
                context.putImageData(imageData, 0, 0);
            }
        });
    }, [ output, canvas.current ]);

    return (
        <canvas
            ref={canvas}
            className="Canvas"
            width={output.width}
            height={output.height}
        />
    );
}
