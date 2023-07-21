import { createElement } from 'lwc';
import DonatorsCountPerTicket from 'c/donatorsCountPerTicket';

let DONATIONS = require('./data/donations.json')

describe('c-donators-count-per-ticket', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('validates tickets assignment', () => {
        // Arrange
        const element = createElement('c-donators-count-per-ticket', {
            is: DonatorsCountPerTicket
        });

        element.ticketPrice = 50;
        element.donations = DONATIONS;

        document.body.appendChild(element);
        let newList = element.convert2Tickets()

        expect(element.donations.length).toBe(186);
        expect(newList.length).toBe(1826);
        expect(newList[0].id).toEqual(newList[1].id);
        expect(newList[0].tikNum).toEqual(1);
        expect(newList[1].tikNum).toEqual(2);

        // expect(newList[0]).toEqual({
        //     "timestamp": "19.03.2021 00:36:31",
        //     "description": "З чорної картки",
        //     "totalAmount": 100,
        //     "RRN": "",
        //     "id": "19.03.2021 00:36:31 З чорної картки",
        //     "tikNum": 1
        // });
        // expect(newList[1]).toEqual({
        //     "timestamp": "19.03.2021 00:36:31",
        //     "description": "З чорної картки",
        //     "totalAmount": 100,
        //     "Залишок": "200.16",
        //     "RRN": "",
        //     "id": "19.03.2021 00:36:31 З чорної картки",
        //     "tikNum": 2
        // });


        // raise the stakes
        element.ticketPrice = 500;
        newList = element.convert2Tickets()

        expect(element.donations.length).toBe(13);
        expect(newList.length).toBe(13);

    });
});