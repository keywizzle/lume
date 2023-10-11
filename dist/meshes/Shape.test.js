import { Shape } from './Shape.js';
describe('Shape', () => {
    it('inherits property types from behaviors, for TypeScript', () => {
        ~class extends Shape {
            test() {
                this.wireframe;
                this.curveSegments;
            }
        };
    });
});
//# sourceMappingURL=Shape.test.js.map