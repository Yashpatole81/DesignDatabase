from typing import List
from app.schemas.schema_design import SchemaDesign

def generate_sql(schema: SchemaDesign) -> List[str]:
    """
    Converts a standardized SchemaDesign JSON wrapper into Postgres/MySQL dialect SQL.
    Returns a list of SQL statements.
    """
    sql_statements = []
    table_map = {t.id: t for t in schema.tables}
    
    for table in schema.tables:
        table_name = table.name
        columns_sql = []
        constraints_sql = []
        
        for col in table.columns:
            # Base type
            col_def = f"{col.name} {col.type}"
            
            # Simple inline constraints
            if col.key == "PK":
                col_def += " PRIMARY KEY"
            elif col.key == "UNIQUE":
                col_def += " UNIQUE"
                
            columns_sql.append(col_def)
            
        # Map explicit Foreign Key constraints natively from relationships map
        for rel in schema.relationships:
            if rel.sourceTableId == table.id:
                target_table = table_map.get(rel.targetTableId)
                if target_table:
                    source_col = next((c for c in table.columns if c.id == rel.sourceColumnId), None)
                    target_col = next((c for c in target_table.columns if c.id == rel.targetColumnId), None)
                    
                    if source_col and target_col:
                        constraints_sql.append(
                            f"FOREIGN KEY ({source_col.name}) REFERENCES {target_table.name}({target_col.name})"
                        )
                        
        all_definitions = columns_sql + constraints_sql
        if all_definitions:
            create_stmt = f"CREATE TABLE {table_name} (\n  " + ",\n  ".join(all_definitions) + "\n);"
            sql_statements.append(create_stmt)
            
    return sql_statements
