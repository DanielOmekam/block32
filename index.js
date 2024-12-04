const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost/the_acme_notes_dbb");
const app = express();

app.use(require('morgan')('dev'));
app.use(express.json());

app.get("/api/flavors", async (req, res, next) => {
    try {
      const SQL = /* sql */ `
        SELECT * from flavors ORDER BY created_at DESC
      `;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (ex) {
      next(ex);
    }
  });

  app.post("/api/flavors", async (req, res, next) => {
    try {
      const SQL = /* sql */ `
        INSERT INTO flavors(name, is_favorite)
        VALUES($1, $2)
        RETURNING *
      `;
      const response = await client.query(SQL, [
        req.body.name,
        req.body.is_favorite,
      ]);
      res.send(response.rows[0]);
    } catch (ex) {
      next(ex);
    }
  });

  app.put("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = /* sql */ `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at=now()
        WHERE id=$3 RETURNING *
      `;
      const response = await client.query(SQL, [
        req.body.name,
        req.body.is_favorite,
        req.params.id,
      ]);
      res.send(response.rows[0]);
    } catch (ex) {
      next(ex);
    }
  });

  app.delete("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = /* sql */ `
        DELETE from flavors
        WHERE id = $1
      `;
      const response = await client.query(SQL, [req.params.id]);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });

const init  = async () => {


    await client.connect();
    console.log("connected to database");
    let SQL = /* sql */`
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            is_favorite BOOLEAN DEFAULT false NOT NULL,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()



        );
    
    `;
    await client.query(SQL);
    console.log("tables created");
    
    SQL = /* sql */ `
        INSERT INTO flavors(name) VALUES('mint chocolate');
        INSERT INTO flavors(name, is_favorite) VALUES('cookies n cream', true);
        INSERT INTO flavors(name,is_favorite) VALUES('vanilla', true);
        INSERT INTO flavors(name) VALUES('strawberry');
    
    
    `;
    await client.query(SQL);
    console.log("data seeded");



    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
