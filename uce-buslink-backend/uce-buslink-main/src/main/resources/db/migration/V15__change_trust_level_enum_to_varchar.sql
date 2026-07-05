-- Convertir la columna level de enum PostgreSQL a VARCHAR

ALTER TABLE trust_scores
ALTER COLUMN level TYPE VARCHAR(20)
USING level::text;