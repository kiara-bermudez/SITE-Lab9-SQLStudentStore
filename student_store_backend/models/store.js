const db = require("../db");

class Store {

    /* Method should run a SQL query that searches the database for all products and returns a list of them */
    static async listProducts() {

        const results = await db.query(
            `
                SELECT *
                FROM products
            `
        )

        return results.rows;
    }
}

module.exports = Store;