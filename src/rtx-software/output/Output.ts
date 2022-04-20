export class Output {
    public readonly width: number;
    public readonly height: number;
    public pixels: Uint8ClampedArray;
    private pixelIndex: number;
    private imageDataCallback: ((imageData: ImageData) => void) = () => {};

    public constructor(
        width: number,
        height: number
    ) {
        this.width = width;
        this.height = height;
        this.pixels = new Uint8ClampedArray(this.width * this.height * 4);
        this.pixelIndex = 0;
    }

    public pushPixel(pixel: [ number, number, number, number ]) {
        if (this.pixelIndex === this.width * this.height * 4) {
            this.pixelIndex = 0;
        }

        this.pixels[this.pixelIndex] = pixel[0];
        this.pixels[this.pixelIndex + 1] = pixel[1];
        this.pixels[this.pixelIndex + 2] = pixel[2];
        this.pixels[this.pixelIndex + 3] = pixel[3];

        this.pixelIndex += 4;

        if (this.pixelIndex === this.width * this.height * 4) {
            if (this.imageDataCallback) {
                this.imageDataCallback(new ImageData(
                    this.pixels,
                    this.width,
                    this.height
                ));
            }
        }
    }

    public onImageData(imageDataCallback: (imageData: ImageData) => void) {
        this.imageDataCallback = imageDataCallback;
    }
}