"""add_groups_table

Revision ID: f1a2b3c4d5e6
Revises: d4f8e9a2b3c1
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'd4f8e9a2b3c1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create groups table
    op.create_table('groups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_groups_id'), 'groups', ['id'], unique=False)
    
    # Add group_id column to channels table
    op.add_column('channels', sa.Column('group_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_channels_group_id', 'channels', 'groups', ['group_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    # Remove group_id column from channels table
    op.drop_constraint('fk_channels_group_id', 'channels', type_='foreignkey')
    op.drop_column('channels', 'group_id')
    
    # Drop groups table
    op.drop_index(op.f('ix_groups_id'), table_name='groups')
    op.drop_table('groups')
