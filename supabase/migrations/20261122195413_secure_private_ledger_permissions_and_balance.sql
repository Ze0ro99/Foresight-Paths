grant usage on schema private to service_role;
grant all privileges on all tables in schema private to service_role;
grant all privileges on all sequences in schema private to service_role;
grant execute on all functions in schema private to service_role;
grant all privileges on public.source_registry, public.news_items, public.hazard_events, public.risk_assessments, public.agent_templates, public.scenario_snapshots to service_role;

create or replace function private.assert_balanced_ledger_transaction()
returns trigger language plpgsql set search_path = '' as $$
declare
  debit_total numeric(30,7);
  credit_total numeric(30,7);
begin
  if new.status <> 'posted' then return new; end if;
  select coalesce(sum(e.amount_pi) filter (where e.entry_side = 'debit'), 0),
         coalesce(sum(e.amount_pi) filter (where e.entry_side = 'credit'), 0)
    into debit_total, credit_total
    from private.ledger_entries e
   where e.transaction_id = new.id;
  if debit_total <= 0 or debit_total <> credit_total then
    raise exception 'Ledger transaction % cannot be posted: debits % do not equal credits %',
      new.id, debit_total, credit_total;
  end if;
  return new;
end;
$$;
create constraint trigger ledger_transaction_must_balance
after insert or update of status on private.ledger_transactions
deferrable initially deferred
for each row execute function private.assert_balanced_ledger_transaction();
