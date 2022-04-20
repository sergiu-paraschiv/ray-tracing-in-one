import { Output } from '../output/Output';


export interface Renderer {
    render(output: Output): void;
}