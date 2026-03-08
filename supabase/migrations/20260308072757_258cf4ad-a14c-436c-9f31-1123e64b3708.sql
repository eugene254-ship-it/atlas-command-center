-- Fix ARR alert thresholds to match stored units (millions)
UPDATE metric_alerts SET threshold_value = 10 WHERE id = '83a91276-cdd2-4bcd-ad56-c946648d9484';
UPDATE metric_alerts SET threshold_value = 5 WHERE id = 'd54f8fc1-286b-4d81-8e63-a2182a4d706b';

-- Clean up false critical alerts caused by unit mismatch
DELETE FROM alert_notifications WHERE alert_id = 'd54f8fc1-286b-4d81-8e63-a2182a4d706b';