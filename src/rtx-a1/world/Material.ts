import { Color } from './Color';


export type ScatterType = 'lambertian' | 'metal' | 'dielectric' | 'difuse_light'

export class Material {
    public readonly scatterType: ScatterType;
    public readonly color?: Color;
    public readonly indexOfRefraction?: number;

    constructor(scatterType: ScatterType, color?: Color, indexOfRefraction?: number) {
        this.scatterType = scatterType;
        this.color = color;
        this.indexOfRefraction = indexOfRefraction;
    }

    public static lambertian(color: Color) {
        return new Material(
            'lambertian',
            color
        );
    }

    public static metal(color: Color) {
        return new Material(
            'metal',
            color
        );
    }

    public static dielectric(indexOfRefraction: number) {
        return new Material(
            'dielectric',
            undefined,
            indexOfRefraction
        );
    }

    public static difuseLight(color: Color) {
        return new Material(
            'difuse_light',
            color
        );
    }
}