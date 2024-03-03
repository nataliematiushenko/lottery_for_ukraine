import { LightningElement, api, track, wire } from 'lwc';
import tickets_channel from "@salesforce/messageChannel/tickets__c";
import { publish, MessageContext } from "lightning/messageService";
import getRecords from '@salesforce/apex/DonationsController.getRecords';

export default class DigitsViewDonators extends LightningElement {
  @api ticketPrice = 50;
  style = "height: 42 vh";
  @track participants;
  @track tickets = [];
  @track ticketsToDisplay = [];
  @track winners = [];
  totalTickets;
  totalParticipants;

  @wire(MessageContext)
  messageContext;

  async connectedCallback() {
    let participants = await getRecords();

    this.participants = participants;
    this.totalParticipants = this.participants.length;
  }

  generateTickets() {
    if (!this.totalTickets) {


      let tix = 1;
      this.participants.forEach(p => {
        let delta = p.i42as__Amount__c < this.ticketPrice ? 1 : Math.floor(p.i42as__Amount__c / this.ticketPrice);
        for (let i = 1; i <= delta; i++) {
          this.tickets.push({
            t_number: tix,
            personal_t_num: i,
            ...p
          });
          tix++;
        }
      });
      this.ticketsToDisplay = this.tickets;
      console.log(JSON.parse(JSON.stringify(this.ticketsToDisplay)));
      this.totalTickets = this.tickets.length;
    }
  }

  findWinners() {
    const prizes = [
      "Трикотажний костюм від @hochu.brand",
      "Футболка на вибір від @vidro.ua",
      "Свічковий бокс від @beton_home",
      "Стартер пек батончиків FIZI від @fizi.ua",
      "Суха суміш для приготування коктейлю від @uamade.ua",
      "Горня від @uamade.ua",
      "«Лексикон таємних знань» з автографом Тараса Прохаська"
    ];

    for (let i = 0; i < prizes.length; i++) {
      let indexes = this.tickets.length - 1;
      let randomIndex = Math.round(indexes * Math.random());
      let randomRecord = this.tickets[randomIndex];

      // Add the prize to the winner
      randomRecord.prize = prizes[i];

      console.log(`winner #${i} : `, randomRecord);

      this.winners.push(randomRecord);
      this.tickets = this.excludeWinner(randomRecord);
    }
    this.style = '';

    publish(this.messageContext, tickets_channel, { list: this.winners });
  }

  excludeWinner(i) {
    let copy = this.tickets.filter(t => t.i42as__NickName__c !== i.i42as__NickName__c);
    return copy;
  }

}