public with sharing class DonationsController {

    @AuraEnabled(cacheable=true)
    public static List<donation_ua__c> getRecords(){
        List<donation_ua__c> donations = [
            SELECT Id, DateTime__c, Description__c, Amount__c
            FROM donation_ua__c];
        return donations;
    }
}