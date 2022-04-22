// @ts-ignore
import fullscreenShaderWGSL from '../shaders/fullscreen.wgsl';

import loadComputeShader from './loadComputeShader';
import { World } from '../world/World';
import { Camera } from '../camera/Camera';


const COLOR_CHANNELS = 4;

export class Renderer {
    private readonly world: World;
    private readonly camera: Camera;
    private readonly width: number;
    private readonly height: number;
    private context: GPUCanvasContext | undefined;
    private device: GPUDevice | undefined;
    private addComputePass: ((commandEncoder: GPUCommandEncoder, frameIndex: number) => void) | undefined;
    private addFullscreenPass: ((commandEncoder: GPUCommandEncoder) => void) | undefined;

    public constructor(width: number, height: number, world: World, camera: Camera) {
        this.world = world;
        this.camera = camera;
        this.width = width;
        this.height = height;
    }

    public init = async (context: GPUCanvasContext) => {
        this.context = context;

        if (!navigator.gpu) {
            throw new Error('GPU support not available');
        }

        const adapter = await navigator.gpu.requestAdapter();

        if (!adapter) {
            throw new Error('GPU support not available');
        }

        this.device = await adapter.requestDevice();

        const presentationSize = [
            this.width,
            this.height
        ];
        const presentationFormat = this.context.getPreferredFormat(adapter);

        this.context.configure({
            device: this.device,
            format: presentationFormat,
            size: presentationSize
        });

        const computeShaderModule = this.device.createShaderModule({
            code: loadComputeShader()
        });

        const fullscreenShaderModule = this.device.createShaderModule({
            code: fullscreenShaderWGSL
        });

        const { addComputePass, outputColorBuffer } = this.createComputePass(computeShaderModule);
        const { addFullscreenPass } = this.createFullscreenPass(fullscreenShaderModule, presentationFormat, outputColorBuffer);

        this.addComputePass = addComputePass;
        this.addFullscreenPass = addFullscreenPass;
    }

    public render = (frameIndex: number) => {
        if (!this.device || !this.context || !this.addComputePass || !this.addFullscreenPass) {
            throw new Error('Renderer::init must be called first');
        }

        const commandEncoder = this.device.createCommandEncoder();

        this.addComputePass(commandEncoder, frameIndex);
        this.addFullscreenPass(commandEncoder);

        this.device.queue.submit([
            commandEncoder.finish()
        ]);
    }

    private createComputePass = (shaderModule: GPUShaderModule) => {
        if (!this.device) {
            throw new Error('Renderer::init must be called first');
        }

        const outputColorBufferSize = Uint32Array.BYTES_PER_ELEMENT * (this.width * this.height) * COLOR_CHANNELS;
        const outputColorBuffer = this.device.createBuffer({
            size: outputColorBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });

        const UBOBufferSize = 4 * 3;// screen width & height + frame index
        const UBOBuffer = this.device.createBuffer({
            size: UBOBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const worldData = this.world.getBuffer();
        let cameraData = this.camera.getBuffer();

        const WorldBuffer = this.device.createBuffer({
            size: Uint32Array.BYTES_PER_ELEMENT * worldData.size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const CameraBuffer = this.device.createBuffer({
            size: Uint32Array.BYTES_PER_ELEMENT * cameraData.size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'storage' as GPUBufferBindingType
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'uniform' as GPUBufferBindingType
                    },
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'storage' as GPUBufferBindingType
                    },
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: 'storage' as GPUBufferBindingType
                    },
                }
            ]
        });

        const bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: outputColorBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: UBOBuffer
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: WorldBuffer
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: CameraBuffer
                    }
                }
            ]
        });

        const rasterizerPipeline = this.device.createComputePipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [
                    bindGroupLayout
                ]
            }),
            compute: {
                module: shaderModule,
                entryPoint: 'compute_main'
            }
        });

        const addComputePass = (commandEncoder: GPUCommandEncoder, frameIndex: number) => {
            if (!this.device) {
                throw new Error('Renderer::init must be called first');
            }

            const uniformTypedArray = new Float32Array([ this.width, this.height, frameIndex ]);
            cameraData = this.camera.getBuffer();

            this.device.queue.writeBuffer(UBOBuffer, 0, uniformTypedArray.buffer);
            this.device.queue.writeBuffer(WorldBuffer, 0, worldData.values);
            this.device.queue.writeBuffer(CameraBuffer, 0, cameraData.values);

            const passEncoder = commandEncoder.beginComputePass();
            const totalTimesToRun = Math.ceil((this.width * this.height) / 256);

            passEncoder.setPipeline(rasterizerPipeline);
            passEncoder.setBindGroup(0, bindGroup);
            passEncoder.dispatch(totalTimesToRun);

            passEncoder.end();
        }

        return {
            addComputePass,
            outputColorBuffer
        };
    }

    private createFullscreenPass = (shaderModule: GPUShaderModule, presentationFormat: GPUTextureFormat, finalColorBuffer: GPUBuffer) => {
        if (!this.device) {
            throw new Error('Renderer::init must be called first');
        }

        const fullscreenQuadBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'uniform' as GPUBufferBindingType
                    }
                },
                {
                    binding: 1,// the color buffer
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: {
                        type: 'storage' as GPUBufferBindingType
                    }
                }
            ]
        });

        const fullscreenQuadPipeline = this.device.createRenderPipeline({
            layout:  this.device.createPipelineLayout({
                bindGroupLayouts: [ fullscreenQuadBindGroupLayout ]
            }),
            vertex: {
                module: shaderModule,
                entryPoint: 'vertex_main',
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fragment_main',
                targets: [
                    {
                        format: presentationFormat,
                    },
                ],
            },
            primitive: {
                topology: 'triangle-list',
            },
        });

        const uniformBufferSize = 4 * 2; // screen width & height
        const uniformBuffer = this.device.createBuffer({
            size: uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const fullscreenQuadBindGroup = this.device.createBindGroup({
            layout: fullscreenQuadBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: uniformBuffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: finalColorBuffer
                    }
                }
            ],
        });

        const addFullscreenPass = (commandEncoder: GPUCommandEncoder) => {
            if (!this.device || !this.context) {
                throw new Error('Renderer::init must be called first');
            }

            this.device.queue.writeBuffer(
                uniformBuffer,
                0,
                new Float32Array([this.width, this.height])
            );

            const passEncoder = commandEncoder.beginRenderPass({
                colorAttachments: [
                    {
                        view: this.context.getCurrentTexture().createView(),
                        loadValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
                        loadOp: 'load' as GPULoadOp,
                        storeOp: 'store' as GPUStoreOp,
                    },
                ]
            });
            passEncoder.setPipeline(fullscreenQuadPipeline);
            passEncoder.setBindGroup(0, fullscreenQuadBindGroup);
            passEncoder.draw(6, 1, 0, 0);
            passEncoder.end();
        }

        return {
            addFullscreenPass
        };
    }
}