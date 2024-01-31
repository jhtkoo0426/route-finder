import BaseAlgorithm from '../BaseAlgorithm';

describe('BaseAlgorithm.js tests', () => {
    let mapGraph;
    let algorithm = null;

    beforeEach(() => {
        algorithm = new BaseAlgorithm(mapGraph);
    });

    test('should throw error for un-implemented enqueue() method', () => {
        expect(() => algorithm.enqueue()).toThrowError("enqueue method must be implemented by subclasses, returning a boolean value");
    });

    test('should throw error for un-implemented dequeue() method', () => {
        expect(() => algorithm.dequeue()).toThrowError("dequeue method must be implemented by subclasses, returning a boolean value");
    });

    test('should throw error for un-implemented isEmpty() method', () => {
        expect(() => algorithm.isEmpty()).toThrowError("isEmpty method must be implemented by subclasses, returning a boolean value");
    });

    test('should throw error for un-implemented searchOptimalPath() method', () => {
        expect(() => algorithm.searchOptimalPath()).toThrowError("searchOptimalPath method must be implemented by subclasses, returning a boolean value");
    });

    test('should throw error for un-implemented constructOptimalPath() method', () => {
        expect(() => algorithm.constructOptimalPath()).toThrowError("constructOptimalPath method must be implemented by subclasses, returning a boolean value");
    });
});
