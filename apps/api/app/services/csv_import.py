import csv
import io
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.balance import BalanceSnapshot
from app.models.import_job import ImportJob
from app.models.transaction import Transaction


def process_csv_import(db: Session, content: bytes, import_type: str, source_name: str) -> ImportJob:
    job = ImportJob(source_name=source_name, import_type=import_type, status="processing")
    db.add(job)
    db.flush()

    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    inserted = 0

    try:
        if import_type == "balances":
            for row in reader:
                account = db.query(Account).filter(Account.id == int(row["account_id"])).first()
                if not account:
                    continue
                db.add(
                    BalanceSnapshot(
                        account_id=account.id,
                        snapshot_date=datetime.strptime(row["snapshot_date"], "%Y-%m-%d").date(),
                        balance=float(row["balance"]),
                    )
                )
                account.current_balance = float(row["balance"])
                inserted += 1
        elif import_type == "transactions":
            for row in reader:
                db.add(
                    Transaction(
                        account_id=int(row["account_id"]),
                        transaction_date=datetime.strptime(row["transaction_date"], "%Y-%m-%d").date(),
                        description=row["description"],
                        amount=float(row["amount"]),
                        category=row.get("category"),
                        merchant=row.get("merchant"),
                    )
                )
                inserted += 1
        else:
            raise ValueError("import_type must be balances or transactions")

        job.status = "completed"
        job.message = f"Imported {inserted} rows."
        db.commit()
        db.refresh(job)
        return job
    except Exception as exc:
        db.rollback()
        failed = ImportJob(source_name=source_name, import_type=import_type, status="failed", message=str(exc))
        db.add(failed)
        db.commit()
        db.refresh(failed)
        return failed
