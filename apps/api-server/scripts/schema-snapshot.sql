WITH schema_objects AS (
    SELECT
        'extension' AS kind,
        'public' AS parent,
        extname AS name,
        extname AS definition
    FROM pg_extension
    WHERE extname <> 'plpgsql'

    UNION ALL

    SELECT
        'table' AS kind,
        n.nspname AS parent,
        quote_ident(c.relname) AS name,
        c.relkind::text AS definition
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'

    UNION ALL

    SELECT
        'column' AS kind,
        n.nspname || '.' || quote_ident(c.relname) AS parent,
        a.attname AS name,
        jsonb_build_object(
            'type',
            pg_catalog.format_type(a.atttypid, a.atttypmod),
            'notNull',
            a.attnotnull,
            'default',
            pg_get_expr(d.adbin, d.adrelid),
            'identity',
            a.attidentity
        )::text AS definition
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid
        AND d.adnum = a.attnum
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND a.attnum > 0
      AND NOT a.attisdropped

    UNION ALL

    SELECT
        'constraint' AS kind,
        n.nspname || '.' || quote_ident(c.relname) AS parent,
        con.conname AS name,
        pg_get_constraintdef(con.oid) AS definition
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'

    UNION ALL

    SELECT
        'index' AS kind,
        schemaname || '.' || quote_ident(tablename) AS parent,
        indexname AS name,
        indexdef AS definition
    FROM pg_indexes
    WHERE schemaname = 'public'

    UNION ALL

    SELECT
        'trigger' AS kind,
        n.nspname || '.' || quote_ident(c.relname) AS parent,
        t.tgname AS name,
        pg_get_triggerdef(t.oid) AS definition
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND NOT t.tgisinternal
)
SELECT kind || E'\t' || parent || E'\t' || name || E'\t' || definition
FROM schema_objects
ORDER BY kind, parent, name, definition;
