-- Idempotent permission backfill. Applied on PlanetScale main on 2026-11-14
-- (9 rows VIEW_VENUE_PHOTOS, 9 rows EDIT_VENUE_PHOTOS). Do not reapply blindly;
-- a second run is safe because FIND_IN_SET = 0 skips rows that already have it.
-- Grants VIEW_VENUE_PHOTOS to rows that already have VIEW_VENUE_SITES,
-- and EDIT_VENUE_PHOTOS to rows that already have EDIT_VENUE_SITE.
-- FIND_IN_SET = 0 keeps a second run from appending the same string.

SET @perm_table = (
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) IN ('uservenuepermission', 'userpermission')
    ORDER BY CASE WHEN LOWER(TABLE_NAME) = 'uservenuepermission' THEN 0 ELSE 1 END
    LIMIT 1
);

SET @sql_view = CONCAT(
    'UPDATE `', @perm_table, '` ',
    'SET `permissions` = CONCAT(`permissions`, '',VIEW_VENUE_PHOTOS'') ',
    'WHERE FIND_IN_SET(''VIEW_VENUE_SITES'', `permissions`) > 0 ',
    'AND FIND_IN_SET(''VIEW_VENUE_PHOTOS'', `permissions`) = 0'
);

PREPARE stmt_view FROM @sql_view;
EXECUTE stmt_view;
DEALLOCATE PREPARE stmt_view;

SET @sql_edit = CONCAT(
    'UPDATE `', @perm_table, '` ',
    'SET `permissions` = CONCAT(`permissions`, '',EDIT_VENUE_PHOTOS'') ',
    'WHERE FIND_IN_SET(''EDIT_VENUE_SITE'', `permissions`) > 0 ',
    'AND FIND_IN_SET(''EDIT_VENUE_PHOTOS'', `permissions`) = 0'
);

PREPARE stmt_edit FROM @sql_edit;
EXECUTE stmt_edit;
DEALLOCATE PREPARE stmt_edit;
