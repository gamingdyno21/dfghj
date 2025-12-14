-- Sample data for Carbon Credit Trading and Tracking System

INSERT INTO Company VALUES
 (1, 'EcoPower Ltd', 'Energy', 500.00, 450.00),
 (2, 'GreenSteel Pvt', 'Manufacturing', 700.00, 850.00),
 (3, 'FreshAir Corp', 'Environment', 300.00, 200.00);

INSERT INTO CarbonCredit VALUES
 (101, 1, 50, '2025-12-31'),
 (102, 3, 100, '2026-01-30');

INSERT INTO `Transaction` VALUES
 (201, 3, 2, 60, 3000, '2025-11-01');

INSERT INTO Penalty VALUES
 (301, 2, 'Exceeded emission limit', 10000, '2025-11-02');