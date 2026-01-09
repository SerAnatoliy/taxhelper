"""add soft delete columns

Revision ID: 3cc4b609d4ac
Revises: 16f45593f315
Create Date: 2025-01-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '3cc4b609d4ac'
down_revision: Union[str, None] = '16f45593f315'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_deleted column WITH server_default for existing rows
    op.add_column('invoices', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('invoices', sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    op.add_column('transactions', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('transactions', sa.Column('deleted_at', sa.DateTime(), nullable=True))
    
    op.create_index('ix_invoices_is_deleted', 'invoices', ['is_deleted'], unique=False)
    op.create_index('ix_transactions_is_deleted', 'transactions', ['is_deleted'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_transactions_is_deleted', table_name='transactions')
    op.drop_index('ix_invoices_is_deleted', table_name='invoices')
    op.drop_column('transactions', 'deleted_at')
    op.drop_column('transactions', 'is_deleted')
    op.drop_column('invoices', 'deleted_at')
    op.drop_column('invoices', 'is_deleted')