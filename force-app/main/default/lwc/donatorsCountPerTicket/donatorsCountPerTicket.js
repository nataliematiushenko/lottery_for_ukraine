/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api, wire } from 'lwc';
import getRecords from '@salesforce/apex/DonationsController.getRecords';
// import DONATIONS_OBJECT from '@salesforce/schema/Donations__c';
// import NAME_FIELD from '@salesforce/schema/Donations__c.Name';
// import DESCRIPTION_FIELD from '@salesforce/schema/Donations__c.Description__c';
// import DATE_TIME_FIELD from '@salesforce/schema/Donations__c.DateTime__c';


export default class DonatorsCountPerTicket extends LightningElement {
  @api ticketPrice = 100;
  @api donations;
  donatorsTickets = [];
  recordId;
  totalTicketsCount;
  isLoading = true;

  //Uncomment if using records from SF

  // objectName = DONATIONS_OBJECT;
  // fields = {
  //   name: NAME_FIELD,
  //   description: DESCRIPTION_FIELD,
  //   dateTime: DATE_TIME_FIELD,
  // };

  outputCols = [
    { label: "Ticket Number", fieldName: "tikNum" },
    { label: "DateTime", fieldName: "dateTime" },
    { label: "Amount", fieldName: "amount" },
    { label: "Number of tickets per donation", fieldName: "numOfGeneratedTickets" },
    { label: "Single ticket count", fieldName: "additional_tikNum" }
  ]


  @wire(getRecords) getDonationsRecords(res) {
    if (res.data) {
      this.donations = res.data;
      let donatorsTickets = [];
      this.donations.forEach(({ Amount__c, DateTime__c, Id }) => {
        let delta = Amount__c < this.ticketPrice ? 1 : Math.floor(Amount__c / this.ticketPrice)
        for (let i = 1; i <= delta; i++) {
          donatorsTickets.push({
            id: Id,
            amount: Amount__c,
            dateTime: DateTime__c,
            numOfGeneratedTickets: delta,
            additional_tikNum: i
          });
        }
      });


      this.donatorsTickets = donatorsTickets.map((el, i) => {
        return { ...el, tikNum: i }
      });

      this.totalTicketsCount = `Всього квитків: ${this.donatorsTickets.length}`;
    }
    if (res.data || res.error) this.isLoading = false;
  }


  findWinner() {
    this.isLoading = true;
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      let numberOfTickets = this.donatorsTickets.length - 1;
      let randomIndex = Math.round(numberOfTickets * Math.random());
      let randomRecord = this.donatorsTickets[randomIndex];

      this.recordId = randomRecord.id;
      this.isLoading = false;
    }, 3000);

  }
}