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
    # First, update channels to point to the correct groups (lowest ID for each name+user combination)
    connection = op.get_bind()
    
    # Update channels to point to the group with the lowest ID for each name+user combination
    connection.execute(sa.text("""
        UPDATE channels 
        SET group_id = (
            SELECT MIN(g2.id) 
            FROM groups g2 
            WHERE g2.name = (
                SELECT g1.name 
                FROM groups g1 
                WHERE g1.id = channels.group_id
            ) 
            AND g2.user_id = (
                SELECT g1.user_id 
                FROM groups g1 
                WHERE g1.id = channels.group_id
            )
        )
        WHERE group_id IS NOT NULL
    """))
    
    # Now remove duplicate groups (keep the one with the lowest ID)
    connection.execute(sa.text("""
        DELETE FROM groups 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM groups 
            GROUP BY name, user_id
        )
    """))
    
    # Now add unique constraint for group name per user
    op.create_unique_constraint('uq_group_name_user', 'groups', ['name', 'user_id'])


def downgrade() -> None:
    # Remove unique constraint
    op.drop_constraint('uq_group_name_user', 'groups', type_='unique')
