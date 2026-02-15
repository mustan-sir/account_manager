from datetime import date

from dateutil.relativedelta import relativedelta


def resolve_next_due_date(due_day: int, due_date_override: date | None = None) -> date:
    if due_date_override:
        return due_date_override

    today = date.today()
    safe_due_day = max(1, min(28, due_day))
    current_cycle = today.replace(day=safe_due_day)
    if current_cycle >= today:
        return current_cycle
    return (today + relativedelta(months=1)).replace(day=safe_due_day)
