create or replace function public.claim_source_refresh(
  p_source_key text,
  p_min_interval_seconds integer default 120
)
returns boolean language plpgsql set search_path = '' as $$
declare v_claimed boolean := false;
begin
  update public.source_registry
     set last_checked_at = now(), updated_at = now()
   where source_key = p_source_key and enabled = true
     and (last_checked_at is null or last_checked_at < now() - make_interval(secs => greatest(coalesce(p_min_interval_seconds, 120), 30)))
  returning true into v_claimed;
  return coalesce(v_claimed, false);
end;
$$;

create or replace function public.ingest_news_batch(p_source_key text, p_rows jsonb)
returns integer language plpgsql set search_path = '' as $$
declare v_source_id uuid; v_count integer := 0;
begin
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'News batch must be a JSON array'; end if;
  select id into v_source_id from public.source_registry where source_key = p_source_key and enabled = true for update;
  if v_source_id is null then raise exception 'Unknown or disabled news source'; end if;
  insert into public.news_items (
    source_id, external_id, category, title, summary, canonical_url, source_domain,
    language_code, source_country, published_at, observed_at, fetched_at, content_hash, evidence_class, metadata
  )
  select v_source_id, r.external_id, r.category, r.title, r.summary, r.canonical_url, r.source_domain,
    r.language_code, r.source_country, r.published_at, coalesce(r.observed_at, now()), now(),
    r.content_hash, coalesce(r.evidence_class, 'unverified'), coalesce(r.metadata, '{}'::jsonb)
  from jsonb_to_recordset(p_rows) as r(
    external_id text, category text, title text, summary text, canonical_url text, source_domain text,
    language_code text, source_country text, published_at timestamptz, observed_at timestamptz,
    content_hash text, evidence_class text, metadata jsonb
  )
  on conflict (source_id, external_id) do update set
    category=excluded.category, title=excluded.title, summary=excluded.summary,
    canonical_url=excluded.canonical_url, source_domain=excluded.source_domain,
    language_code=excluded.language_code, source_country=excluded.source_country,
    published_at=excluded.published_at, observed_at=excluded.observed_at, fetched_at=now(),
    content_hash=excluded.content_hash, evidence_class=excluded.evidence_class, metadata=excluded.metadata;
  get diagnostics v_count = row_count;
  update public.source_registry set last_success_at=now(), last_error_at=null, last_error_code=null, updated_at=now() where id=v_source_id;
  return v_count;
end;
$$;

create or replace function public.ingest_hazard_batch(p_source_key text, p_rows jsonb)
returns integer language plpgsql set search_path = '' as $$
declare v_source_id uuid; v_count integer := 0;
begin
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'Hazard batch must be a JSON array'; end if;
  select id into v_source_id from public.source_registry where source_key=p_source_key and enabled=true for update;
  if v_source_id is null then raise exception 'Unknown or disabled hazard source'; end if;
  insert into public.hazard_events (
    source_id, external_id, hazard_type, title, description, severity_label, magnitude,
    latitude, longitude, location_label, occurred_at, observed_at, source_url, status, properties
  )
  select v_source_id, r.external_id, r.hazard_type, r.title, r.description, r.severity_label, r.magnitude,
    r.latitude, r.longitude, r.location_label, r.occurred_at, coalesce(r.observed_at, now()),
    r.source_url, coalesce(r.status, 'active'), coalesce(r.properties, '{}'::jsonb)
  from jsonb_to_recordset(p_rows) as r(
    external_id text, hazard_type text, title text, description text, severity_label text, magnitude numeric,
    latitude numeric, longitude numeric, location_label text, occurred_at timestamptz,
    observed_at timestamptz, source_url text, status text, properties jsonb
  )
  on conflict (source_id, external_id) do update set
    hazard_type=excluded.hazard_type, title=excluded.title, description=excluded.description,
    severity_label=excluded.severity_label, magnitude=excluded.magnitude, latitude=excluded.latitude,
    longitude=excluded.longitude, location_label=excluded.location_label, occurred_at=excluded.occurred_at,
    observed_at=excluded.observed_at, source_url=excluded.source_url, status=excluded.status, properties=excluded.properties;
  get diagnostics v_count = row_count;
  update public.source_registry set last_success_at=now(), last_error_at=null, last_error_code=null, updated_at=now() where id=v_source_id;
  return v_count;
end;
$$;

revoke all on function public.claim_source_refresh(text,integer) from public, anon, authenticated;
revoke all on function public.ingest_news_batch(text,jsonb) from public, anon, authenticated;
revoke all on function public.ingest_hazard_batch(text,jsonb) from public, anon, authenticated;
grant execute on function public.claim_source_refresh(text,integer) to service_role;
grant execute on function public.ingest_news_batch(text,jsonb) to service_role;
grant execute on function public.ingest_hazard_batch(text,jsonb) to service_role;
