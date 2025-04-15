public with sharing class Income {
    public String comment;
    public Integer amount;
    public String id;

    public Income(String comment, Integer amount, String id) {
        this.comment = comment;
        this.amount = amount;
        this.id = id;
    }
}