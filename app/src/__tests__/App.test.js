// Import necessary testing utilities
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import App from '../App';
import SearchHandler from '../utilities/services/SearchHandler';

// Mocking the services and utilities
jest.mock('../utilities/services/AlgorithmSearchService');
jest.mock('../utilities/services/DebuggerHandler');
jest.mock('../utilities/services/MetroMapAssetsManager');
jest.mock('../utilities/services/SearchHandler');
jest.mock('../utilities/parsers/path_parsers/TravelPathParser');
jest.mock('../utilities/components/SearchableDropdown');


describe('App Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<App />);
        expect(screen.getByText('Route Planner')).toBeInTheDocument();
    });

    it('handles search button click', async () => {
        render(<App />);
        fireEvent.click(screen.getByText('Search'));
        expect(SearchHandler.prototype.handleSearchClick).toHaveBeenCalled();
    });
});
