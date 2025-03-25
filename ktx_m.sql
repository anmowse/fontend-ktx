CREATE DATABASE ktx_m;
USE ktx_m;

CREATE TABLE Users
( 
    id_users int AUTO_INCREMENT PRIMARY KEY,
    name varchar(50) NOT NULL,
    email varchar(100) UNIQUE,
    password varchar(255) NOT NULL,
    phone varchar(15) NOT NULL,
    role ENUM('User','Admin') DEFAULT 'User'
) ENGINE = INNODB;


CREATE TABLE Buildings(
    id_buildings int AUTO_INCREMENT PRIMARY KEY,
    nameBuild varchar(30) NOT NULL,
    location varchar(50) NOT NULL
) ENGINE = INNODB;


CREATE TABLE Rooms(	
    id_rooms int AUTO_INCREMENT PRIMARY KEY,
    id_buildings int NOT NULL,
    number int NOT NULL,
    type ENUM('3 giuong', '6 giuong' ,'8 giuong') NOT NULL,
    current_occupancy int DEFAULT 0, 
    price decimal(10,2) NOT NULL,
    FOREIGN KEY(id_buildings) REFERENCES Buildings(id_buildings)
) ENGINE = INNODB;


CREATE TABLE Contracts
(   
    id_contracts int AUTO_INCREMENT PRIMARY KEY,
    id_users int NOT NULL,
    id_rooms int NOT NULL,
    start_date datetime NOT NULL,
    end_date datetime NOT NULL,
    FOREIGN KEY(id_users) REFERENCES Users(id_users),
    FOREIGN KEY(id_rooms) REFERENCES Rooms(id_rooms)
) ENGINE = INNODB;


CREATE TABLE Payments(
    id_payments int AUTO_INCREMENT PRIMARY KEY,
    id_contracts int NOT NULL,
    amount decimal(10,2) NOT NULL,
    status ENUM('chua thanh toan', 'da thanh toan') DEFAULT 'chua thanh toan',
    due_date datetime NOT NULL,
    FOREIGN KEY (id_contracts) REFERENCES Contracts(id_contracts)
) ENGINE = INNODB;


CREATE TABLE Service(
    id_service int AUTO_INCREMENT PRIMARY KEY,
    nameService varchar(30) NOT NULL,
    priceService decimal(10,2) NOT NULL
) ENGINE = INNODB;


CREATE TABLE Contract_Service(
    id_Cont_Ser int AUTO_INCREMENT PRIMARY KEY,
    id_contracts int NOT NULL,
    id_service int NOT NULL,
    FOREIGN KEY (id_contracts) REFERENCES Contracts(id_contracts),
    FOREIGN KEY (id_service) REFERENCES Service(id_service)
) ENGINE = INNODB;


CREATE TABLE Payment_details(
    id_details int AUTO_INCREMENT PRIMARY KEY,
    id_payments int NOT NULL,
    typePay ENUM('tien mat', 'momo', 'tai khoan ngan hang') DEFAULT 'tien mat',
    amountPay decimal(10,2) NOT NULL, -- Sửa chính tả 'amoutPay' thành 'amountPay'
    FOREIGN KEY(id_payments) REFERENCES Payments(id_payments)
) ENGINE = INNODB;


-- Thêm dữ liệu vào bảng Users
INSERT INTO Users (name, email, password, phone, role) VALUES
('Nguyen Van A', 'a@gmail.com', '123456', '0912345678', 'User'),
('Tran Thi B', 'b@gmail.com', 'abcdef', '0987654321', 'Admin'),
('Le Van C', 'c@gmail.com', 'pass123', '0901234567', 'User');

-- Thêm dữ liệu vào bảng Buildings
INSERT INTO Buildings (nameBuild, location) VALUES
('Toa Nha 1', 'Ha Noi'),
('Toa Nha 2', 'Ho Chi Minh'),
('Toa Nha 3', 'Da Nang');

-- Thêm dữ liệu vào bảng Rooms
INSERT INTO Rooms (id_buildings, number, type, current_occupancy, price) VALUES
(1, 101, '3 giuong', 2, 500000.00),
(2, 202, '6 giuong', 4, 800000.00),
(3, 303, '8 giuong', 6, 1200000.00);

-- Thêm dữ liệu vào bảng Contracts
INSERT INTO Contracts (id_users, id_rooms, start_date, end_date) VALUES
(1, 1, '2024-01-01 12:00:00', '2024-06-01 12:00:00'),
(2, 2, '2024-02-15 08:00:00', '2024-08-15 08:00:00'),
(3, 3, '2024-03-10 14:00:00', '2024-09-10 14:00:00');

-- Thêm dữ liệu vào bảng Payments
INSERT INTO Payments (id_contracts, amount, status, due_date) VALUES
(1, 3000000.00, 'da thanh toan', '2024-02-01 00:00:00'),
(2, 4800000.00, 'chua thanh toan', '2024-03-01 00:00:00'),
(3, 7200000.00, 'chua thanh toan', '2024-04-01 00:00:00');

-- Thêm dữ liệu vào bảng Service
INSERT INTO Service (nameService, priceService) VALUES
('Internet', 100000.00),
('Giu Xe', 50000.00),
('Dien Nuoc', 150000.00);

-- Thêm dữ liệu vào bảng Contract_Service
INSERT INTO Contract_Service (id_contracts, id_service) VALUES
(1, 1),
(1, 2),
(2, 2),
(3, 3);

-- Thêm dữ liệu vào bảng Payment_details
INSERT INTO Payment_details (id_payments, typePay, amountPay) VALUES
(1, 'tien mat', 3000000.00),
(2, 'momo', 4800000.00),
(3, 'tai khoan ngan hang', 7200000.00);


-- ALTER TABLE Users DROP INDEX name;