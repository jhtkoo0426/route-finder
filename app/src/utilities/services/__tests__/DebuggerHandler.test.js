import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DebuggerHandler from '../DebuggerHandler';

describe('DebuggerHandler.js tests', () => {
    let appInstance;
    let debuggerHandler;

    beforeEach(() => {
        // Create a mock App instance
        appInstance = {
            state: {
                selectedStartStation: null,
                selectedEndStation: null,
                selectedAlgorithm: null,
            },
            setState: jest.fn(),
        };

        // Create an instance of DebuggerHandler with the mock App instance
        debuggerHandler = new DebuggerHandler(appInstance);
    });

    test('resetDebuggerState should reset the debugger state', () => {
        // Call the resetDebuggerState method
        debuggerHandler.resetDebuggerState();

        // Expect the setState method to be called with null debugger state
        expect(appInstance.setState).toHaveBeenCalledWith({ debugger: null });
    });

    test('setDebuggerState should set the correct debugger state for missing fields', () => {
        // Call the setDebuggerState method
        debuggerHandler.setDebuggerState();

        // Expect the setState method to be called with the appropriate debugger message
        expect(appInstance.setState).toHaveBeenCalledWith({
        debugger: 'The following fields are not selected: Start station, End station, Algorithm',
        });
    });

    test('setDebuggerState should not set debugger state when all fields are selected', () => {
        // Set values for all fields
        appInstance.state.selectedStartStation = 'Station A';
        appInstance.state.selectedEndStation = 'Station B';
        appInstance.state.selectedAlgorithm = 'Dijkstra';
      
        // Call the setDebuggerState method
        debuggerHandler.setDebuggerState();
      
        // Expect the setState method not to be called
        expect(appInstance.setState).not.toHaveBeenCalled();
      });
      
});