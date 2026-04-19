-- ============================================================
-- BACST Database Initialization
-- Creates all tables and inserts sample data
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS bacst CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bacst;

-- ==================== Schema ====================

CREATE TABLE IF NOT EXISTS homeData (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bannerImage VARCHAR(512),
  mainSlogan TEXT,
  subSlogan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS homeprofileData (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ProfileText TEXT,
  CompanyImage VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partnerLogos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  src VARCHAR(512),
  alt VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  mainimage VARCHAR(512),
  category VARCHAR(255),
  images LONGTEXT,
  specs LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS addressData (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contactBg VARCHAR(512),
  email VARCHAR(255),
  address TEXT,
  phone VARCHAR(50),
  adddress TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS aboutData (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aboutBanner VARCHAR(512),
  mainTitle VARCHAR(255),
  subTitle VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS aboutdetailData (
  id INT AUTO_INCREMENT PRIMARY KEY,
  AboutText TEXT,
  AboutImage VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS companyCulture (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brandIntroduction TEXT,
  operationImage VARCHAR(512),
  managementIdea TEXT,
  declaration LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS newData (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  summary TEXT,
  pdfUrl VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS shopURLData (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jd VARCHAR(512),
  dy VARCHAR(512),
  wx VARCHAR(512),
  wxgzh VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  src VARCHAR(512),
  title VARCHAR(255),
  subtitle VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS job_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_jobs_category (category),
  INDEX idx_jobs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recruitment_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bannerImage VARCHAR(512),
  bannerTitle VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recruitment_settings_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==================== Sample Data ====================

-- 首页大图
INSERT INTO homeData (bannerImage, mainSlogan, subSlogan) VALUES
('/home.jpg', '专业制造微型充气泵', '资深研发团队 | 1500万年产能 | 86,666平方米制造基地 | 行业标准主要起草单位');

-- 首页公司简介
INSERT INTO homeprofileData (ProfileText, CompanyImage) VALUES
('巴克斯通是一家专注于微型充气泵研发与制造的高新技术企业，拥有资深的研发团队和86,666平方米现代化制造基地。年产能达1500万台，是行业标准主要起草单位，长期与国内外知名车厂合作，致力于为客户提供高品质的产品与解决方案。', '/company.jpg');

-- 合作伙伴
INSERT INTO partnerLogos (src, alt) VALUES
('/partners/bmw.jpg', 'BMW'),
('/partners/vw.png', '大众'),
('/partners/lix.jpg', '理想'),
('/partners/toyota.png', '丰田'),
('/partners/honda.jpg', '本田');

-- 产品分类
INSERT INTO product_categories (category) VALUES
('车载充气泵'),
('轮胎补胎工具'),
('新能源充电桩'),
('车载应急包');

-- 示例产品
INSERT INTO products (name, description, mainimage, category, images, specs) VALUES
('智能车载充气泵 X1', '这款智能微型充气泵采用高精度集成芯片，支持预设胎压自动充气，LED数显屏实时显示胎压，适用于轿车、SUV、摩托车及自行车等多种轮胎。', '/products/product1.jpg', '车载充气泵', '["/products/智能微型充气泵001.jpg","/products/智能微型充气泵002.jpg","/products/智能微型充气泵003.jpg"]', '[["最大气压","150 PSI"],["工作电压","12V DC"],["充气速度","35L/min"],["产品重量","1.2kg"],["电源线长度","3m"]]'),
('快速补胎套装 R2', '包含补胎液、气泵一体机设计，无需拆卸轮胎即可完成快速修补。适用于大部分乘用车轮胎穿孔，5分钟内完成应急修复。', '/products/product2.jpg', '轮胎补胎工具', '["/products/补胎液进口原浆001.jpg","/products/补胎液进口原浆002.jpg"]', '[["适用轮胎","乘用车标准轮胎"],["修补时间","约5分钟"],["补胎液容量","450ml"],["工作温度","-20°C ~ 60°C"]]'),
('便携式充电桩 C3', '新能源汽车便携式交流充电桩，支持国标GB/T接口，适配市面主流新能源车型。IP67防水等级，适合家用及户外使用。', '/products/product3.jpg', '新能源充电桩', '["/products/product3.jpg","/products/product4.jpg"]', '[["额定功率","7kW"],["输入电压","220V AC"],["充电接口","GB/T"],["防护等级","IP67"],["线缆长度","5m"]]');

-- 联系方式
INSERT INTO addressData (contactBg, email, address, phone, adddress) VALUES
('/contact-bg.jpg', 'info@bacst.com', '广东省深圳市宝安区新安街道XX路XX号', '0755-12345678', '广东省东莞市XX镇XX工业园区XX号');

-- 关于公司大图
INSERT INTO aboutData (aboutBanner, mainTitle, subTitle) VALUES
('/About.png', '关于巴克斯通', '专注智能汽车配件，引领行业创新');

-- 关于公司详情
INSERT INTO aboutdetailData (AboutText, AboutImage) VALUES
('巴克斯通成立于2010年，总部位于深圳，是国内领先的汽车智能配件制造商。公司拥有超过200项专利技术，产品远销欧美、东南亚等60多个国家和地区。我们始终秉承"科技驱动品质"的理念，为全球客户提供可靠、创新的汽车配件解决方案。公司先后获得ISO9001、IATF16949等多项国际质量体系认证，是多家国际知名汽车品牌的一级供应商。', '/company.jpg');

-- 企业文化
INSERT INTO companyCulture (brandIntroduction, operationImage, managementIdea, declaration) VALUES
('巴克斯通以智能微型多功能车载充气泵、轮胎应急补胎工具、新能源汽车充电桩及车载应急包为核心产品，凭借卓越的产品品质和持续的技术创新，已成为行业内的领军企业。品牌致力于为全球汽车用户提供安全、便捷、智能的出行保障解决方案。', '/operation.png', '公司坚持"以人为本、顾客至上、持续经营、技术创新"为经营宗旨，努力发展壮大公司团队和规模，成为行业标杆。', '["质量为本，精益求精","客户至上，诚信共赢","创新驱动，引领行业","绿色制造，可持续发展"]');

-- 新闻
INSERT INTO newData (title, summary, pdfUrl) VALUES
('巴克斯通荣获2025年度最佳汽车配件品牌奖', '在第十届中国汽车配件行业评选中，巴克斯通凭借卓越的产品品质和创新能力，荣获"2025年度最佳汽车配件品牌"奖项。', ''),
('新一代智能充气泵X2系列正式发布', '巴克斯通于2025年春季新品发布会上正式推出新一代智能充气泵X2系列，全新升级的传感器和算法带来更精准的胎压控制。', ''),
('巴克斯通与欧洲知名车企达成战略合作', '巴克斯通近日与欧洲某知名汽车制造商签署长期战略合作协议，将为其全球车型提供定制化车载充气泵解决方案。', '');

-- 店铺二维码
INSERT INTO shopURLData (jd, dy, wx, wxgzh) VALUES
('/jd.png', '/dy.png', '/wx.png', '/wxgzh.png');

-- 资质证书
INSERT INTO certifications (src, title, subtitle) VALUES
('/certificate.png', 'ISO9001质量管理体系认证', '国际质量标准'),
('/certificate2.png', 'IATF16949汽车质量管理体系', '汽车行业国际标准'),
('/certificate.png', 'CE欧盟认证', '欧盟市场准入'),
('/certificate2.png', '高新技术企业证书', '国家级认定');

-- 职位分类
INSERT INTO job_categories (category) VALUES
('技术类'),
('市场类'),
('生产类'),
('行政类');

-- 职位
INSERT INTO jobs (title, category, location, description) VALUES
('嵌入式软件工程师', '技术类', '深圳', '负责车载充气泵核心控制系统的嵌入式软件开发，要求熟悉C/C++，有MCU开发经验优先。'),
('结构设计工程师', '技术类', '东莞', '负责新产品的结构设计与优化，熟练使用SolidWorks/ProE，3年以上消费电子或汽车配件结构设计经验。'),
('海外市场经理', '市场类', '深圳', '负责欧美市场的客户开发与维护，要求英语流利，有汽车配件行业海外销售经验优先。'),
('品质主管', '生产类', '东莞', '负责生产线品质管控，推动品质改善项目，要求熟悉ISO9001/IATF16949质量体系。'),
('人事行政专员', '行政类', '深圳', '负责招聘、员工关系、行政事务管理，要求本科以上学历，1年以上相关经验。');

-- 招聘设置
INSERT INTO recruitment_settings (bannerImage, bannerTitle) VALUES
('https://via.placeholder.com/1600x700/8e44ad/ffffff?text=Join+Us', '加入巴克斯通，共创未来');
