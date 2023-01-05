CREATE TABLE IF NOT EXISTS `users` (
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(45) NULL,
  `surname` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `is_admin` TINYINT NULL DEFAULT 0,
  `lastactive_date` TIMESTAMP NULL,
  `registration_date` TIMESTAMP NULL,
  PRIMARY KEY (`user_id`));

---

CREATE TABLE IF NOT EXISTS `groups` (
  `group_id` VARCHAR(36) NOT NULL,
  `cist_id` INT NULL,
  `name` VARCHAR(45) NULL,
  `valid_timetable` TINYINT NULL,
  PRIMARY KEY (`group_id`),
  UNIQUE(`cist_id`));

---

CREATE TABLE IF NOT EXISTS `teachers` (
  `teacher_id` VARCHAR(36) NOT NULL,
  `cist_id` INT NULL,
  `short_name` VARCHAR(45) NULL,
  `full_name` VARCHAR(45) NULL,
  `valid_timetable` TINYINT NULL,
  PRIMARY KEY (`teacher_id`),
  UNIQUE(`cist_id`));

---

CREATE TABLE IF NOT EXISTS `audiences` (
  `audience_id` VARCHAR(36) NOT NULL,
  `cist_id` INT NULL,
  `name` VARCHAR(50) NULL,
  `floor` INT NULL,
  `is_have_power` TINYINT NULL,
  `valid_timetable` TINYINT NULL,
  PRIMARY KEY (`audience_id`),
  UNIQUE(`cist_id` ASC));

---

CREATE TABLE IF NOT EXISTS `timetables` (
  `timetable_id` VARCHAR(36) NOT NULL,
  `cist_id` INT NULL,
  `name` VARCHAR(45) NULL,
  `data` JSON NULL,
  `type` INT NULL,
  `request_count` INT NULL,
  `update_date` TIMESTAMP NULL,
  `creation_date` TIMESTAMP NULL,
  PRIMARY KEY (`timetable_id`),
  UNIQUE(`cist_id` ASC));