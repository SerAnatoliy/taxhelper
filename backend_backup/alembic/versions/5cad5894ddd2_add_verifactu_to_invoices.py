"""Add VERIFACTU fields to invoices table

Revision ID: 5cad5894ddd2
Revises: 90b7c109dbe3
Create Date: 2026-01-07

IDEMPOTENT VERSION - handles cases where objects already exist
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = '5cad5894ddd2'
down_revision: Union[str, None] = '90b7c109dbe3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    bind = op.get_bind()
    insp = inspect(bind)
    columns = [c['name'] for c in insp.get_columns(table_name)]
    return column_name in columns


def table_exists(table_name):
    """Check if a table exists"""
    bind = op.get_bind()
    insp = inspect(bind)
    return table_name in insp.get_table_names()


def index_exists(index_name):
    """Check if an index exists"""
    bind = op.get_bind()
    result = bind.execute(sa.text(
        f"SELECT 1 FROM pg_indexes WHERE indexname = '{index_name}'"
    ))
    return result.fetchone() is not None


def upgrade() -> None:
    # ===========================================
    # 1. Add VERIFACTU columns to invoices table
    # ===========================================
    
    columns_to_add = [
        ('verifactu_hash', sa.String(64), {}),
        ('previous_hash', sa.String(64), {}),
        ('qr_code_data', sa.Text(), {}),
        ('verifactu_timestamp', sa.DateTime(), {}),
        ('verifactu_record_type', sa.String(10), {'server_default': 'F1'}),
        ('verifactu_submitted', sa.Boolean(), {'nullable': False, 'server_default': sa.text('false')}),
        ('aeat_response_code', sa.String(20), {}),
        ('aeat_csv', sa.String(30), {}),
        ('verifactu_xml', sa.Text(), {}),
    ]
    
    for col_name, col_type, kwargs in columns_to_add:
        if not column_exists('invoices', col_name):
            op.add_column('invoices', sa.Column(col_name, col_type, **kwargs))
    
    # Create indexes if they don't exist
    if not index_exists('ix_invoices_verifactu_hash'):
        op.create_index('ix_invoices_verifactu_hash', 'invoices', ['verifactu_hash'], unique=False)
    
    if not index_exists('ix_invoices_previous_hash'):
        op.create_index('ix_invoices_previous_hash', 'invoices', ['previous_hash'], unique=False)
    
    # ===========================================
    # 2. Create invoice_verifactu_events table
    # ===========================================
    
    if not table_exists('invoice_verifactu_events'):
        op.create_table(
            'invoice_verifactu_events',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, index=True),
            sa.Column('invoice_id', sa.Integer(), sa.ForeignKey('invoices.id'), nullable=False, index=True),
            sa.Column('event_type', sa.String(50), nullable=False),
            sa.Column('event_code', sa.String(20), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('hash_before', sa.String(64), nullable=True),
            sa.Column('hash_after', sa.String(64), nullable=False),
            sa.Column('ip_address', sa.String(45), nullable=True),
            sa.Column('user_agent', sa.String(500), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column('event_data', sa.JSON(), nullable=True),
        )
    
    # Create indexes if they don't exist (might have been created by create_table)
    if not index_exists('ix_invoice_verifactu_events_invoice_id'):
        op.create_index('ix_invoice_verifactu_events_invoice_id', 'invoice_verifactu_events', ['invoice_id'])
    
    if not index_exists('ix_invoice_verifactu_events_event_type'):
        op.create_index('ix_invoice_verifactu_events_event_type', 'invoice_verifactu_events', ['event_type'])
    
    if not index_exists('ix_invoice_verifactu_events_created_at'):
        op.create_index('ix_invoice_verifactu_events_created_at', 'invoice_verifactu_events', ['created_at'])


def downgrade() -> None:
    # Drop indexes (if exist)
    for idx_name in [
        'ix_invoice_verifactu_events_created_at',
        'ix_invoice_verifactu_events_event_type', 
        'ix_invoice_verifactu_events_invoice_id',
        'ix_invoices_previous_hash',
        'ix_invoices_verifactu_hash'
    ]:
        if index_exists(idx_name):
            op.drop_index(idx_name, table_name='invoice_verifactu_events' if 'events' in idx_name else 'invoices')
    
    # Drop table
    if table_exists('invoice_verifactu_events'):
        op.drop_table('invoice_verifactu_events')
    
    # Drop columns
    for col_name in [
        'verifactu_xml', 'aeat_csv', 'aeat_response_code', 'verifactu_submitted',
        'verifactu_record_type', 'verifactu_timestamp', 'qr_code_data',
        'previous_hash', 'verifactu_hash'
    ]:
        if column_exists('invoices', col_name):
            op.drop_column('invoices', col_name)