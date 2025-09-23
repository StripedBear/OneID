"""add_unique_group_name_constraint

Revision ID: f2a3b4c5d6e7
Revises: f1a2b3c4d5e6
Create Date: 2024-01-01 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2a3b4c5d6e7'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add unique constraint for group name per user
    op.create_unique_constraint('uq_group_name_user', 'groups', ['name', 'user_id'])


def downgrade() -> None:
    # Remove unique constraint
    op.drop_constraint('uq_group_name_user', 'groups', type_='unique')
