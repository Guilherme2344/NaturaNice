package com.guiapplications.config;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

@ApplicationScoped
public class DatabaseMigrationInitializer {

    private static final Logger LOG = Logger.getLogger(DatabaseMigrationInitializer.class);

    @Inject
    EntityManager em;

    @Transactional
    public void onStart(@Observes StartupEvent ev) {
        try {
            // First set status = 'PAID' for any legacy sales where status is NULL
            em.createNativeQuery("UPDATE sales SET status = 'PAID' WHERE status IS NULL").executeUpdate();

            // Update existing legacy sales where amount_paid is null or 0.00 to equal total items price
            em.createNativeQuery(
                "UPDATE sales s SET amount_paid = (" +
                "  SELECT COALESCE(SUM(i.selling_price * i.quantity), 0) " +
                "  FROM sale_items i " +
                "  WHERE i.sale_id = s.id" +
                ") WHERE s.amount_paid IS NULL OR (s.amount_paid = 0 AND s.status = 'PAID')"
            ).executeUpdate();

            // Backfill product_name for sale_items from products table
            em.createNativeQuery(
                "UPDATE sale_items i SET product_name = p.name " +
                "FROM products p WHERE i.product_id = p.id AND (i.product_name IS NULL OR i.product_name = '')"
            ).executeUpdate();

            // Ensure observation, is_personal_use, and payment_method columns exist in sales and sale_payments
            em.createNativeQuery("ALTER TABLE sales ADD COLUMN IF NOT EXISTS observation VARCHAR(2000)").executeUpdate();
            em.createNativeQuery("ALTER TABLE sales ADD COLUMN IF NOT EXISTS is_personal_use BOOLEAN DEFAULT FALSE").executeUpdate();
            em.createNativeQuery("ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30)").executeUpdate();
            em.createNativeQuery("ALTER TABLE sale_payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30)").executeUpdate();

            // Update sales status check constraint to include UNPAID
            try {
                em.createNativeQuery("ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_status_check").executeUpdate();
                em.createNativeQuery("ALTER TABLE sales ADD CONSTRAINT sales_status_check CHECK (status IN ('PAID', 'PARTIALLY_PAID', 'UNPAID'))").executeUpdate();
            } catch (Exception e) {
                LOG.warn("Could not update sales_status_check constraint: " + e.getMessage());
            }

            // Migrate any orphaned null-user records to default admin user
            em.createNativeQuery("UPDATE products SET user_id = (SELECT id FROM users WHERE email = 'admin@sistema.com' LIMIT 1) WHERE user_id IS NULL").executeUpdate();
            em.createNativeQuery("UPDATE brands SET user_id = (SELECT id FROM users WHERE email = 'admin@sistema.com' LIMIT 1) WHERE user_id IS NULL").executeUpdate();
            em.createNativeQuery("UPDATE categories SET user_id = (SELECT id FROM users WHERE email = 'admin@sistema.com' LIMIT 1) WHERE user_id IS NULL").executeUpdate();
            em.createNativeQuery("UPDATE families SET user_id = (SELECT id FROM users WHERE email = 'admin@sistema.com' LIMIT 1) WHERE user_id IS NULL").executeUpdate();
            em.createNativeQuery("UPDATE customers SET user_id = (SELECT id FROM users WHERE email = 'admin@sistema.com' LIMIT 1) WHERE user_id IS NULL").executeUpdate();
            em.createNativeQuery("UPDATE sales SET user_id = (SELECT id FROM users WHERE email = 'admin@sistema.com' LIMIT 1) WHERE user_id IS NULL").executeUpdate();

            LOG.info("Database migration for legacy sales, product names, and user isolation completed successfully.");
        } catch (Exception e1) {
            try {
                em.createNativeQuery("UPDATE Sale SET status = 'PAID' WHERE status IS NULL").executeUpdate();
                em.createNativeQuery(
                    "UPDATE Sale s SET amount_paid = (" +
                    "  SELECT COALESCE(SUM(i.selling_price * i.quantity), 0) " +
                    "  FROM sale_items i " +
                    "  WHERE i.sale_id = s.id" +
                    ") WHERE s.amount_paid IS NULL OR (s.amount_paid = 0 AND s.status = 'PAID')"
                ).executeUpdate();
            } catch (Exception e2) {
                LOG.warn("Migration notice: " + e2.getMessage());
            }
        }
    }
}
