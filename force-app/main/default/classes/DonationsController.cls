public with sharing class DonationsController {

    @AuraEnabled(cacheable=true)
    public static List<Donations__c> getRecords(){
        List<Donations__c> donations = [
            SELECT Id, DateTime__c, Date__c, Description__c, Amount__c
            FROM Donations__c
            WHERE Excluded_from_lottery__c = FALSE
            LIMIT 200];
        return donations;
    }
}