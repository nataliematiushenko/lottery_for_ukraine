public with sharing class DonationsController {

    @AuraEnabled(cacheable=true)
    public static List<Donation_for_UA__c> getRecords(){
        List<i42as__Donations_for_UA__c> donations = [
            SELECT Id, i42as__DateTime__c, i42as__Description__c, i42as__Amount__c
            FROM 	i42as__Donations_for_UA__c];
        return donations;
    }
}