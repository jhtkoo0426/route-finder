import DebuggerHandler from '../DebuggerHandler';

describe('DebuggerHandler.js tests', () => {
    let appInstance;
    let debuggerHandler;

    beforeEach(() => {
        appInstance = {
            state: {
                selectedStartStation: null,
                selectedEndStation: null,
                selectedAlgorithm: null,
            },
            setState: jest.fn(),
        };
        debuggerHandler = new DebuggerHandler(appInstance);
    });

    test('resetDebuggerState() should reset the debugger state', () => {
        debuggerHandler.resetDebuggerState();
        expect(appInstance.setState).toHaveBeenCalledWith({ debugger: null });
    });

    test('setDebuggerState() should set the correct debugger state for missing fields', () => {
        debuggerHandler.setDebuggerState();
        expect(appInstance.setState).toHaveBeenCalledWith({
        debugger: 'The following fields are not selected: Start station, End station, Algorithm',
        });
    });

    test('setDebuggerState() should not set debugger state when all fields are selected', () => {
        // Set values for all fields
        appInstance.state.selectedStartStation = 'Station A';
        appInstance.state.selectedEndStation = 'Station B';
        appInstance.state.selectedAlgorithm = 'Dijkstra';
      
        debuggerHandler.setDebuggerState();
        expect(appInstance.setState).not.toHaveBeenCalled();
      });
      
});