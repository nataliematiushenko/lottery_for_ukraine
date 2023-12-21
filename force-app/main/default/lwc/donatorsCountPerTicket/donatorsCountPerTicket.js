/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api, track, wire } from 'lwc';
import getRecords from '@salesforce/apex/DonationsController.getRecords';
import DONATIONS_OBJECT from '@salesforce/schema/Donations_for_UA__c';
import NAME_FIELD from '@salesforce/schema/Donations_for_UA__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Donations_for_UA__c.Description__c';
import DATE_TIME_FIELD from '@salesforce/schema/Donations_for_UA__c.DateTime__c';


export default class DonatorsCountPerTicket extends LightningElement {
  @track records = [];

  @api ticketPrice = 50;
  @api donations;
  donatorsTickets = [];
  data = [];
  recordId;
  totalTicketsCount;
  isLoading = true;

  @track page = 1;
  @track startingRecord = 1;
  @track endingRecord = 0;
  @track pageSize = 10;
  @track totalPage = 0;
  isPageChanged = false;

  objectName = DONATIONS_OBJECT;
  fields = {
    name: NAME_FIELD,
    description: DESCRIPTION_FIELD,
    dateTime: DATE_TIME_FIELD,
  };

  outputCols = [
    { label: "Ticket Number", fieldName: "tikNum" },
    { label: "DateTime", fieldName: "dateTime" },
    { label: "Amount", fieldName: "amount" },
    { label: "Single ticket count", fieldName: "additional_tikNum" }
  ]


  @wire(getRecords) getDonationsRecords(res) {
    if (res.data) {
      console.log('>>>> ', res.data);
      this.donations = res.data;
      let donatorsTickets = [];
      this.donations.forEach(({ i42as__Amount__c, i42as__DateTime__c, Id }) => {
        let delta = i42as__Amount__c < this.ticketPrice ? 1 : Math.floor(i42as__Amount__c / this.ticketPrice)
        for (let i = 1; i <= delta; i++) {
          donatorsTickets.push({
            id: Id,
            amount: i42as__Amount__c,
            dateTime: i42as__DateTime__c,
            additional_tikNum: i
          });
        }
      });


      let copy = donatorsTickets.map((el, i) => {
        return { ...el, tikNum: i }
      });
      this.processRecords(copy);

      this.summaryLine = `Всього квитків: ${this.donatorsTickets.length}, вартість одного квитка: ${this.ticketPrice}`;
    }
    if (res.data || res.error) this.isLoading = false;
  }

  processRecords(data) {
    this.donatorsTickets = data;
    this.totalTicketsCount = data.length;
    this.totalPage = Math.ceil(this.totalTicketsCount / this.pageSize);

    this.data = this.donatorsTickets.slice(0, this.pageSize);
    this.endingRecord = this.pageSize;
    this.outputCols = [...this.outputCols];
  }

  previousHandler() {
    this.isPageChanged = true;
    if (this.page > 1) {
      this.page = this.page - 1; //decrease page by 1
      this.displayRecordPerPage(this.page);
    }
  }

  //clicking on next button this method will be called
  nextHandler() {
    this.isPageChanged = true;
    if ((this.page < this.totalPage) && this.page !== this.totalPage) {
      this.page = this.page + 1; //increase page by 1
      this.displayRecordPerPage(this.page);
    }
  }

  displayRecordPerPage(page) {
    this.startingRecord = ((page - 1) * this.pageSize);
    this.endingRecord = (this.pageSize * page);

    this.endingRecord = (this.endingRecord > this.totalRecountCount)
      ? this.totalRecountCount : this.endingRecord;

    this.data = this.donatorsTickets.slice(this.startingRecord, this.endingRecord);
    this.startingRecord = this.startingRecord + 1;
  }

  findWinner() {
    this.isLoading = true;

    for (let i = 0; i < 3; i++){
      let numberOfTickets = this.donatorsTickets.length - 1;
      let randomIndex = Math.round(numberOfTickets * Math.random());
      let randomRecord = this.donatorsTickets[randomIndex];

      // this.recordId = randomRecord.id;
      this.records.push(randomRecord);
    }
    this.records = [...this.records];

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }
}