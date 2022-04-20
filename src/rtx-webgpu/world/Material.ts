import { Color } from './Color';


export type ScatterType = 'lambertian' | 'metal' | 'dielectric'

export class Material {
    public readonly scatterType: ScatterType;
    public readonly color?: Color;
    public readonly fuzz?: number;
    public readonly indexOfRefraction?: number;

    constructor(scatterType: ScatterType, color?: Color, fuzz?: number, indexOfRefraction?: number) {
        this.scatterType = scatterType;
        this.color = color;
        this.fuzz = fuzz;
        this.indexOfRefraction = indexOfRefraction;
    }

    public static lambertian(color: Color) {
        return new Material(
            'lambertian',
            color
        );
    }

    public static metal(color: Color, fuzz: number) {
        return new Material(
            'metal',
            color,
            fuzz
        );
    }

    public static dielectric(indexOfRefraction: number) {
        return new Material(
            'dielectric',
            undefined,
            undefined,
            indexOfRefraction
        );
    }
}