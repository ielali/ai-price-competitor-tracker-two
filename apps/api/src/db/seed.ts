import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'price_tracker',
  user: process.env.DB_USER || 'price_tracker',
  password: process.env.DB_PASSWORD || 'price_tracker',
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database with demo data...');

    // Insert demo products
    await client.query(`
      INSERT INTO products (name, sku, category, our_price, currency)
      VALUES
        ('Wireless Bluetooth Headphones', 'WBH-001', 'Electronics', 79.99, 'USD'),
        ('Organic Green Tea (100 bags)', 'OGT-100', 'Grocery', 12.49, 'USD'),
        ('Running Shoes Pro', 'RSP-042', 'Footwear', 129.95, 'USD'),
        ('USB-C Hub 7-in-1', 'UCH-007', 'Electronics', 34.99, 'USD'),
        ('Stainless Steel Water Bottle', 'SSW-500', 'Kitchen', 24.99, 'USD')
      ON CONFLICT (sku) DO NOTHING;
    `);

    // Insert demo competitors
    await client.query(`
      INSERT INTO competitors (name, website, scrape_interval_minutes)
      VALUES
        ('MegaMart', 'https://megamart.example.com', 360),
        ('BargainBay', 'https://bargainbay.example.com', 360),
        ('PriceKing', 'https://priceking.example.com', 720)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert demo competitor prices
    const products = await client.query(`SELECT id, our_price FROM products ORDER BY id`);
    const competitors = await client.query(`SELECT id FROM competitors ORDER BY id`);

    if (products.rows.length > 0 && competitors.rows.length > 0) {
      for (const product of products.rows) {
        for (const competitor of competitors.rows) {
          const variance = (Math.random() - 0.5) * 0.3; // +/- 15%
          const competitorPrice = Number((product.our_price * (1 + variance)).toFixed(2));
          await client.query(
            `
            INSERT INTO competitor_prices (product_id, competitor_id, price, currency, scraped_at)
            VALUES ($1, $2, $3, 'USD', NOW() - interval '1 hour' * floor(random() * 72))
            ON CONFLICT DO NOTHING;
          `,
            [product.id, competitor.id, competitorPrice],
          );
        }
      }
    }

    console.log('Seed data inserted successfully.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
