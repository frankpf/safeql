---------------------
-- Products table
---------------------
CREATE TYPE sstatus AS ENUM ('high', 'low');

CREATE TABLE products (
  name                text            NOT NULL PRIMARY KEY,
  available           boolean         NOT NULL DEFAULT false,
  price               numeric         NOT NULL,
  description         text,
  stock_status	      sstatus         NOT NULL DEFAULT 'high'
);

CREATE TABLE prices_history (
 product_name         text            NOT NULL REFERENCES products (name),
 price                numeric         NOT NULL,
 timestamp            timestamptz     NOT NULL
);
