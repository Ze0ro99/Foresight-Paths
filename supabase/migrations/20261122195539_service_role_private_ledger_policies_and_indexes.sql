create policy "service role manages payment intents" on private.payment_intents for all to service_role using (true) with check (true);
create policy "service role manages ledger accounts" on private.ledger_accounts for all to service_role using (true) with check (true);
create policy "service role manages ledger transactions" on private.ledger_transactions for all to service_role using (true) with check (true);
create policy "service role manages ledger entries" on private.ledger_entries for all to service_role using (true) with check (true);
create index ledger_transactions_payment_intent_idx on private.ledger_transactions (payment_intent_id);
