import { Renderer } from '../Renderer';
import { Output } from '../../output/Output';
import { Vec3 } from '../../math/Vec3';
import { Ray } from '../../math/Ray';
import { HittableList } from '../../geometry/HittableList';
import { Sphere } from '../../geometry/Sphere';


export class HittablesRenderer implements Renderer {
    private readonly focalLength: number;
    private readonly world: HittableList;

    public constructor(focalLength: number) {
        this.focalLength = focalLength;

        this.world = new HittableList();
        this.world.add(new Sphere(new Vec3(0, 0, -1), .5));
        this.world.add(new Sphere(new Vec3(0, -100.5, -1), 100));
    }

    render(output: Output) {
        const origin = new Vec3(0, 0, 0);
        const horizontal = new Vec3(output.width, 0, 0);
        const vertical = new Vec3(0, output.height, 0);
        const llc = origin
                        .sub(horizontal.div(2))
                        .sub(vertical.div(2))
                        .sub(new Vec3(0, 0, this.focalLength))

        for (let j = output.height - 1; j >= 0; --j) {
            // console.info(`${j} lines remaining, ${Math.round(j/output.height * 100)}%`);
            for (let i = 0; i < output.width; ++i) {
                const u = i / (output.width - 1);
                const v = j / (output.height - 1);
                const ray = new Ray(
                    origin,
                    llc.add(horizontal.mul(u))
                        .add(vertical.mul(v))
                        .sub(origin)
                );

                const color = this.rayColor(ray);

                output.pushPixel([
                    Math.trunc(255.999 * color.x),
                    Math.trunc(255.999 * color.y),
                    Math.trunc(255.999 * color.z),
                    255,
                ]);
            }
        }
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
}