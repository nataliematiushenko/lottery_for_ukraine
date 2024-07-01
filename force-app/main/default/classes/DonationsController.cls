public with sharing class DonationsController {

    @AuraEnabled(cacheable=true)
    public static List<Donation__c> getRecords(){
        List<Donation__c> donations = [
            SELECT Id, NickName__c, Amount__c
            FROM Donation__c];
        return donations;
    }
}