import MinPriorityQueue from '../MinPriorityQueue';

describe('MinPriorityQueue', () => {
    it('enqueues elements and maintains priority order', () => {
        const minPriorityQueue = new MinPriorityQueue();
        minPriorityQueue.enqueue('Task 1', 3);
        minPriorityQueue.enqueue('Task 2', 1);
        minPriorityQueue.enqueue('Task 3', 2);

        expect(minPriorityQueue.queue).toEqual([
        { element: 'Task 2', priority: 1 },
        { element: 'Task 3', priority: 2 },
        { element: 'Task 1', priority: 3 },
        ]);
    });

    it('dequeues elements in the correct order', () => {
        const minPriorityQueue = new MinPriorityQueue();
        minPriorityQueue.enqueue('Task 1', 3);
        minPriorityQueue.enqueue('Task 2', 1);
        minPriorityQueue.enqueue('Task 3', 2);

        const dequeuedElement = minPriorityQueue.dequeue();

        expect(dequeuedElement).toEqual({ element: 'Task 2', priority: 1 });
    });

    it('checks if the queue is empty after dequeueing all elements', () => {
        const minPriorityQueue = new MinPriorityQueue();
        minPriorityQueue.enqueue('Task 1', 3);
        minPriorityQueue.enqueue('Task 2', 1);
        minPriorityQueue.enqueue('Task 3', 2);

        minPriorityQueue.dequeue();
        minPriorityQueue.dequeue();
        minPriorityQueue.dequeue();

        expect(minPriorityQueue.isEmpty()).toBe(true);
        
        const result = minPriorityQueue.dequeue();
        expect(result).toBe(null);
    });

    it('enqueues and dequeues elements with the same priority', () => {
        const minPriorityQueue = new MinPriorityQueue();
        minPriorityQueue.enqueue('Task A', 2);
        minPriorityQueue.enqueue('Task B', 2);
        minPriorityQueue.enqueue('Task C', 2);

        const dequeuedElement = minPriorityQueue.dequeue();

        expect(dequeuedElement).toEqual({ element: 'Task A', priority: 2 });
    });

    it('checks if the queue is empty after dequeueing all elements with the same priority', () => {
        const minPriorityQueue = new MinPriorityQueue();
        minPriorityQueue.enqueue('Task A', 2);
        minPriorityQueue.enqueue('Task B', 2);
        minPriorityQueue.enqueue('Task C', 2);

        minPriorityQueue.dequeue();
        minPriorityQueue.dequeue();
        minPriorityQueue.dequeue();

        expect(minPriorityQueue.isEmpty()).toBe(true);
    });
});