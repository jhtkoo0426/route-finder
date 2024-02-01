import SearchHandler from '../SearchHandler';


describe('SearchHandler.js tests', () => {
    let appInstanceMock;
    let algorithmSearchServiceMock;

    beforeEach(() => {
        algorithmSearchServiceMock = {
            search: jest.fn(() => Promise.resolve({
                Dijkstra: {
                    distance: 10,
                    path: ['Station1', 'Station2'],
                    duration: 5,
                },
            })),
        };

        appInstanceMock = {
            state: {
                selectedStartStation: 'StartStation',
                selectedEndStation: 'EndStation',
                selectedAlgorithm: 'Dijkstra',
            },
            resetStates: jest.fn(),
            setAlgorithmResultState: jest.fn(),
            mapCanvas: {
                renderAlgorithmSearchResults: jest.fn(),
                moveViewerToStation: jest.fn(),
            },
            algorithmSearchService: algorithmSearchServiceMock,
            setDebuggerState: jest.fn(),
        };
    });

    it('should call search and update states on handleSearchClick()', async () => {
        const searchHandler = new SearchHandler(appInstanceMock);
        await searchHandler.handleSearchClick();

        expect(appInstanceMock.resetStates).toHaveBeenCalled();
        expect(algorithmSearchServiceMock.search).toHaveBeenCalledWith('StartStation', 'EndStation', 'Dijkstra');
        expect(appInstanceMock.setAlgorithmResultState).toHaveBeenCalledWith(['Station1', 'Station2'], 10, 5);
        expect(appInstanceMock.mapCanvas.renderAlgorithmSearchResults).toHaveBeenCalled();
        expect(appInstanceMock.mapCanvas.moveViewerToStation).toHaveBeenCalled();
        expect(appInstanceMock.setDebuggerState).not.toHaveBeenCalled();
    });

    it('should call setDebuggerState() if not all fields are selected', async () => {
        appInstanceMock.state.selectedAlgorithm = null;
        const searchHandler = new SearchHandler(appInstanceMock);
        await searchHandler.handleSearchClick();
        expect(appInstanceMock.setDebuggerState).toHaveBeenCalled();
    });
});