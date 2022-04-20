import { Renderer } from '../Renderer';
import { Output } from '../../output/Output';


export class ColorMapRenderer implements Renderer {
    private step = 0;

    render(output: Output) {
        this.step += 0.01;
        if (this.step > 1) {
            this.step = 0.01;
        }

        for (let j = output.height - 1; j >= 0; --j) {
            // console.info(`${j} lines remaining, ${Math.round(j/output.height * 100)}%`);
            for (let i = 0; i < output.width; ++i) {
                const r = i / (output.width - 1);
                const g = j / (output.height - 1);
                const b = 0.25;
                const a = this.step;

                output.pushPixel([
                    Math.trunc(255.999 * r),
                    Math.trunc(255.999 * g),
                    Math.trunc(255.999 * b),
                    Math.trunc(255.999 * a),
                ]);
            }
        }
    }
}