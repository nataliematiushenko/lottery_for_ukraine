import { LightningElement, api, track, wire } from 'lwc';
import tickets_channel from "@salesforce/messageChannel/tickets__c";
import { publish, MessageContext } from "lightning/messageService";

const PARTICIPANTS = [
  {
    "name": "oxanalot",
    "amount": 50
  },
  {
    "name": "vikunichka",
    "amount": 50
  },
  {
    "name": "myrroslava",
    "amount": 500
  },
  {
    "name": "Nahorna_hanna",
    "amount": 50
  },
  {
    "name": "litvinenko13666",
    "amount": 100
  },
  {
    "name": "m_kosh",
    "amount": 200
  },
  {
    "name": "polina_nevediuk",
    "amount": 100
  },
  {
    "name": "zhen_shen14",
    "amount": 300
  },
  {
    "name": "alwayswonnadie",
    "amount": 100
  },
  {
    "name": "Єгор Л.",
    "amount": 150
  },
  {
    "name": "l8kout",
    "amount": 50
  },
  {
    "name": "_d.slb",
    "amount": 50
  },
  {
    "name": "margarita_cherry1",
    "amount": 300
  },
  {
    "name": "arinaaklepko",
    "amount": 200
  },
  {
    "name": "lkolomiytsev",
    "amount": 200
  },
  {
    "name": "Don_Benderivec",
    "amount": 50
  },
  {
    "name": "shevchenk0oo",
    "amount": 50
  },
  {
    "name": "polishchuk_lilia",
    "amount": 50
  },
  {
    "name": "goodbyedust",
    "amount": 150
  },
  {
    "name": "Наталія",
    "amount": 150
  },
  {
    "name": "Анна Ф.",
    "amount": 500
  },
  {
    "name": "nastalgja",
    "amount": 100
  },
  {
    "name": "678825585",
    "amount": 50
  },
  {
    "name": "yours_kat",
    "amount": 200
  },
  {
    "name": "artm_svk",
    "amount": 100
  },
  {
    "name": "hokkaido13_13_13",
    "amount": 50
  },
  {
    "name": "bookkania",
    "amount": 100
  },
  {
    "name": "tanya_malymuka",
    "amount": 100
  },
  {
    "name": "_nassophia",
    "amount": 60
  },
  {
    "name": "_tartak",
    "amount": 50
  },
  {
    "name": "manfoxcashew",
    "amount": 150
  },
  {
    "name": "svitlana.martyniuk",
    "amount": 50
  },
  {
    "name": "13, tw/DenysFromUA",
    "amount": 100
  },
  {
    "name": "arimaataa",
    "amount": 700
  },
  {
    "name": "lilshrm",
    "amount": 560.47
  },
  {
    "name": "mariasahaydak",
    "amount": 480
  },
  {
    "name": "a_berezjuk",
    "amount": 100
  }
];

export default class DigitsViewDonators extends LightningElement {
  @api ticketPrice = 50;
  style = "height: 42 vh";
  @track participants = PARTICIPANTS;
  @track tickets = [];
  @track ticketsToDisplay = [];
  @track winners = [];
  totalTickets;
  totalParticipants;

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    this.totalParticipants = this.participants.length;
  }

  generateTickets() {
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
    this.ticketsToDisplay = this.tickets;
    this.totalTickets = this.tickets.length;
  }

  findWinners() {
    const prizes = [
      "Дзеркало з врятованого скла від @shchos_cikave",
      "Сет шкарпеток від @sammyicon",
      "Набір для вʼязання гачком (на вибір) від @crochetty.kit",
      "Набір для вʼязання гачком (на вибір) від @crochetty.kit"
    ];

    for (let i = 0; i <= 3; i++) {
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
    let copy = this.tickets.filter(t => t.name !== i.name);
    return copy;
  }

}