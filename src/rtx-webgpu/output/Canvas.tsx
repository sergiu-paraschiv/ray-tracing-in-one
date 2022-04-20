import React from 'react';

import './Canvas.css';


export function Canvas(props: {
    width: number
    height: number
    onInit: (context: GPUCanvasContext) => void
}) {
    return (
        <canvas
            ref={element => {
                if (element) {
                    const context = element.getContext('webgpu');
                    if (!context) {
                        throw new Error('webgpu context could not be created');
                    }

                    props.onInit(context);
                }
            }}
            className="Canvas"
            width={props.width}
            height={props.height}
        />
    );
}
