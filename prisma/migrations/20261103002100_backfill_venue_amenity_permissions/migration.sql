-- Acrescenta a permissao de caracteristicas somente no par correspondente de servicos.
-- A migration inicial criou `UserPermission`; o schema atual mapeia `userVenuePermission`.
-- O backfill usa a tabela que existir neste banco.

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
    'SET `permissions` = CONCAT(`permissions`, '',VIEW_VENUE_AMENITIES'') ',
    'WHERE FIND_IN_SET(''VIEW_VENUE_SERVICES'', `permissions`) > 0 ',
    'AND FIND_IN_SET(''VIEW_VENUE_AMENITIES'', `permissions`) = 0'
);

PREPARE stmt_view FROM @sql_view;
EXECUTE stmt_view;
DEALLOCATE PREPARE stmt_view;

SET @sql_edit = CONCAT(
    'UPDATE `', @perm_table, '` ',
    'SET `permissions` = CONCAT(`permissions`, '',EDIT_VENUE_AMENITIES'') ',
    'WHERE FIND_IN_SET(''EDIT_VENUE_SERVICES'', `permissions`) > 0 ',
    'AND FIND_IN_SET(''EDIT_VENUE_AMENITIES'', `permissions`) = 0'
);

PREPARE stmt_edit FROM @sql_edit;
EXECUTE stmt_edit;
DEALLOCATE PREPARE stmt_edit;
