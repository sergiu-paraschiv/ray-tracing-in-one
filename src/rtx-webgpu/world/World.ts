import { Material, ScatterType } from './Material';
import { Sphere } from './Sphere';


interface SphereMaterial {
    sphere: Sphere
    material: Material
}

const MATERIAL_TYPE_MAP: {
    [key in ScatterType]: number
} = {
    lambertian: 1,
    metal: 2,
    dielectric: 3
};

export class World {
    private materials: Material[] = [];
    private spheres: Sphere[] = [];
    private sphereMaterials: SphereMaterial[] = [];
    private buffer = new Float32Array();

    public getBuffer(): {
        values: ArrayBufferLike,
        size: number
    } {
        this.buildBuffer();
        return {
            values: this.buffer.buffer,
            size: this.buffer.length
        };
    }

    public addMaterial(material: Material) {
        this.materials.push(material);
    }

    public addSphere(sphere: Sphere, material: Material) {
        this.spheres.push(sphere);
        this.sphereMaterials.push({ sphere, material });
    }

    private buildBuffer() {
        const data: number[] = [];

        data.push(this.materials.length);
        data.push(this.spheres.length);

        const materialDataIndexes: number[] = [];
        for (const material of this.materials) {
            materialDataIndexes.push(data.length);

            data.push(MATERIAL_TYPE_MAP[material.scatterType]);

            if (material.scatterType === 'lambertian') {
                data.push(material.color!.r, material.color!.g, material.color!.b);
                data.push(0.0, 0.0);
            }
            else if (material.scatterType === 'metal') {
                data.push(material.color!.r, material.color!.g, material.color!.b);
                data.push(material.fuzz!);
                data.push(0.0);
            }
            else if (material.scatterType === 'dielectric') {
                data.push(0.0, 0.0, 0.0);
                data.push(0.0);
                data.push(material.indexOfRefraction!);
            }
        }

        for (const sphere of this.spheres) {
            data.push(sphere.center.x, sphere.center.y, sphere.center.z, sphere.radius);

            const sphereMaterial = this.sphereMaterials.find(sphereMaterial => sphereMaterial.sphere === sphere);
            if (!sphereMaterial) {
                throw new Error('SphereMaterial not found');
            }

            const materialIndex = this.materials.indexOf(sphereMaterial.material);
            data.push(materialDataIndexes[materialIndex]);
        }

        this.buffer = new Float32Array(data);
    }
}