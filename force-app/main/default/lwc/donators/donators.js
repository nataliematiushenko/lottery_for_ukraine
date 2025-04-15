import { LightningElement, api, track, wire } from 'lwc';
import tickets_channel from "@salesforce/messageChannel/tickets__c";
import { publish, MessageContext } from "lightning/messageService";
import getDonationsFromMono from '@salesforce/apex/MonoRestServiceController.getDonationsFromMono';

export default class Donators extends LightningElement {
  @api ticketPrice = 1;
  style = "height: 42 vh";
  @track participants;
  @track tickets = [];
  @track ticketsToDisplay = [];
  @track winners = [];
  totalParticipants;

  @wire(MessageContext)
  messageContext;

  prizes;
  token;
  jarLabel;
  fromDate;
  isLoading = false;

  get disableTicketsGeneration() {
    return !this.jarLabel || !this.token || !this.fromDate;
  }

  setPrizes(event) {
    this.prizes = event.detail.value?.split(',').filter(Boolean).map(e => e.trim()) || [];
  }

  setStartDate(event) {
    this.fromDate = event.target.value;
  }

  setToken(event) {
    this.token = event.target.value;
  }

  setJarTitle(event) {
    this.jarLabel = event.target.value;
  }

  generateTicketsFromMono() {
    this.isLoading = true;

    getDonationsFromMono({ token: this.token, label: this.jarLabel, from_date: this.fromDate })
      .then((resp) => {
        this.participants = JSON.parse(resp);
        this.totalParticipants = this.participants.length;
      })
      .then(() => {
        this.assignTickets();
      })
      .catch(error => {
        console.error('Error fetching Mono donations:', error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  assignTickets() {
    let tix = 1;
    this.participants.forEach(p => {
      let delta = p.amount < this.ticketPrice ? 1 : Math.floor(p.amount / this.ticketPrice);
      for (let i = 1; i <= delta; i++) {
        this.tickets.push({
          t_number: tix,
          personal_t_num: i,
          ...p
        });
        tix++;
      }
    });
    this.ticketsToDisplay = JSON.parse(JSON.stringify(this.tickets));

    this.totalTickets = this.ticketsToDisplay.length;
  }


  findWinners() {

    for (let i = 0; i < this.prizes.length; i++) {
      let indexes = this.tickets.length - 1;
      if (indexes >= 0) {
        let randomIndex = Math.round(indexes * Math.random());
        let randomRecord = this.tickets[randomIndex];

        // Add the prize to the winner
        randomRecord.prize = this.prizes[i];

        console.log(`winner #${i} : `, randomRecord);

        this.winners.push(randomRecord);
        this.tickets = this.excludeWinner(randomRecord);
      } else {
        break; // if there are more prizes than tickets, stop
      }
    }
    this.style = '';

    publish(this.messageContext, tickets_channel, { list: this.winners });
  }

  excludeWinner(i) {
    let copy = this.tickets.filter(t => t.comment !== i.comment);
    return copy;
  }

}