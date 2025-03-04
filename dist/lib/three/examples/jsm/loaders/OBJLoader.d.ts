export class OBJLoader extends Loader<any, string> {
    constructor(manager: any);
    materials: any;
    load(url: any, onLoad: any, onProgress: any, onError: any): void;
    setMaterials(materials: any): OBJLoader;
    parse(text: any): Group<import("three").Object3DEventMap>;
}
import { Loader } from "three/src/loaders/Loader.js";
import { Group } from "three/src/objects/Group.js";
//# sourceMappingURL=OBJLoader.d.ts.map