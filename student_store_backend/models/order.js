const db = require("../db");
const { BadRequestError } = require("../utils/errors");

class Order {

    /* Method will take a user's order and store it in the database */
    static async createOrder({order, user}) {

        const idResults = await db.query(
            `
                INSERT INTO orders (customer_id)
                VALUES ((SELECT id FROM users WHERE email=$1))
                RETURNING id
            `, [user.email]
        );

        const orderId = idResults.rows[0].id;

        console.log("order", order);

        const orderResults = [];
        order.order.forEach( async (item) => {
            const itemOrder = await db.query(
                `
                    INSERT INTO order_details (order_id, product_id, quantity, discount)
                    VALUES ($1, $2, $3, $4)
                    RETURNING   order_id,
                                product_id,
                                quantity,
                                discount
                `, [orderId, item.product_id, item.quantity, item.discount || 0]
            )
            console.log("item", itemOrder.rows)
            orderResults.push(itemOrder.rows);
        });

        console.log("Finished creating order", orderResults);

        return orderResults;

        // static async createOrder({order, user}) {
        //     //takes user's order and stores it in database
        //     const user_id = await db.query(`SELECT id FROM users WHERE email = $1`, [user.email])
        //     const query = `INSERT INTO orders (
        //         customer_id
        //     )
        //     VALUES ($1)
        //     RETURNING id;
        // `
        // const orderId = await db.query(query, [user_id]);
        // order.forEach((product) => {
        //     const query = `INSERT INTO order_details (
        //         order_id,
        //         product_id,
        //         quantity,
        //         discount
        //     )
        //     VALUES ($1, $2, $3, $4)
        //     RETURNING order_id;
        //     `;
        //     db.query(query, [orderId, product.id, product.quantity, product.discount])
        // })
        // }
    

        // // User should submit fields: `"name"`, `"category"`, `"calories"`, and `"image_url"`
        // const requiredFields = ["name", "category", "calories", "image_url", "quantity"];
        // // Error if missing required field
        // requiredFields.forEach((field) => {
        //     if (!nutrition.hasOwnProperty(field)) {
        //         throw new BadRequestError(`Required field ${field} missing from request body `);
        //     }
        // })

        // // Insert nutrition entry into database
        // const results = await db.query(
        //     `
        //         INSERT INTO nutrition (name, category, calories, image_url, quantity, user_id)
        //         VALUES ($1, $2, $3, $4, $5, (SELECT id FROM users WHERE email=$6))
        //         RETURNING   id,
        //                     name,
        //                     category,
        //                     calories,
        //                     image_url,
        //                     quantity,
        //                     user_id,
        //                     created_at
        //     `, [nutrition.name, nutrition.category, nutrition.calories, nutrition.image_url, nutrition.quantity, user.email]
        // )
        
        // return results.rows[0];  
    }

    /* Method will return all orders that the authenticated user has created */
    static async listOrdersForUser(user) {

        if (!user) {
            throw new BadRequestError("No user provided");
        }

        const results = await db.query(
            `
                SELECT  o.id AS "orderId",
                        o.customer_id AS "customerId",
                        od.quantity AS "quantity",
                        p.name AS "name",
                        p.price AS "price"
                FROM orders AS o
                    JOIN order_details AS od ON o.id = od.order_id
                    JOIN products AS p ON p.id = od.product_id
                WHERE o.customer_id = (SELECT id FROM users WHERE email=$1)
            `, [user.email]
        );

        return results.rows;

        // console.log("user id", user.id);

        // const results = await db.query(
        //     `
        //         SELECT  n.id,
        //                 n.name,
        //                 n.category,
        //                 n.calories,
        //                 n.image_url,
        //                 n.quantity,
        //                 n.user_id,
        //                 u.email as "user_email",
        //                 n.created_at
        //         FROM nutrition AS n
        //             JOIN users AS u ON u.id = n.user_id
        //         WHERE n.user_id = $1
        //         ORDER BY n.created_at DESC
        //     `, [user.id]
        // )

        // return results.rows;
    }
}

module.exports = Order;