public with sharing class DonationsController {

    @AuraEnabled(cacheable=true)
    public static List<Donations__c> getRecords(){
        List<Donations__c> donations = [
            SELECT Id, DateTime__c, Date__c, Description__c, Amount__c
            FROM Donations__c
            WHERE Description__c != 'Від: Олесь Матюшенко'
                AND Description__c != 'Від: Наталія Матюшенко'
                AND Description__c != 'З чорної картки'
            LIMIT 200];
        return donations;
    }
}