create or replace function public.get_employee_dashboard_data()
returns table (
  employee_id uuid,
  employee_name text,
  initial_advance numeric,
  total_earned numeric,
  current_balance numeric
)
language sql
security definer
set search_path = public
as $$
  with transaction_totals as (
    select
      t.employee_id,
      coalesce(sum(case when t.transaction_type = 'WAGE' then t.amount else 0 end), 0) as total_earned,
      coalesce(sum(case when t.transaction_type = 'ADVANCE' then t.amount else 0 end), 0) as total_advance,
      coalesce(sum(case when t.transaction_type = 'DEDUCTION' then t.amount else 0 end), 0) as total_deduction
    from public.transactions t
    group by t.employee_id
  )
  select
    e.id as employee_id,
    e.name as employee_name,
    e.initial_advance,
    coalesce(tt.total_earned, 0) as total_earned,
    coalesce(tt.total_earned, 0) - (e.initial_advance + coalesce(tt.total_advance, 0) + coalesce(tt.total_deduction, 0)) as current_balance
  from public.employees e
  left join transaction_totals tt on tt.employee_id = e.id
  order by e.name asc;
$$;

grant execute on function public.get_employee_dashboard_data() to authenticated;
