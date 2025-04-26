-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.42 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for tutordb
CREATE DATABASE IF NOT EXISTS `tutordb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tutordb`;

-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: tutordb
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Assignment_Comments`
--

DROP TABLE IF EXISTS `Assignment_Comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Assignment_Comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int DEFAULT NULL,
  `user_id` varchar(20) DEFAULT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `Assignment_Comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `Posts_Assignment` (`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Assignment_Comments`
--

LOCK TABLES `Assignment_Comments` WRITE;
/*!40000 ALTER TABLE `Assignment_Comments` DISABLE KEYS */;
INSERT INTO `Assignment_Comments` VALUES (1,8,'2','test','2025-04-21 14:36:23'),(2,8,'2','test','2025-04-21 14:36:27'),(3,8,'4','hello','2025-04-21 14:36:40'),(4,8,'4','hoho','2025-04-21 14:41:56'),(5,8,'2','haha','2025-04-21 14:42:01');
/*!40000 ALTER TABLE `Assignment_Comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Assignment_Files`
--

DROP TABLE IF EXISTS `Assignment_Files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Assignment_Files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  CONSTRAINT `Assignment_Files_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `Posts_Assignment` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Assignment_Files`
--
-- Table structure for table `Class_Documents`
DROP TABLE IF EXISTS `Class_Documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Class_Documents` (
  `documentID` int NOT NULL AUTO_INCREMENT,
  `classID` int NOT NULL,
  `documentTitle` varchar(255) NOT NULL,
  `documentLink` text,
  `description` text,
  `uploadedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`documentID`),
  KEY `classID` (`classID`),
  CONSTRAINT `Class_Documents_ibfk_1` FOREIGN KEY (`classID`) REFERENCES `Classes` (`classID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Assignment_Files` WRITE;
/*!40000 ALTER TABLE `Assignment_Files` DISABLE KEYS */;
/*!40000 ALTER TABLE `Assignment_Files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Blog_Comments`
--

DROP TABLE IF EXISTS `Blog_Comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Blog_Comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `blog_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `blog_id` (`blog_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Blog_Comments_ibfk_1` FOREIGN KEY (`blog_id`) REFERENCES `Blogs` (`blog_id`),
  CONSTRAINT `Blog_Comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`userID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Blog_Comments`
--

LOCK TABLES `Blog_Comments` WRITE;
/*!40000 ALTER TABLE `Blog_Comments` DISABLE KEYS */;
INSERT INTO `Blog_Comments` VALUES (1,21,5,'content','2025-04-19 14:55:27'),(2,21,5,'content','2025-04-19 14:56:05');
/*!40000 ALTER TABLE `Blog_Comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Blogs`
--

DROP TABLE IF EXISTS `Blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Blogs` (
  `blog_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `class_id` int DEFAULT NULL,
  `content` text,
  `description` text,
  `title` text,
  `status` tinyint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`blog_id`),
  KEY `student_id` (`student_id`),
  KEY `class_id` (`class_id`) USING BTREE,
  CONSTRAINT `Blogs_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Users` (`userID`),
  CONSTRAINT `FK_Blogs_Classes` FOREIGN KEY (`class_id`) REFERENCES `Classes` (`classID`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Blogs`
--

LOCK TABLES `Blogs` WRITE;
/*!40000 ALTER TABLE `Blogs` DISABLE KEYS */;
INSERT INTO `Blogs` VALUES (21,4,3,'Odio id eu laborum c','Consequuntur qui ape','Deserunt asperiores ',1,'2025-04-19 06:16:19','2025-04-19 06:16:19'),(22,4,3,'','','',1,'2025-04-19 06:17:08','2025-04-19 06:17:08'),(23,4,3,'','','',1,'2025-04-19 06:17:14','2025-04-19 06:17:14'),(24,4,3,'Id inventore qui at ','Illum vitae ab mole','Id aliqua Tempor ma',0,'2025-04-19 06:18:36','2025-04-19 06:18:36'),(25,5,1,'test','test','test',1,'2025-04-20 08:45:29','2025-04-20 08:45:29');
/*!40000 ALTER TABLE `Blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Class_Students`
--

DROP TABLE IF EXISTS `Class_Students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Class_Students` (
  `classID` int NOT NULL,
  `studentID` varchar(10) NOT NULL,
  `enrolledAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Active','Completed','Dropped') DEFAULT 'Active',
  PRIMARY KEY (`classID`,`studentID`),
  KEY `studentID` (`studentID`),
  CONSTRAINT `Class_Students_ibfk_1` FOREIGN KEY (`classID`) REFERENCES `Classes` (`classID`) ON DELETE CASCADE,
  CONSTRAINT `Class_Students_ibfk_2` FOREIGN KEY (`studentID`) REFERENCES `Students` (`studentID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Class_Students`
--

LOCK TABLES `Class_Students` WRITE;
/*!40000 ALTER TABLE `Class_Students` DISABLE KEYS */;
INSERT INTO `Class_Students` VALUES (1,'S1','2025-04-13 06:33:04','Active'),(1,'S2','2025-04-13 06:33:04','Active'),(2,'S1','2025-04-13 06:33:04','Active'),(2,'S2','2025-04-13 06:33:04','Active'),(3,'S1','2025-04-13 06:33:04','Active'),(3,'S2','2025-04-13 06:33:04','Active'),(4,'S1','2025-04-21 15:29:32','Active');
/*!40000 ALTER TABLE `Class_Students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Classes`
--

DROP TABLE IF EXISTS `Classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Classes` (
  `classID` int NOT NULL AUTO_INCREMENT,
  `className` varchar(100) NOT NULL,
  `videoLink` varchar(255) DEFAULT NULL,
  `subject` varchar(100) NOT NULL,
  `tutorID` varchar(10) NOT NULL,
  `paymentID` int DEFAULT NULL,
  `length` int NOT NULL,
  `available` tinyint(1) DEFAULT '1',
  `type` varchar(50) DEFAULT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`classID`),
  KEY `tutorID` (`tutorID`),
  CONSTRAINT `Classes_ibfk_1` FOREIGN KEY (`tutorID`) REFERENCES `Tutors` (`tutorID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Classes`
--

LOCK TABLES `Classes` WRITE;
/*!40000 ALTER TABLE `Classes` DISABLE KEYS */;
INSERT INTO `Classes` VALUES (1,'Advanced Mathematics','https://www.youtube.com/watch?v=kYwm6yOoJ44','Mathematics','T1',1,60,1,NULL,'Advanced math concepts for high school students',50000.00,1,'2025-04-13 06:33:04','2025-04-15 14:55:29'),(2,'Physics Basics','https://www.youtube.com/watch?v=kYwm6yOoJ44','Physics','T2',2,90,1,NULL,'Introduction to physics principles',20000.00,1,'2025-04-13 06:33:04','2025-04-19 13:07:36'),(3,'Calculus 101','https://www.youtube.com/watch?v=kYwm6yOoJ44','Mathematics','T1',NULL,60,1,NULL,'Basic calculus course',30000.00,1,'2025-04-13 06:33:04','2025-04-15 14:55:33'),(4,'${classroom.className}','${classroom.videoLink}','${classroom.subject}','T1',1,1,1,'${classroom.type}','${classroom.description}',2.00,1,'2025-04-18 14:54:06','2025-04-18 14:54:06');
/*!40000 ALTER TABLE `Classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Complains`
--

DROP TABLE IF EXISTS `Complains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Complains` (
  `complainID` int NOT NULL AUTO_INCREMENT,
  `uID` int NOT NULL,
  `message` text NOT NULL,
  `status` enum('Pending','Resolved') DEFAULT 'Pending',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`complainID`),
  KEY `uID` (`uID`),
  CONSTRAINT `Complains_ibfk_1` FOREIGN KEY (`uID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Complains`
--

LOCK TABLES `Complains` WRITE;
/*!40000 ALTER TABLE `Complains` DISABLE KEYS */;
INSERT INTO `Complains` VALUES (1,4,'The class schedule is not convenient','Pending','2025-04-13 06:33:04','2025-04-17 06:59:48'),(2,5,'Need more practice materials','Resolved','2025-04-13 06:33:04','2025-04-17 06:59:48'),(3,4,'chán vcl','Pending','2025-04-13 08:35:27','2025-04-13 08:35:27');
/*!40000 ALTER TABLE `Complains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Feedbacks`
--

DROP TABLE IF EXISTS `Feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Feedbacks` (
  `feedbackID` int NOT NULL AUTO_INCREMENT,
  `tutorID` varchar(10) NOT NULL,
  `classID` int NOT NULL,
  `studentID` varchar(10) NOT NULL,
  `feedbackDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `message` text,
  `rating` int NOT NULL,
  PRIMARY KEY (`feedbackID`),
  KEY `tutorID` (`tutorID`),
  KEY `classID` (`classID`),
  KEY `studentID` (`studentID`),
  CONSTRAINT `Feedbacks_ibfk_1` FOREIGN KEY (`tutorID`) REFERENCES `Tutors` (`tutorID`),
  CONSTRAINT `Feedbacks_ibfk_2` FOREIGN KEY (`classID`) REFERENCES `Classes` (`classID`),
  CONSTRAINT `Feedbacks_ibfk_3` FOREIGN KEY (`studentID`) REFERENCES `Students` (`studentID`),
  CONSTRAINT `Feedbacks_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Feedbacks`
--

LOCK TABLES `Feedbacks` WRITE;
/*!40000 ALTER TABLE `Feedbacks` DISABLE KEYS */;
INSERT INTO `Feedbacks` VALUES (1,'T1',1,'S1','2025-04-13 06:33:04','Great teaching style and very patient with students. The explanations were clear and easy to understand.',5),(3,'T1',3,'S1','2025-04-13 06:33:04','Very interactive sessions. The tutor encouraged questions and discussions.',4),(6,'T1',3,'S2','2025-04-21 16:22:30','lần 3',4);
/*!40000 ALTER TABLE `Feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Messages`
--

DROP TABLE IF EXISTS `Messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Messages` (
  `messageID` int NOT NULL AUTO_INCREMENT,
  `senderID` int NOT NULL,
  `receiverID` int NOT NULL,
  `messageText` text NOT NULL,
  `senderType` enum('Student','Tutor','Moderator','Admin') NOT NULL,
  `receiverType` enum('Student','Tutor','Moderator','Admin') NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`messageID`),
  KEY `senderID` (`senderID`),
  KEY `receiverID` (`receiverID`),
  CONSTRAINT `Messages_ibfk_1` FOREIGN KEY (`senderID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE,
  CONSTRAINT `Messages_ibfk_2` FOREIGN KEY (`receiverID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Messages`
--

LOCK TABLES `Messages` WRITE;
/*!40000 ALTER TABLE `Messages` DISABLE KEYS */;
INSERT INTO `Messages` VALUES (1,4,2,'Hello, I have a question about the math assignment','Student','Tutor','2025-04-13 06:33:04'),(2,2,4,'Sure, what would you like to know?','Tutor','Student','2025-04-13 06:33:04'),(3,5,3,'Can we schedule a physics tutoring session?','Student','Tutor','2025-04-13 06:33:04'),(4,3,5,'Yes, I have availability tomorrow at 2 PM','Tutor','Student','2025-04-13 06:33:04'),(5,4,6,'I need help with a technical issue','Student','Moderator','2025-04-13 06:33:04'),(6,6,4,'I can help you with that. What seems to be the problem?','Moderator','Student','2025-04-13 06:33:04'),(7,4,2,'hello','Student','Tutor','2025-04-13 08:35:36'),(8,4,3,'hello','Student','Tutor','2025-04-13 08:35:48'),(9,4,3,'hello','Student','Tutor','2025-04-13 08:35:48');
/*!40000 ALTER TABLE `Messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Payments`
--

DROP TABLE IF EXISTS `Payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payments` (
  `paymentID` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Completed','Failed') DEFAULT 'Pending',
  `paymentMethod` varchar(50) DEFAULT NULL,
  `transactionID` varchar(100) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`paymentID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payments`
--

LOCK TABLES `Payments` WRITE;
/*!40000 ALTER TABLE `Payments` DISABLE KEYS */;
INSERT INTO `Payments` VALUES (1,100.00,'Completed','Credit Card','TRX123456','2025-04-13 06:33:04','2025-04-13 06:33:04'),(2,150.00,'Pending','Bank Transfer','TRX123457','2025-04-13 06:33:04','2025-04-13 06:33:04'),(3,200.00,'Completed','Credit Card','TRX123458','2025-04-13 06:33:04','2025-04-13 06:33:04');
/*!40000 ALTER TABLE `Payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Posts_Assignment`
--

DROP TABLE IF EXISTS `Posts_Assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Posts_Assignment` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL DEFAULT '0',
  `tutorID` varchar(20) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `tutorID` (`tutorID`),
  CONSTRAINT `Posts_Assignment_ibfk_1` FOREIGN KEY (`tutorID`) REFERENCES `Tutors` (`tutorID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Posts_Assignment`
--

LOCK TABLES `Posts_Assignment` WRITE;
/*!40000 ALTER TABLE `Posts_Assignment` DISABLE KEYS */;
INSERT INTO `Posts_Assignment` VALUES (1,3,'T1','2123','231231','2025-04-19 15:40:39'),(4,1,'T1','Announcement','test','2025-04-20 14:23:37'),(5,1,'T1','Announcement','tôi muốn thử xem nó hiện lên không','2025-04-20 14:23:56'),(6,1,'T1','Test','đây là bài tập về nhà','2025-04-20 14:25:25'),(7,1,'T1','Announcement','Test một thứ gì đấy','2025-04-21 14:11:53'),(8,1,'T1','Test','Bài tập về nhà','2025-04-21 14:12:33'),(9,1,'T1','Bài tập về nhà','làm bài tập đi muộn mất','2025-04-21 14:40:36'),(10,1,'T1','bài tập về nhà làm đi','làm ngay đi trước khi mọi điều dần tồi tệ hơn','2025-04-21 14:42:57');
/*!40000 ALTER TABLE `Posts_Assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Requests`
--

DROP TABLE IF EXISTS `Requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Requests` (
  `requestID` int NOT NULL AUTO_INCREMENT,
  `studentID` varchar(10) NOT NULL,
  `tutorID` varchar(10) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `description` text,
  `status` enum('Pending','Accepted','Rejected') DEFAULT 'Pending',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`requestID`),
  KEY `studentID` (`studentID`),
  KEY `tutorID` (`tutorID`),
  CONSTRAINT `Requests_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `Students` (`studentID`),
  CONSTRAINT `Requests_ibfk_2` FOREIGN KEY (`tutorID`) REFERENCES `Tutors` (`tutorID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Requests`
--

LOCK TABLES `Requests` WRITE;
/*!40000 ALTER TABLE `Requests` DISABLE KEYS */;
INSERT INTO `Requests` VALUES (1,'S1','T1','Mathematics','Need help with calculus homework','Pending','2025-04-13 06:41:50','2025-04-13 06:41:50'),(2,'S2','T2','Physics','Looking for physics tutoring sessions','Accepted','2025-04-13 06:41:50','2025-04-13 06:41:50'),(3,'S1','T2','Physics','Need help with thermodynamics','Pending','2025-04-13 06:41:50','2025-04-13 06:41:50');
/*!40000 ALTER TABLE `Requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `StudentEnrollmentRequests`
--

DROP TABLE IF EXISTS `StudentEnrollmentRequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `StudentEnrollmentRequests` (
  `requestID` int NOT NULL AUTO_INCREMENT,
  `classID` int NOT NULL,
  `studentID` varchar(10) NOT NULL,
  `requestDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Pending','Accept','Deny') DEFAULT 'Pending',
  `message` text,
  `adminComment` text,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`requestID`),
  KEY `classID` (`classID`),
  KEY `studentID` (`studentID`),
  CONSTRAINT `StudentEnrollmentRequests_ibfk_1` FOREIGN KEY (`classID`) REFERENCES `Classes` (`classID`) ON DELETE CASCADE,
  CONSTRAINT `StudentEnrollmentRequests_ibfk_2` FOREIGN KEY (`studentID`) REFERENCES `Students` (`studentID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StudentEnrollmentRequests`
--

LOCK TABLES `StudentEnrollmentRequests` WRITE;
/*!40000 ALTER TABLE `StudentEnrollmentRequests` DISABLE KEYS */;
INSERT INTO `StudentEnrollmentRequests` VALUES (1,4,'S1','2025-04-21 15:25:48','Deny','Tôi muốn tham gia lớp học này','Đã từ chối','2025-04-21 15:26:13'),(2,4,'S1','2025-04-21 15:26:21','Accept','Tôi muốn tham gia lớp học này','Đã chấp nhận','2025-04-21 15:26:28'),(3,4,'S1','2025-04-21 15:27:47','Accept','Tôi muốn tham gia lớp học này','Đã chấp nhận','2025-04-21 15:27:53'),(4,4,'S1','2025-04-21 15:29:29','Accept','Tôi muốn tham gia lớp học này','Đã chấp nhận','2025-04-21 15:29:32'),(5,4,'S1','2025-04-21 15:29:45','Deny','Tôi muốn tham gia lớp học này','Đã từ chối','2025-04-21 15:29:51'),(6,3,'S2','2025-04-21 15:37:18','Accept','Tôi muốn tham gia lớp học này','Đã chấp nhận','2025-04-21 15:37:24'),(7,3,'S2','2025-04-21 15:40:17','Accept','Tôi muốn tham gia lớp học này','Đã chấp nhận','2025-04-21 15:40:21'),(8,4,'S2','2025-04-21 15:46:01','Deny','I would like to join this class','Rejected','2025-04-21 15:46:11');
/*!40000 ALTER TABLE `StudentEnrollmentRequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Students`
--

DROP TABLE IF EXISTS `Students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Students` (
  `studentID` varchar(10) NOT NULL,
  `userID` int NOT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `school` varchar(100) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`studentID`),
  KEY `userID` (`userID`),
  CONSTRAINT `Students_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Students`
--

LOCK TABLES `Students` WRITE;
/*!40000 ALTER TABLE `Students` DISABLE KEYS */;
INSERT INTO `Students` VALUES ('S1',4,'Grade 10','High School A','2025-04-13 06:33:04','2025-04-13 06:33:04'),('S2',5,'Grade 11','High School B','2025-04-17 06:59:48','2025-04-17 06:59:48'),('S3',37,'Aut explicabo Volup','Consectetur quia od','2025-04-17 14:43:50','2025-04-17 14:43:50'),('S4',39,'N/A','N/A','2025-04-17 14:44:15','2025-04-17 14:44:15'),('S5',41,'Pariatur Est eiusmo','Nisi dolorum omnis r','2025-04-17 14:45:08','2025-04-17 14:45:08');
/*!40000 ALTER TABLE `Students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TutorRequests`
--

DROP TABLE IF EXISTS `TutorRequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TutorRequests` (
  `requestID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `tutorID` varchar(50) NOT NULL,
  `status` enum('Pending','Accept','Deny') DEFAULT 'Pending',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`requestID`),
  KEY `userID` (`userID`),
  KEY `tutorID` (`tutorID`),
  CONSTRAINT `TutorRequests_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`),
  CONSTRAINT `TutorRequests_ibfk_2` FOREIGN KEY (`tutorID`) REFERENCES `Tutors` (`tutorID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TutorRequests`
--

LOCK TABLES `TutorRequests` WRITE;
/*!40000 ALTER TABLE `TutorRequests` DISABLE KEYS */;
INSERT INTO `TutorRequests` VALUES (1,10,'T3','Accept','2025-04-13 08:48:06','2025-04-13 10:00:55'),(2,12,'T4','Deny','2025-04-13 10:07:41','2025-04-13 10:14:06'),(3,15,'T5','Pending','2025-04-15 15:15:19','2025-04-15 15:15:19'),(4,35,'T6','Pending','2025-04-15 16:27:34','2025-04-15 16:27:34'),(5,36,'T7','Pending','2025-04-15 16:28:42','2025-04-15 16:28:42'),(6,38,'T8','Pending','2025-04-17 14:44:07','2025-04-17 14:44:07'),(7,40,'T9','Pending','2025-04-17 14:45:01','2025-04-17 14:45:01');
/*!40000 ALTER TABLE `TutorRequests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tutors`
--

DROP TABLE IF EXISTS `Tutors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tutors` (
  `tutorID` varchar(10) NOT NULL,
  `userID` int NOT NULL,
  `degrees` text,
  `identityCard` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `workplace` varchar(100) DEFAULT NULL,
  `description` text,
  `rating` float DEFAULT '0',
  `status` enum('Pending','Accept','Deny') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'Pending',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tutorID`),
  KEY `userID` (`userID`),
  CONSTRAINT `Tutors_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `Users` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tutors`
--

LOCK TABLES `Tutors` WRITE;
/*!40000 ALTER TABLE `Tutors` DISABLE KEYS */;
INSERT INTO `Tutors` VALUES ('T1',2,'PhD in Mathematics','ID123456','University of Science','Experienced math tutor with 5 years of teaching',4.3,'Pending','2025-04-13 06:33:04','2025-04-21 16:22:49'),('T2',3,'MSc in Physics','ID123457','High School Teacher','Physics expert with 3 years of tutoring experience',4.8,'Pending','2025-04-13 06:33:04','2025-04-15 15:16:53'),('T3',10,'https://firebasestorage.googleapis.com/v0/b/tutorverse-7a900.appspot.com/o/images%2F1a2a7252-0799-42ae-9256-c5776c6c05f5-images_69.jpg?alt=media&token=cf5e3e16-437b-48c6-b648-7f6f00e2ca60','ID123457','student1@example.com','he',0,'Pending','2025-04-13 08:48:06','2025-04-13 08:48:06'),('T4',12,'https://firebasestorage.googleapis.com/v0/b/tutorverse-7a900.appspot.com/o/images%2F448915af-6ba2-4f46-bee9-3ea139b627f1-images_64.jpg?alt=media&token=1b51163e-0274-4598-b48e-abbbfc698ff5','ID123457','dinhduy2012001@gmail.com','fe2222',0,'Pending','2025-04-13 10:07:41','2025-04-13 13:46:38'),('T5',15,'https://firebasestorage.googleapis.com/v0/b/tutorverse-7a900.appspot.com/o/images%2F00dd0b4c-86b8-4aef-8a13-87078437fba4-56942695_2263101410485011_1157234949391476054_n.jpg?alt=media&token=f653c00d-94e0-4cc8-bbcc-58d95a0e57ab','https://firebasestorage.googleapis.com/v0/b/tutorverse-7a900.appspot.com/o/images%2Feb7a9460-d271-4ea6-8e2d-e7592debb8cc-47082658_165487367779120_6841432910603845111_n.jpg?alt=media&token=77414224-55e8-48da-9ca8-8a5ef8c633d6','High School Teacher',' ad w,d ,mad',0,'Pending','2025-04-15 15:15:19','2025-04-15 15:15:19'),('T6',35,'','','','',0,'Pending','2025-04-15 16:27:34','2025-04-15 16:27:34'),('T7',36,'','','','',0,'Pending','2025-04-15 16:28:42','2025-04-15 16:28:42'),('T8',38,'default_degree.pdf','default_id.pdf','Eaque nihil id excep','Cupidatat dolores si',0,'Pending','2025-04-17 14:44:07','2025-04-17 14:44:07'),('T9',40,'default_degree.pdf','default_id.pdf','Default Workplace','Default Description',0,'Pending','2025-04-17 14:45:01','2025-04-17 14:45:01');
/*!40000 ALTER TABLE `Tutors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(50) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `role` enum('Student','Tutor','Moderator','Admin') NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `userName` (`userName`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'admin12','Admin User jkdbakjbdw','admin@example.com','$2b$12$rQqmB70swhZ1vJp880VE8.VEcjmH9Y/d2xFJusgOBAkeDLeoEs652',NULL,'1970-01-01','Admin','1234567890','Admin Address',1,'2025-04-13 06:33:04','2025-04-17 15:02:15'),(2,'tutor','John Tutor','tutor1@example.com','$2b$12$rQqmB70swhZ1vJp880VE8.VEcjmH9Y/d2xFJusgOBAkeDLeoEs652',NULL,'2001-12-31','Tutor','1234567891','Tutor Address 1',1,'2025-04-13 06:33:04','2025-04-15 14:43:46'),(3,'tutor22','Jane Tutor','tutor2@example.com','$2b$12$rQqmB70swhZ1vJp880VE8.VEcjmH9Y/d2xFJusgOBAkeDLeoEs652',NULL,NULL,'Tutor','1234567892','Tutor Address 2',1,'2025-04-13 06:33:04','2025-04-17 15:02:41'),(4,'hiep ngu ','Alice Student','student1@example.com','$2b$12$rQqmB70swhZ1vJp880VE8.VEcjmH9Y/d2xFJusgOBAkeDLeoEs652','https://firebasestorage.googleapis.com/v0/b/tutorverse-7a900.appspot.com/o/images%2Faa0c5614-87cf-4bbf-9d96-a76ece4c1665-download.jpg?alt=media&token=acf1b9ce-7fb8-4735-a33a-b53a321932d2','2009-11-16','Student','1234567893','Student Address 1222',1,'2025-04-13 06:33:04','2025-04-17 15:33:04'),(5,'student2','Bob Student','student2@example.com','$2b$12$rQqmB70swhZ1vJp880VE8.VEcjmH9Y/d2xFJusgOBAkeDLeoEs652','https://firebasestorage.googleapis.com/v0/b/tutorverse-7a900.appspot.com/o/images%2F14cc668b-d79c-4381-833e-bdeaf9b6a6df-images_64.jpg?alt=media&token=37729961-64b3-4fc4-adef-e30a7fee56ec','1970-01-01','Student','1234567894','Student Address 2',1,'2025-04-13 06:33:04','2025-04-13 06:40:09'),(6,'moderator1','Mike Moderator','moderator@example.com','$2b$12$rQqmB70swhZ1vJp880VE8.VEcjmH9Y/d2xFJusgOBAkeDLeoEs652',NULL,NULL,'Moderator','1234567895','Moderator Address',1,'2025-04-13 06:33:04','2025-04-13 06:37:50'),(10,'ddd','quoc hiep love dinh duy','dinhduy2012001@gmail.com','$2b$12$rQqmB70swhZ1vJp880VE8.VEcjmH9Y/d2xFJusgOBAkeDLeoEs652','https://firebasestorage.googleapis.com/v0/b/tutorverse-7a900.appspot.com/o/images%2F10817c8b-7bc4-4b97-a0ab-88089805bce7-images_64.jpg?alt=media&token=c5ae396f-b67c-4050-a962-625528d44db1','2006-01-17','Tutor','0921581712','abcdef',1,'2025-04-13 08:48:06','2025-04-13 09:44:04'),(12,'dddaa','quoc hiep love dinh duy','dinhduy20102001@gmail.com','$2a$10$pKZLrFDh7Dn1h9LzS9Vs6eYtWt1.uwQc399fQVbFoSCKVE8AFhXCy','https://firebasestorage.googleapis.com/v0/b/tutorverse-7a900.appspot.com/o/images%2F95a61da3-29d1-4a5a-af40-144f583180a6-download.jpg?alt=media&token=9e57628c-d921-49fd-9f38-c0caf304a988','2002-06-03','Tutor','0921581712','Thaibinh',1,'2025-04-13 10:07:41','2025-04-13 14:11:07'),(15,'sasukk17','TRAN THANH SON','sontran1zxc@gmail.com','$2b$10$BnaymN2/329Mjphgz9HGFOZLvlX/UOIPrMSaC1D4NqboyuW9pSBci','https://firebasestorage.googleapis.com/v0/b/tutorverse-7a900.appspot.com/o/images%2Fe0a32a84-092a-41ae-b9ff-c1c2dcf44c2a-19622835_662722890598290_5978762435023077376_n.jpg?alt=media&token=8f843a4c-e637-4cf0-a5b4-ed91389fee09','2001-12-03','Tutor','0399016069','6A3 TANG SO 5 PHAN BOI CHAU TRAN DA',0,'2025-04-15 15:15:19','2025-04-15 15:15:19'),(35,'boxiluzew','Keith Huff','jaky@mailinator.com','$2b$10$usZUzLmbimf5gEpyNCQ6Vue6dMVQjhfEbeQCy89OoX0TEWupaZ1KW','','2003-10-28','Tutor','+1 (498) 406-4773','Ex enim nemo ut iust',1,'2025-04-15 16:27:34','2025-04-15 16:27:34'),(36,'rorisemik','Ethan Wiggins','huhifemym@mailinator.com','$2b$10$uqfBnQpzQ8PAmh/JNVFdsu35UV.p.kCkJnTFbig.0m1pNTqIiMTUe','','1993-07-27','Tutor','+1 (605) 238-9999','Amet at voluptates ',1,'2025-04-15 16:28:42','2025-04-15 16:28:42'),(37,'cafidyqyli','Brian Boone','joxave@mailinator.com','$2b$10$JL7JPNwBDcfdwtziRM/thO73RJYq8iGnFN.Sd2scGDfbzH.dgdJnq','Commodi in impedit ','2006-12-11','Student','+1 (245) 526-9543','Ratione est elit bl',1,'2025-04-17 14:43:50','2025-04-17 14:43:50'),(38,'vukefiw','Azalia Cummings','bixopubu@mailinator.com','$2b$10$UvKycgjTgX4YRuZh7COM/uldNbZw/yTzi.x1t9aEeVcoe.nIDEqwq','Dolor esse ut enim o','2023-09-14','Tutor','+1 (487) 644-7698','Dolorem nulla consec',0,'2025-04-17 14:44:07','2025-04-17 14:44:07'),(39,'bimefy','Erin Calhoun','norudyqiza@mailinator.com','$2b$10$uyI7PVTn2a9McpJ3EESwweXoomd2TbnyVpRi.AzwYDBNnq8khjSbS','Amet cum non ipsum ','2006-01-13','Student','+1 (929) 424-7171','Illum laborum Iste',1,'2025-04-17 14:44:15','2025-04-17 14:44:15'),(40,'kohame','Len Knapp','boxusevigi@mailinator.com','$2b$10$VFdd6ndMcEY64ngsIau1GO08WHexop3.CDV5qF9M5mBHqJH1U0vEK','Quas placeat eu ali','2000-03-12','Tutor','+1 (768) 293-1946','Sed pariatur Ut ut ',0,'2025-04-17 14:45:01','2025-04-17 14:45:01'),(41,'wivetosi','Lynn Guerra','corezaz@mailinator.com','$2b$10$1/kA5jhJSGi8E5fl6Je68.FNOb3Yk6HLKrdr71gSNYFP9w/oZk0O2','Omnis consectetur cu','1976-10-01','Student','+1 (362) 439-4284','Laboriosam est cupi',1,'2025-04-17 14:45:08','2025-04-17 14:45:08');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-21 23:29:01
