-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 24, 2026 at 11:28 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `barcode_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mrp` decimal(10,2) NOT NULL,
  `sellingPrice` decimal(10,2) DEFAULT NULL,
  `barcode` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `createdAt` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `mrp`, `sellingPrice`, `barcode`, `code`, `category`, `userId`, `createdAt`) VALUES
('1782208807107', 'Dress', 9000.00, NULL, '1782208807107', 'TC-001', 'SAMPLE', 'admin-0', '2026-06-23T00:00:00.000Z'),
('1782209081933', 'product', 1000.00, 900.00, '1782209081933', 'test ', 'SAMPLE', 'admin-0', '2026-06-23T00:00:00.000Z'),
('1782209137859', 'Automated Test Product', 999.00, NULL, '1782209137859', 'TEST1234', '', 'admin-0', '2026-06-23T00:00:00.000Z'),
('1782209372601', 'TestStudent', 9000.00, NULL, '1782209372601', 'WM001', '', 'user-1782209306313', '2026-06-23T00:00:00.000Z'),
('1782210247611', 'Test Product 1 Edited', 100.00, NULL, 'TST000001', 'TST000001', '', 'user-1782209306313', '2026-06-23T00:00:00.000Z'),
('1782211084686', 'd', 88.00, NULL, 'TC-002', 'TC-002', '', 'admin-0', '2026-06-23T00:00:00.000Z'),
('1782211513185', 'asd', 90000.00, 8989.00, '123456789', '123456789', 'SAMPLE', 'admin-0', '2026-06-23T00:00:00.000Z'),
('1782211704075', 'Dress', 1221.00, NULL, 'TC-003', 'TC-003', '', 'admin-0', '2026-06-23T00:00:00.000Z'),
('1782211726195', 'Dress', 9090.00, NULL, 'TC-004', 'TC-004', '', 'admin-0', '2026-06-23T00:00:00.000Z'),
('1782211735419', 'Dress', 90.00, NULL, 'TC-005', 'TC-005', '', 'admin-0', '2026-06-23T00:00:00.000Z'),
('1782211753224', 'Dress', 909.00, NULL, 'TC-006', 'TC-006', '', 'admin-0', '2026-06-23T00:00:00.000Z'),
('1782214945067', 'Dress', 90909.00, NULL, 'Hederaasd', 'Hederaasd', '', 'admin-0', '2026-06-23T00:00:00.000Z'),
('test-id', 'Test Product', 999.00, NULL, 'test-id', 'TC-001', '', 'default', '2026-06-22T00:00:00.000Z');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`key`, `value`) VALUES
('printerSettings', '{\"type\":\"usb\",\"paperWidth\":\"80\",\"isConnected\":true,\"deviceName\":\"TSC TE-210\"}');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `isAdmin`) VALUES
('admin-0', 'ETZEL', 'ETZEL1', 1),
('user-1782209306313', 'USER 1', '12345', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
