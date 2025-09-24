"""change_channels_groups_to_many_to_many

Revision ID: h4a5b6c7d8e9
Revises: g3a4b5c6d7e8
Create Date: 2024-01-15 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'h4a5b6c7d8e9'
down_revision = 'g3a4b5c6d7e8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create channel_groups table
    op.create_table(
        'channel_groups',
        sa.Column('channel_id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['channel_id'], ['channels.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('channel_id', 'group_id')
    )
    
    # Migrate existing data from group_id to channel_groups
    connection = op.get_bind()
    connection.execute(sa.text("""
        INSERT INTO channel_groups (channel_id, group_id)
        SELECT id, group_id
        FROM channels
        WHERE group_id IS NOT NULL
    """))
    
    # Remove group_id column from channels table
    # Check if constraint exists before dropping it
    inspector = sa.inspect(connection)
    constraints = inspector.get_foreign_keys('channels')
    constraint_name = None
    for constraint in constraints:
        if 'group_id' in constraint.get('constrained_columns', []):
            constraint_name = constraint.get('name')
            break
    
    if constraint_name:
        op.drop_constraint(constraint_name, 'channels', type_='foreignkey')
    
    # Drop index if it exists
    indexes = inspector.get_indexes('channels')
    index_name = None
    for index in indexes:
        if 'group_id' in index.get('column_names', []):
            index_name = index.get('name')
            break
    
    if index_name:
        op.drop_index(index_name, 'channels')
    
    op.drop_column('channels', 'group_id')


def downgrade() -> None:
    # Add group_id column back to channels table
    op.add_column('channels', sa.Column('group_id', sa.Integer(), nullable=True))
    
    # Migrate data back from channel_groups to group_id
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE channels
        SET group_id = (
            SELECT group_id
            FROM channel_groups
            WHERE channel_groups.channel_id = channels.id
            LIMIT 1
        )
        WHERE EXISTS (
            SELECT 1
            FROM channel_groups
            WHERE channel_groups.channel_id = channels.id
        )
    """))
    
    # Add foreign key constraint
    op.create_foreign_key('fk_channels_group_id_groups', 'channels', 'groups', ['group_id'], ['id'], ondelete='SET NULL')
    op.create_index('ix_channels_group_id', 'channels', ['group_id'], unique=False)
    
    # Drop channel_groups table
    op.drop_table('channel_groups')
