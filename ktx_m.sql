-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th3 31, 2025 lúc 12:54 PM
-- Phiên bản máy phục vụ: 8.2.0
-- Phiên bản PHP: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ktx_m`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `buildings`
--

DROP TABLE IF EXISTS `buildings`;
CREATE TABLE IF NOT EXISTS `buildings` (
  `id_buildings` int NOT NULL AUTO_INCREMENT,
  `nameBuild` varchar(30) NOT NULL,
  `location` varchar(50) NOT NULL,
  PRIMARY KEY (`id_buildings`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `buildings`
--

INSERT INTO `buildings` (`id_buildings`, `nameBuild`, `location`) VALUES
(1, 'Toa Nha 1', 'Ha Noi'),
(2, 'Toa Nha 2', 'Ho Chi Minh'),
(3, 'Toa Nha 3', 'Da Nang');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contracts`
--

DROP TABLE IF EXISTS `contracts`;
CREATE TABLE IF NOT EXISTS `contracts` (
  `id_contracts` int NOT NULL AUTO_INCREMENT,
  `id_users` int NOT NULL,
  `id_rooms` int NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  PRIMARY KEY (`id_contracts`),
  KEY `id_users` (`id_users`),
  KEY `id_rooms` (`id_rooms`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `contracts`
--

INSERT INTO `contracts` (`id_contracts`, `id_users`, `id_rooms`, `start_date`, `end_date`) VALUES
(1, 1, 1, '2024-01-01 12:00:00', '2024-06-01 12:00:00'),
(2, 2, 2, '2024-02-15 08:00:00', '2024-08-15 08:00:00'),
(3, 3, 3, '2024-03-10 14:00:00', '2024-09-10 14:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contract_service`
--

DROP TABLE IF EXISTS `contract_service`;
CREATE TABLE IF NOT EXISTS `contract_service` (
  `id_Cont_Ser` int NOT NULL AUTO_INCREMENT,
  `id_contracts` int NOT NULL,
  `id_service` int NOT NULL,
  PRIMARY KEY (`id_Cont_Ser`),
  KEY `id_contracts` (`id_contracts`),
  KEY `id_service` (`id_service`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `contract_service`
--

INSERT INTO `contract_service` (`id_Cont_Ser`, `id_contracts`, `id_service`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 2),
(4, 3, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id_payments` int NOT NULL AUTO_INCREMENT,
  `id_contracts` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('chua thanh toan','da thanh toan') DEFAULT 'chua thanh toan',
  `due_date` datetime NOT NULL,
  PRIMARY KEY (`id_payments`),
  KEY `id_contracts` (`id_contracts`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id_payments`, `id_contracts`, `amount`, `status`, `due_date`) VALUES
(1, 1, 3000000.00, 'da thanh toan', '2024-02-01 00:00:00'),
(2, 2, 4800000.00, 'chua thanh toan', '2024-03-01 00:00:00'),
(3, 3, 7200000.00, 'chua thanh toan', '2024-04-01 00:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_details`
--

DROP TABLE IF EXISTS `payment_details`;
CREATE TABLE IF NOT EXISTS `payment_details` (
  `id_details` int NOT NULL AUTO_INCREMENT,
  `id_payments` int NOT NULL,
  `typePay` enum('tien mat','momo','tai khoan ngan hang') DEFAULT 'tien mat',
  `amountPay` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_details`),
  KEY `id_payments` (`id_payments`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `payment_details`
--

INSERT INTO `payment_details` (`id_details`, `id_payments`, `typePay`, `amountPay`) VALUES
(1, 1, 'tien mat', 3000000.00),
(2, 2, 'momo', 4800000.00),
(3, 3, 'tai khoan ngan hang', 7200000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 5, 'auth_token', '2cc0f6cf9f70872e7be122d011b49098242e0fe5d9268ca948532abc12c46650', '[\"*\"]', NULL, NULL, '2025-03-25 18:47:35', '2025-03-25 18:47:35'),
(2, 'App\\Models\\User', 5, 'auth_token', '4c0c5b0b1913a2e3def91991ca9afe16b2349b14c7e068017545743b25685d9b', '[\"*\"]', NULL, NULL, '2025-03-25 18:59:22', '2025-03-25 18:59:22'),
(3, 'App\\Models\\User', 5, 'auth_token', '32cf609d5077a4eb09a722374d6fc6ce2c26fc0a0f3b665937bee282d9449b5d', '[\"*\"]', NULL, NULL, '2025-03-25 19:02:59', '2025-03-25 19:02:59');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `rooms`
--

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE IF NOT EXISTS `rooms` (
  `id_rooms` int NOT NULL AUTO_INCREMENT,
  `id_buildings` int NOT NULL,
  `number` int NOT NULL,
  `type` enum('3 giuong','6 giuong','8 giuong') NOT NULL,
  `current_occupancy` int DEFAULT '0',
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_rooms`),
  KEY `id_buildings` (`id_buildings`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `rooms`
--

INSERT INTO `rooms` (`id_rooms`, `id_buildings`, `number`, `type`, `current_occupancy`, `price`) VALUES
(1, 1, 101, '3 giuong', 2, 500000.00),
(2, 2, 202, '6 giuong', 4, 800000.00),
(3, 3, 303, '8 giuong', 6, 1200000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `service`
--

DROP TABLE IF EXISTS `service`;
CREATE TABLE IF NOT EXISTS `service` (
  `id_service` int NOT NULL AUTO_INCREMENT,
  `nameService` varchar(30) NOT NULL,
  `priceService` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_service`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `service`
--

INSERT INTO `service` (`id_service`, `nameService`, `priceService`) VALUES
(1, 'Internet', 100000.00),
(2, 'Giu Xe', 50000.00),
(3, 'Dien Nuoc', 150000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id_users` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `role` enum('User','Admin') DEFAULT 'User',
  PRIMARY KEY (`id_users`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id_users`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'Nguyen Van A', 'a@gmail.com', '123456', '0912345678', 'User'),
(2, 'Tran Thi B', 'b@gmail.com', 'abcdef', '0987654321', 'Admin'),
(3, 'Le Van C', 'c@gmail.com', 'pass123', '0901234567', 'User'),
(4, 'Tên sinh viên', 'email@example.com', '$2y$12$KXAIdfoMsv9IQIBnlC4bueUGIzneShzXN4.JnTttbPVTlODT8TYcW', '0123456789', 'User'),
(5, 'An Hoai', 'danghoaian230903@gmail.com', '$2y$12$o5UbhGGC5AB57slhj6Tc0uDQAxj88oTW8ZzE/V0odio5Yp0MwQrBO', '08681114491', 'User');

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_users`),
  ADD CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`id_rooms`) REFERENCES `rooms` (`id_rooms`);

--
-- Các ràng buộc cho bảng `contract_service`
--
ALTER TABLE `contract_service`
  ADD CONSTRAINT `contract_service_ibfk_1` FOREIGN KEY (`id_contracts`) REFERENCES `contracts` (`id_contracts`),
  ADD CONSTRAINT `contract_service_ibfk_2` FOREIGN KEY (`id_service`) REFERENCES `service` (`id_service`);

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`id_contracts`) REFERENCES `contracts` (`id_contracts`);

--
-- Các ràng buộc cho bảng `payment_details`
--
ALTER TABLE `payment_details`
  ADD CONSTRAINT `payment_details_ibfk_1` FOREIGN KEY (`id_payments`) REFERENCES `payments` (`id_payments`);

--
-- Các ràng buộc cho bảng `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`id_buildings`) REFERENCES `buildings` (`id_buildings`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
