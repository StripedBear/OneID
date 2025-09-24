"""add_recovery_fields

Revision ID: g3a4b5c6d7e8
Revises: f2a3b4c5d6e7
Create Date: 2024-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'g3a4b5c6d7e8'
down_revision = 'f2a3b4c5d6e7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add recovery fields to users table
    op.add_column('users', sa.Column('otp_code', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('otp_expires_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('recovery_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('recovery_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remove recovery fields from users table
    op.drop_column('users', 'recovery_expires_at')
    op.drop_column('users', 'recovery_token')
    op.drop_column('users', 'otp_expires_at')
    op.drop_column('users', 'otp_code')
