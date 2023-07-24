import { createElement } from 'lwc';
import DonatorsCountPerTicket from 'c/donatorsCountPerTicket';
import getRecords from '@salesforce/apex/DonationsController.getRecords';
import { setImmediate } from "timers";

// Mocking the apex method response
const DONATIONS = require('./data/donations.json');

jest.mock(
    "@salesforce/apex/DonationsController.getRecords",
    () => {
        const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
        return {
            default: createApexTestWireAdapter(jest.fn()),
        };
    },
    { virtual: true }
);

async function flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
}

function getPageComponent(element) {
    const card = element.shadowRoot.querySelector('lightning-card');
    const datatable = element.shadowRoot.querySelector('lightning-datatable');
    const button = element.shadowRoot.querySelector('lightning-button');
    const recordViewForm = element.shadowRoot.querySelector('lightning-record-view-form');
    const spinner = element.shadowRoot.querySelector('lightning-spinner');
    const outputFieldNames = Array.from(
        element.shadowRoot.querySelectorAll('lightning-output-field')
    ).map((outputField) => outputField.fieldName.fieldApiName);
    return { card, datatable, button, recordViewForm, spinner, outputFieldNames };
}

async function setupElement(emit = false) {
    // Create the component
    const element = createElement('c-donators-count-per-ticket', {
        is: DonatorsCountPerTicket
    });
    element.ticketPrice = 100;
    document.body.appendChild(element);

    if (emit) {
        // 16 original records
        getRecords.emit(DONATIONS);
        await flushPromises();
    }
    return element;
}

describe('c-donators-count-per-ticket', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('shows spinner while the data is loading, hides after received it (success)', async () => {
        let element = await setupElement();

        let { spinner } = getPageComponent(element);
        expect(spinner).toBeTruthy();

        // 16 original records
        getRecords.emit(DONATIONS);
        await flushPromises();
        ({ spinner } = getPageComponent(element));

        expect(spinner).toBeFalsy();
    });

    it('shows spinner while the data is loading, hides after failure (error)', async () => {
        let element = await setupElement();

        let { spinner } = getPageComponent(element);
        expect(spinner).toBeTruthy();

        // 16 original records
        getRecords.error();
        await flushPromises();
        ({ spinner } = getPageComponent(element));

        expect(spinner).toBeFalsy();
    });

    it('displays correct number of tickets', async () => {
        let element = await setupElement(true);
        let { card, datatable } = getPageComponent(element);

        expect(element.donations.length).toBe(16);
        expect(card.title).toBe('Всього квитків: 103');
        expect(datatable.data.length).toBe(103);

        expect(datatable.data[0].amount).toBe(15);
        expect(datatable.data[0].numOfGeneratedTickets).toBe(1);
        expect(datatable.data[0].additional_tikNum).toBe(1);
        expect(datatable.data[0].tikNum).toBe(0);

        expect(datatable.data[1].amount).toBe(3660);
        expect(datatable.data[1].numOfGeneratedTickets).toBe(36);
        expect(datatable.data[1].additional_tikNum).toBe(1);
        expect(datatable.data[1].tikNum).toBe(1);

        expect(datatable.data[4].amount).toBe(3660);
        expect(datatable.data[4].numOfGeneratedTickets).toBe(36);
        expect(datatable.data[4].additional_tikNum).toBe(4);
        expect(datatable.data[4].tikNum).toBe(4);

        expect(datatable.data[36].amount).toBe(3660);
        expect(datatable.data[36].numOfGeneratedTickets).toBe(36);
        expect(datatable.data[36].additional_tikNum).toBe(36);
        expect(datatable.data[36].tikNum).toBe(36);

        expect(datatable.data[37].amount).toBe(20);
        expect(datatable.data[37].numOfGeneratedTickets).toBe(1);
        expect(datatable.data[37].additional_tikNum).toBe(1);
        expect(datatable.data[37].tikNum).toBe(37);

    });

    it('finds a winner and renders given set of lightning-output-field`s in specific order', async () => {
        jest.useFakeTimers();
        let element = await setupElement(true);
        let { button } = getPageComponent(element);

        button.click();

        jest.runAllTimers();
        await flushPromises();

        let { recordViewForm, outputFieldNames } = getPageComponent(element);
        let OUTPUT_FIELDS = ["Name", "Description__c", "DateTime__c"];
        expect(recordViewForm).toBeTruthy();

        expect(outputFieldNames).toEqual(OUTPUT_FIELDS);
    });
});
