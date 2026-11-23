create or replace function private.assert_posted_ledger_entry_balanced()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_status text;
  debit_total numeric(30,7);
  credit_total numeric(30,7);
begin
  select status into v_status from private.ledger_transactions where id = new.transaction_id;
  if v_status = 'posted' then
    select coalesce(sum(e.amount_pi) filter (where e.entry_side = 'debit'), 0),
           coalesce(sum(e.amount_pi) filter (where e.entry_side = 'credit'), 0)
      into debit_total, credit_total
      from private.ledger_entries e where e.transaction_id = new.transaction_id;
    if debit_total <= 0 or debit_total <> credit_total then
      raise exception 'Posted ledger transaction % is unbalanced: debits % do not equal credits %',
        new.transaction_id, debit_total, credit_total;
    end if;
  end if;
  return new;
end;
$$;

create constraint trigger ledger_entry_insert_must_preserve_balance
after insert on private.ledger_entries
deferrable initially deferred
for each row execute function private.assert_posted_ledger_entry_balanced();
