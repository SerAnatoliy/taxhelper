"""
API routers package.
"""
from routers.auth import router as auth_router
from routers.expenses import router as expenses_router
from routers.bank import router as bank_router
from routers.veriff import router as veriff_router
from routers.reminders import router as reminders_router
from routers.chat import router as chat_router
from routers.invoices import router as invoice_router
from routers.dashboard import router as dashboard_router
from routers.reports import router as reports_router
from routers.verifactu_events import router as verifactu_events_router
from routers.aeat_submission import router as aeat_router

__all__ = [
    "auth_router",
    "expenses_router",
    "bank_router",
    "veriff_router",
    "reminders_router",
    "chat_router",
    "invoice_router",
    "dashboard_router",
    "reports_router",
    "verifactu_events_router",
    "aeat_router",
]
