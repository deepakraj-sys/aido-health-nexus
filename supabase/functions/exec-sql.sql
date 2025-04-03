
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION exec_sql(text) FROM public;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO postgres;
