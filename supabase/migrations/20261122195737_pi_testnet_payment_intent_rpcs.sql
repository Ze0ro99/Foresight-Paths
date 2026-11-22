alter table private.payment_intents
  add column plan_id text not null default 'legacy_unassigned',
  add column pi_txid text unique,
  add column transaction_verified boolean not null default false;

create or replace function public.sync_pi_payment_intent(
  p_payment_id text,
  p_user_uid text,
  p_amount_pi numeric,
  p_plan_id text,
  p_status text default 'created',
  p_txid text default null,
  p_transaction_verified boolean default false
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v private.payment_intents;
begin
  if p_payment_id is null or p_payment_id = '' or
     p_user_uid is null or p_user_uid = '' or
     p_amount_pi <= 0 or p_plan_id is null or p_plan_id = '' or
     p_status not in ('created','approved','completed') then
    raise exception 'Invalid payment intent parameters';
  end if;

  insert into private.payment_intents
    (idempotency_key, pi_payment_id, pi_user_uid, amount_pi, plan_id, network, status)
  values
    ('pi:' || p_payment_id, p_payment_id, p_user_uid, p_amount_pi, p_plan_id, 'testnet', 'created')
  on conflict (pi_payment_id) do nothing;

  select * into v
    from private.payment_intents
   where pi_payment_id = p_payment_id
   for update;

  if not found then raise exception 'Payment intent could not be loaded'; end if;
  if v.pi_user_uid <> p_user_uid or v.amount_pi <> p_amount_pi or v.plan_id <> p_plan_id or v.network <> 'testnet' then
    raise exception 'Payment intent does not match the verified user, amount, plan, or network';
  end if;

  if v.status = 'completed' then
    if p_status = 'completed' and (p_txid is null or v.pi_txid <> p_txid or not p_transaction_verified) then
      raise exception 'Completed payment cannot be changed or replayed with a different transaction';
    end if;
    return to_jsonb(v);
  end if;

  if p_status = 'approved' and v.status = 'created' then
    update private.payment_intents set status = 'approved' where id = v.id returning * into v;
  elsif p_status = 'completed' then
    if v.status <> 'approved' or p_txid is null or p_txid = '' or not p_transaction_verified then
      raise exception 'Payment must be approved and Pi transaction verified before completion';
    end if;
    update private.payment_intents
       set status = 'completed', pi_txid = p_txid, transaction_verified = true, completed_at = now()
     where id = v.id returning * into v;
  end if;
  return to_jsonb(v);
end;
$$;

create or replace function public.get_pi_payment_intent(p_payment_id text)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select to_jsonb(p) from private.payment_intents p where p.pi_payment_id = p_payment_id
$$;

revoke all on function public.sync_pi_payment_intent(text,text,numeric,text,text,text,boolean) from public, anon, authenticated;
revoke all on function public.get_pi_payment_intent(text) from public, anon, authenticated;
grant execute on function public.sync_pi_payment_intent(text,text,numeric,text,text,text,boolean) to service_role;
grant execute on function public.get_pi_payment_intent(text) to service_role;
