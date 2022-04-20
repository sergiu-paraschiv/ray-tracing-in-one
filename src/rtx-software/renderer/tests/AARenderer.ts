import { Renderer } from '../Renderer';
import { Output } from '../../output/Output';
import { Camera } from '../../output/Camera';
import { Vec3 } from '../../math/Vec3';
import { Ray } from '../../math/Ray';
import { HittableList } from '../../geometry/HittableList';
import { Sphere } from '../../geometry/Sphere';


export class AARenderer implements Renderer {
    private readonly camera: Camera;
    private readonly world: HittableList;
    private readonly samplesPerPixel = 3;

    public constructor(viewportWidth: number, viewportHeight: number, focalLength: number) {
        this.camera = new Camera(viewportWidth, viewportHeight, focalLength);

        this.world = new HittableList();
        this.world.add(new Sphere(new Vec3(0, 0, -1), .5));
    }

    render(output: Output) {
        for (let j = output.height - 1; j >= 0; --j) {
            for (let i = 0; i < output.width; ++i) {
                let pixelColor = new Vec3(0, 0, 0);

                for (let s = 0; s < this.samplesPerPixel; ++s) {
                    const u = (i + this.rand()) / (output.width - 1);
                    const v = (j + this.rand()) / (output.height - 1);
                    const ray = this.camera.getRay(u, v);

                    pixelColor = pixelColor.add(this.rayColor(ray))
                }

                output.pushPixel(this.getClampedColor(pixelColor));
            }
        }
    }

    private getClampedColor(color: Vec3):  [ number, number, number, number ] {
        let r = color.x;
        let g = color.y;
        let b = color.z;

        const scale = 1 / this.samplesPerPixel;

        r *= scale;
        g *= scale;
        b *= scale;

        return [
            Math.trunc(255 * this.clamp(r, 0, 0.999)),
            Math.trunc(255 * this.clamp(g, 0, 0.999)),
            Math.trunc(255 * this.clamp(b, 0, 0.999)),
            255
        ];
    }

    private rayColor(ray: Ray): Vec3 {
        const hitRecord = this.world.hit(ray, 0, Number.POSITIVE_INFINITY);

        if (hitRecord) {
            return hitRecord.normal.add(new Vec3(1, 1, 1)).mul(.5);
        }

        const unitDirection = ray.direction.unit();
        const t = 0.5 * (unitDirection.y + 1);
        return (
            new Vec3(1, 1, 1)
                .mul(1 - t)
                .add(
                    new Vec3(.5, .7, 1)
                        .mul(t)
                )
        );
    }

    private rand(): number {
        return Math.random();
    }

    private clamp(x: number, min: number, max: number) {
        if (x < min) {
            return min;
        }

        if ( x > max) {
            return max;
        }

        return x;
    }
}