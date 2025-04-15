public with sharing class MonoRestServiceController {

    private static final String BASE_URL = 'https://api.monobank.ua';
    private static final String GET_ACCOUNT_DATA_ENDPOINT = '/personal/statement';
    private static final String GET_CLIENT_INFO_ENDPOINT = '/personal/client-info';
    private static final String TOKEN_KEY = 'X-Token';


    private static String KEY;

    @AuraEnabled
    public static string getDonationsFromMono(String token, String label, String from_date) {
        try {
            KEY = token;
            String accId = getAccountIdByTitle(label);
            String resp = makeCallout(accId, Date.valueOf(from_date));
            System.debug('Response: ' + resp);
            List<Income> incomes = (List<Income>) JSON.deserialize(resp, List<Income>.class);
            List<Income> incomesWithComments = new List<Income>();
            for (Income income : incomes) {
                if(String.isNotEmpty(income.comment)) {
                    if (String.isNotEmpty(income.comment) && income.comment != 'Поповнення рахунку банки') {
                        incomesWithComments.add(new Income(income.comment, income.amount / 100, income.id));
                    }
                }
            }
            return JSON.serialize(incomesWithComments);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    private static String getAccountIdByTitle(String accTitle) {
        String resp = getResponse(GET_CLIENT_INFO_ENDPOINT);
        if (String.isEmpty(resp)) {
            throw new AuraHandledException('Failed to get response from MonoBank API');
        }
        ClientInfo clientInfo = (ClientInfo) JSON.deserialize(resp, ClientInfo.class);
        for(ClientInfo.Jar jar : clientInfo.jars) {
            if (jar.title == accTitle) {
                return jar.id;
            }
        }
        throw new AuraHandledException('Account with title ' + accTitle + ' not found');
    }

    private static String makeCallout(String accId, Date from_date) {
        Integer from_int = convertToUnixTime(from_date);
        Integer to_int = convertToUnixTime(DateTime.newInstance(Date.today(), Time.newInstance(23, 59, 59, 0)));

        String endpoint = GET_ACCOUNT_DATA_ENDPOINT + '/' + accId + '/' + from_int + '/' + to_int;
        return getResponse(endpoint);
    }

    private static String getResponse(String endpoint) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(BASE_URL + endpoint);
        request.setMethod('GET');
        request.setHeader(TOKEN_KEY, KEY);

        HttpResponse response = http.send(request);
        if (response.getStatusCode() != 200) {
            throw new CalloutException('Failed to get response from MonoBank API: ' + response.getStatus());
        }
        return response.getBody();
    }

    private static Integer convertToUnixTime(DateTime date_x) {
        return (Integer)(date_x.getTime() / 1000);
    }
}