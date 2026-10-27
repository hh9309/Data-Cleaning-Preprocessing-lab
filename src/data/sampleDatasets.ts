import { CaseStudy } from '../types';

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'ecommerce',
    title: '① 跨国电商订单脏数据清洗',
    subtitle: '缺失值填补与非法字符过滤',
    domain: '跨境电商零售',
    description: '跨境电商交易流水中常存在各国货币混杂、客户名含有异常转义乱码、运费出现负数、国家代码大小写不一与部分邮编/订单金额缺失问题。',
    targetCleaningPoints: [
      '金额混杂不同货币符号 ($ / € / ¥) 与千分位逗号',
      '客户名称混杂 HTML 乱码字符及首尾多余空格',
      '国家缩写大小写混乱 (US, us, u.s., DE, de)',
      '订单金额与折扣率包含 NA 隐式缺失',
      '存在重复下单记录 (相同 Order_ID)',
      '运费与件数出现反常负数与离群极值 ($99999.00)'
    ],
    recommendedSteps: [
      '使用 janitor::clean_names() 统一小写下划线',
      '调用 distinct(order_id, .keep_all = TRUE) 过滤重复订单',
      '利用 stringr 正则表达式清洗货币符号并转换为标准 numeric',
      '以 MICE 预测均值匹配 (PMM) 填补缺失金额，避免方差萎缩',
      '依据 IQR 剔除反常负数与输入手误的极端天价订单'
    ],
    primaryKey: 'Order_ID',
    rawColumns: ['Order_ID', 'Order Date', 'Customer Name (EN)', 'Country/Region', 'Raw Amount', 'Shipping Fee', 'Discount Rate', 'Item Qty', 'Status'],
    rawData: [
      { 'Order_ID': 'ORD-1001', 'Order Date': '2024-03-01', 'Customer Name (EN)': 'John Doe ', 'Country/Region': 'US', 'Raw Amount': '$1,299.50', 'Shipping Fee': '15.00', 'Discount Rate': '0.10', 'Item Qty': '2', 'Status': 'Delivered' },
      { 'Order_ID': 'ORD-1002', 'Order Date': '2024-03-01', 'Customer Name (EN)': 'Alice&amp;Smith', 'Country/Region': 'us', 'Raw Amount': '$450.00', 'Shipping Fee': '12.50', 'Discount Rate': '0.05', 'Item Qty': '1', 'Status': 'Shipped' },
      { 'Order_ID': 'ORD-1003', 'Order Date': '2024-03-02', 'Customer Name (EN)': 'Robert Chen', 'Country/Region': 'DE', 'Raw Amount': '€850.00', 'Shipping Fee': '-10.00', 'Discount Rate': null, 'Item Qty': '3', 'Status': 'Pending' },
      { 'Order_ID': 'ORD-1004', 'Order Date': '2024-03-02', 'Customer Name (EN)': 'Elena Rostova', 'Country/Region': 'UK', 'Raw Amount': '£1,100.00', 'Shipping Fee': '20.00', 'Discount Rate': '0.15', 'Item Qty': '4', 'Status': 'Delivered' },
      { 'Order_ID': 'ORD-1005', 'Order Date': '2024-03-03', 'Customer Name (EN)': 'Kenji Sato', 'Country/Region': 'JP', 'Raw Amount': '¥32,000', 'Shipping Fee': '0.00', 'Discount Rate': '0.00', 'Item Qty': '2', 'Status': 'Delivered' },
      { 'Order_ID': 'ORD-1002', 'Order Date': '2024-03-01', 'Customer Name (EN)': 'Alice&amp;Smith', 'Country/Region': 'us', 'Raw Amount': '$450.00', 'Shipping Fee': '12.50', 'Discount Rate': '0.05', 'Item Qty': '1', 'Status': 'Shipped' }, // 重复
      { 'Order_ID': 'ORD-1006', 'Order Date': '2024-03-03', 'Customer Name (EN)': 'Sophie Müller', 'Country/Region': 'de', 'Raw Amount': '€340.50', 'Shipping Fee': '8.00', 'Discount Rate': '0.20', 'Item Qty': '1', 'Status': 'Shipped' },
      { 'Order_ID': 'ORD-1007', 'Order Date': '2024-03-04', 'Customer Name (EN)': 'Carlos Gomez', 'Country/Region': 'ES', 'Raw Amount': null, 'Shipping Fee': '18.00', 'Discount Rate': '0.10', 'Item Qty': '2', 'Status': 'Processing' },
      { 'Order_ID': 'ORD-1008', 'Order Date': '2024-03-04', 'Customer Name (EN)': 'Liam O\'Connor', 'Country/Region': 'UK', 'Raw Amount': '£99,999.00', 'Shipping Fee': '25.00', 'Discount Rate': '0.00', 'Item Qty': '500', 'Status': 'Under_Review' }, // 极端异常值
      { 'Order_ID': 'ORD-1009', 'Order Date': '2024-03-05', 'Customer Name (EN)': 'Zoe Kravitz ', 'Country/Region': 'US', 'Raw Amount': '$780.00', 'Shipping Fee': '15.00', 'Discount Rate': '0.05', 'Item Qty': '2', 'Status': 'Delivered' },
      { 'Order_ID': 'ORD-1010', 'Order Date': '2024-03-05', 'Customer Name (EN)': 'Jean Luc', 'Country/Region': 'FR', 'Raw Amount': '€620.00', 'Shipping Fee': '14.00', 'Discount Rate': null, 'Item Qty': '1', 'Status': 'Shipped' },
      { 'Order_ID': 'ORD-1011', 'Order Date': '2024-03-06', 'Customer Name (EN)': 'Fatima Al-Sayed', 'Country/Region': 'AE', 'Raw Amount': '$2,450.00', 'Shipping Fee': '45.00', 'Discount Rate': '0.12', 'Item Qty': '5', 'Status': 'Delivered' },
      { 'Order_ID': 'ORD-1012', 'Order Date': '2024-03-06', 'Customer Name (EN)': 'Wei Zhang', 'Country/Region': 'CN', 'Raw Amount': '¥ 8,800', 'Shipping Fee': '0.00', 'Discount Rate': '0.08', 'Item Qty': '3', 'Status': 'Delivered' },
      { 'Order_ID': 'ORD-1013', 'Order Date': '2024-03-07', 'Customer Name (EN)': 'Lucas Silva', 'Country/Region': 'BR', 'Raw Amount': '$530.00', 'Shipping Fee': '30.00', 'Discount Rate': '0.00', 'Item Qty': '1', 'Status': 'Returned' },
      { 'Order_ID': 'ORD-1014', 'Order Date': '2024-03-07', 'Customer Name (EN)': 'Emma Watson#', 'Country/Region': 'UK', 'Raw Amount': '£1,420.00', 'Shipping Fee': '18.00', 'Discount Rate': '0.10', 'Item Qty': '3', 'Status': 'Delivered' },
      { 'Order_ID': 'ORD-1015', 'Order Date': '2024-03-08', 'Customer Name (EN)': 'David Park', 'Country/Region': 'KR', 'Raw Amount': null, 'Shipping Fee': '22.00', 'Discount Rate': '0.15', 'Item Qty': '2', 'Status': 'Shipped' },
    ]
  },
  {
    id: 'clinical',
    title: '② 医疗临床试验多中心数据质检',
    subtitle: '异常值剔除与格式标准化',
    domain: '生物医药与临床医学',
    description: '三期双盲临床试验汇聚全国 5 家中心受试者数据。受试者生理指标包含笔误性极大值（如收缩压 999 mmHg）、年龄输入负数、缺失关键生化指标，需严格遵循 ICH-GCP 规范审计。',
    targetCleaningPoints: [
      '收缩压 (SBP) 出现仪器故障/笔误 999 与 45 mmHg',
      '舒张压 (DBP) 与 SBP 逻辑倒置 (舒张压大于收缩压)',
      '年龄字段存在负数 (-3) 与超出人类认知极值 (165 岁)',
      '关键肿瘤标志物 (Biomarker X) 存在非随机缺失 (MNAR 嫌疑)',
      '相同受试者编号在同一随访周期发生两次重复记录'
    ],
    recommendedSteps: [
      '用 filter(age >= 18 & age <= 100) 过滤年龄非法值',
      '定义临床合理生理域：SBP ∈ [80, 220], DBP ∈ [50, 130]，超限设为 NA',
      '排查 SBP < DBP 的逻辑逻辑悖论行',
      '使用 naniar::vis_miss 探查生物标志物缺失是否与疾病严重度挂钩',
      '对剩余符合 MAR 条件的变量使用 MICE 贝叶斯抽样填补'
    ],
    primaryKey: 'Subject_ID',
    rawColumns: ['Subject_ID', 'Site_Center', 'Age', 'Gender', 'Systolic_BP', 'Diastolic_BP', 'Biomarker_X_ngml', 'Adverse_Event'],
    rawData: [
      { 'Subject_ID': 'SUB-001', 'Site_Center': 'Center_A', 'Age': '54', 'Gender': 'M', 'Systolic_BP': '138', 'Diastolic_BP': '88', 'Biomarker_X_ngml': '4.2', 'Adverse_Event': 'None' },
      { 'Subject_ID': 'SUB-002', 'Site_Center': 'Center_A', 'Age': '62', 'Gender': 'F', 'Systolic_BP': '145', 'Diastolic_BP': '92', 'Biomarker_X_ngml': '7.8', 'Adverse_Event': 'Mild_Nausea' },
      { 'Subject_ID': 'SUB-003', 'Site_Center': 'Center_B', 'Age': '-5', 'Gender': 'M', 'Systolic_BP': '120', 'Diastolic_BP': '80', 'Biomarker_X_ngml': null, 'Adverse_Event': 'None' }, // 非法年龄
      { 'Subject_ID': 'SUB-004', 'Site_Center': 'Center_B', 'Age': '48', 'Gender': 'F', 'Systolic_BP': '999', 'Diastolic_BP': '85', 'Biomarker_X_ngml': '5.1', 'Adverse_Event': 'None' }, // 极端生理异常
      { 'Subject_ID': 'SUB-005', 'Site_Center': 'Center_C', 'Age': '71', 'Gender': 'M', 'Systolic_BP': '80', 'Diastolic_BP': '125', 'Biomarker_X_ngml': '12.4', 'Adverse_Event': 'Dizziness' }, // 逻辑倒置
      { 'Subject_ID': 'SUB-006', 'Site_Center': 'Center_C', 'Age': '59', 'Gender': 'F', 'Systolic_BP': '132', 'Diastolic_BP': '84', 'Biomarker_X_ngml': '3.9', 'Adverse_Event': 'None' },
      { 'Subject_ID': 'SUB-002', 'Site_Center': 'Center_A', 'Age': '62', 'Gender': 'F', 'Systolic_BP': '145', 'Diastolic_BP': '92', 'Biomarker_X_ngml': '7.8', 'Adverse_Event': 'Mild_Nausea' }, // 重复行
      { 'Subject_ID': 'SUB-007', 'Site_Center': 'Center_D', 'Age': '165', 'Gender': 'M', 'Systolic_BP': '140', 'Diastolic_BP': '90', 'Biomarker_X_ngml': null, 'Adverse_Event': 'Rash' }, // 离谱年龄
      { 'Subject_ID': 'SUB-008', 'Site_Center': 'Center_D', 'Age': '51', 'Gender': 'F', 'Systolic_BP': '128', 'Diastolic_BP': '82', 'Biomarker_X_ngml': '6.3', 'Adverse_Event': 'None' },
      { 'Subject_ID': 'SUB-009', 'Site_Center': 'Center_E', 'Age': '66', 'Gender': 'M', 'Systolic_BP': '155', 'Diastolic_BP': '95', 'Biomarker_X_ngml': '18.7', 'Adverse_Event': 'Hypertension' },
      { 'Subject_ID': 'SUB-010', 'Site_Center': 'Center_E', 'Age': '43', 'Gender': 'F', 'Systolic_BP': '118', 'Diastolic_BP': '76', 'Biomarker_X_ngml': null, 'Adverse_Event': 'None' },
      { 'Subject_ID': 'SUB-011', 'Site_Center': 'Center_A', 'Age': '58', 'Gender': 'M', 'Systolic_BP': '136', 'Diastolic_BP': '86', 'Biomarker_X_ngml': '4.9', 'Adverse_Event': 'None' },
      { 'Subject_ID': 'SUB-012', 'Site_Center': 'Center_B', 'Age': '67', 'Gender': 'F', 'Systolic_BP': '142', 'Diastolic_BP': '88', 'Biomarker_X_ngml': '8.2', 'Adverse_Event': 'Headache' },
    ]
  },
  {
    id: 'financial',
    title: '③ 金融风控客户征信清洗审计',
    subtitle: '重复记录排查与类型强制转换',
    domain: '金融信贷风控',
    description: '银行个人消费信贷申请数据，包含字符串形式的收入（含汉字“元”、逗号）、超出常规的资产负债比（如 800%）、空值混淆（"NULL", "NA"）与重复申贷。',
    targetCleaningPoints: [
      '年收入字段包含中文单位与逗号 (如 "180,000元", "250000")',
      '负债比率 (DTI) 混入百分号且存在 850% 严重笔误',
      '征信评分 (Credit Score) 存在隐式缺失（标记为 -999 或 "NULL"）',
      '相同借款人同一天多次申请（重复进件风险）',
      '工龄存在极端异常值 (99 年，通常为录入占位符)'
    ],
    recommendedSteps: [
      '将 "-999"、"NULL"、"N/A" 统一重构为标准 NA (na_if)',
      '使用 readr::parse_number 纯净提取年收入与负债率数值',
      '利用 group_by(client_id) %>% slice_head(n=1) 过滤多头申贷重复件',
      '采用 Winsorization (99% 盖帽法) 平滑极端畸变收入',
      '应用中位数或基于职业分组的 KNN 填补征信评分缺失'
    ],
    primaryKey: 'Client_ID',
    rawColumns: ['Client_ID', 'Annual_Income_Raw', 'Credit_Score', 'Debt_To_Income', 'Delinquency_2Yr', 'Employment_Years', 'Loan_Approval'],
    rawData: [
      { 'Client_ID': 'CR-201', 'Annual_Income_Raw': '150,000元', 'Credit_Score': '720', 'Debt_To_Income': '28.5%', 'Delinquency_2Yr': '0', 'Employment_Years': '6', 'Loan_Approval': 'Approved' },
      { 'Client_ID': 'CR-202', 'Annual_Income_Raw': '85,000元', 'Credit_Score': '680', 'Debt_To_Income': '42.0%', 'Delinquency_2Yr': '1', 'Employment_Years': '3', 'Loan_Approval': 'Approved' },
      { 'Client_ID': 'CR-203', 'Annual_Income_Raw': '320,000元', 'Credit_Score': '-999', 'Debt_To_Income': '15.2%', 'Delinquency_2Yr': '0', 'Employment_Years': '12', 'Loan_Approval': 'Under_Review' }, // 隐式缺失
      { 'Client_ID': 'CR-204', 'Annual_Income_Raw': '45,000元', 'Credit_Score': '590', 'Debt_To_Income': '850.0%', 'Delinquency_2Yr': '4', 'Employment_Years': '1', 'Loan_Approval': 'Rejected' }, // 异常DTI
      { 'Client_ID': 'CR-205', 'Annual_Income_Raw': '210,000', 'Credit_Score': '745', 'Debt_To_Income': '22.0%', 'Delinquency_2Yr': '0', 'Employment_Years': '99', 'Loan_Approval': 'Approved' }, // 占位符工龄
      { 'Client_ID': 'CR-202', 'Annual_Income_Raw': '85,000元', 'Credit_Score': '680', 'Debt_To_Income': '42.0%', 'Delinquency_2Yr': '1', 'Employment_Years': '3', 'Loan_Approval': 'Approved' }, // 重复申贷
      { 'Client_ID': 'CR-206', 'Annual_Income_Raw': '110,000元', 'Credit_Score': 'NULL', 'Debt_To_Income': '35.4%', 'Delinquency_2Yr': '0', 'Employment_Years': '4', 'Loan_Approval': 'Pending' },
      { 'Client_ID': 'CR-207', 'Annual_Income_Raw': '950,000元', 'Credit_Score': '810', 'Debt_To_Income': '8.5%', 'Delinquency_2Yr': '0', 'Employment_Years': '15', 'Loan_Approval': 'Approved' },
      { 'Client_ID': 'CR-208', 'Annual_Income_Raw': '62,000元', 'Credit_Score': '640', 'Debt_To_Income': '55.0%', 'Delinquency_2Yr': '2', 'Employment_Years': '2', 'Loan_Approval': 'Rejected' },
      { 'Client_ID': 'CR-209', 'Annual_Income_Raw': '175,000元', 'Credit_Score': '715', 'Debt_To_Income': '31.0%', 'Delinquency_2Yr': '0', 'Employment_Years': '8', 'Loan_Approval': 'Approved' },
      { 'Client_ID': 'CR-210', 'Annual_Income_Raw': '130,000元', 'Credit_Score': null, 'Debt_To_Income': '29.0%', 'Delinquency_2Yr': '0', 'Employment_Years': '5', 'Loan_Approval': 'Approved' },
    ]
  },
  {
    id: 'iot_sensor',
    title: '④ 智慧城市物联网传感器降噪',
    subtitle: '时序缺失插值与极端离群点处理',
    domain: '智慧城市与环境监测',
    description: '城市空气质量网格化微型环境监测站回传的时序环境数据。受网络抖动影响出现时序性断流缺失；受雷电脉冲干扰出现瞬态爆表尖峰（PM2.5 = 9999.0）。',
    targetCleaningPoints: [
      '由于 4G 基站短时掉线导致连续 3 小时连续数据缺失 (NA)',
      '电压干扰产生瞬间脉冲离群值 (PM2.5 突增到 9999.0 µg/m³)',
      '温度传感器偶发失灵输出极寒负值 (-88.5 ℃)',
      '时间戳格式混杂毫秒与无毫秒，存在采样乱序',
      '电池电量百分比出现大于 100% (105%) 的校准漂移'
    ],
    recommendedSteps: [
      '使用 lubridate::as_datetime 规范化 ISO8601 时序时间轴',
      '利用 arrange(timestamp) 保证时间严格单调递增',
      '依据物理现实设置过滤条件：temp ∈ [-30, 60], pm2.5 ∈ [0, 800]',
      '对短时间断缺失应用时序线性插值 (zoo::na.approx) 或卡尔曼滤波',
      '将离群突波平滑替换为局部 5 阶滚动中位数 (slide_dbl / rollmedian)'
    ],
    primaryKey: 'Record_ID',
    rawColumns: ['Record_ID', 'Timestamp', 'Sensor_ID', 'PM2_5_ugm3', 'Temperature_C', 'Humidity_Pct', 'Battery_Pct'],
    rawData: [
      { 'Record_ID': 'IOT-801', 'Timestamp': '2024-04-10 08:00:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': '35.2', 'Temperature_C': '18.4', 'Humidity_Pct': '55.0', 'Battery_Pct': '98' },
      { 'Record_ID': 'IOT-802', 'Timestamp': '2024-04-10 08:15:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': '38.0', 'Temperature_C': '18.8', 'Humidity_Pct': '54.2', 'Battery_Pct': '98' },
      { 'Record_ID': 'IOT-803', 'Timestamp': '2024-04-10 08:30:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': '9999.0', 'Temperature_C': '19.1', 'Humidity_Pct': '53.8', 'Battery_Pct': '97' }, // 脉冲离群
      { 'Record_ID': 'IOT-804', 'Timestamp': '2024-04-10 08:45:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': null, 'Temperature_C': '19.5', 'Humidity_Pct': '53.0', 'Battery_Pct': '97' }, // 掉线缺失
      { 'Record_ID': 'IOT-805', 'Timestamp': '2024-04-10 09:00:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': null, 'Temperature_C': null, 'Humidity_Pct': null, 'Battery_Pct': '96' }, // 掉线缺失
      { 'Record_ID': 'IOT-806', 'Timestamp': '2024-04-10 09:15:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': '42.1', 'Temperature_C': '-88.5', 'Humidity_Pct': '51.5', 'Battery_Pct': '105' }, // 异常负温与超电量
      { 'Record_ID': 'IOT-807', 'Timestamp': '2024-04-10 09:30:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': '45.3', 'Temperature_C': '20.5', 'Humidity_Pct': '50.2', 'Battery_Pct': '95' },
      { 'Record_ID': 'IOT-808', 'Timestamp': '2024-04-10 09:45:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': '44.8', 'Temperature_C': '21.0', 'Humidity_Pct': '49.8', 'Battery_Pct': '94' },
      { 'Record_ID': 'IOT-809', 'Timestamp': '2024-04-10 10:00:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': '41.2', 'Temperature_C': '21.4', 'Humidity_Pct': '48.9', 'Battery_Pct': '94' },
      { 'Record_ID': 'IOT-810', 'Timestamp': '2024-04-10 10:15:00', 'Sensor_ID': 'SEN-NORTH-01', 'PM2_5_ugm3': '39.6', 'Temperature_C': '21.8', 'Humidity_Pct': '48.0', 'Battery_Pct': '93' },
    ]
  },
  {
    id: 'supply_chain',
    title: '⑤ 供应链多源异构表格对齐',
    subtitle: '列名清洗与日期格式统一',
    domain: '制造与现代供应链',
    description: '外部供应商通过 Excel 导出的物料与交货记录。列名带有空格、单位中括号与非 ASCII 字符；日期字段格式极度割裂（DD/MM/YYYY, YYYY-MM-DD, 包含时间戳混用）。',
    targetCleaningPoints: [
      '列名充斥空格、特殊符号与单位："Product ID #", "Vendor Name (CN)", "Ship Date/Time", "Unit Cost [USD]"',
      '日期混杂欧洲制 (15/03/2024)、ISO制 (2024-03-15) 与时间戳',
      '供应商名称存在空格全角半角不一致 (" Foxconn ", "Foxconn")',
      '在库件数 (Stock Qty) 混入文本后缀 (如 "500 pcs", "1,200 units")',
      '部分批次安全库存为负数违背物理常识'
    ],
    recommendedSteps: [
      '一键运行 janitor::clean_names() 将列名规范化为 product_id_number, vendor_name_cn 等 snake_case',
      '使用 stringr::str_trim() 清理供应商名称两端冗余空格',
      '应用 lubridate::parse_date_time(x, orders = c("ymd", "dmy", "mdy")) 智能解析混合日期',
      '用 readr::parse_number 剔除在库件数中的 "pcs", "units" 等多余文字',
      '设定数据契约检验：assertr::verify(stock_qty >= 0)'
    ],
    primaryKey: 'Product_ID_#',
    rawColumns: ['Product ID #', 'Vendor Name (CN)', 'Ship Date/Time', 'Unit Cost [USD]', 'Stock_Qty (units)', 'Lead Time (Days)'],
    rawData: [
      { 'Product ID #': 'SKU-501', 'Vendor Name (CN)': ' Foxconn Tech ', 'Ship Date/Time': '2024-03-12', 'Unit Cost [USD]': '$45.20', 'Stock_Qty (units)': '1,200 pcs', 'Lead Time (Days)': '7' },
      { 'Product ID #': 'SKU-502', 'Vendor Name (CN)': 'BYD Precision', 'Ship Date/Time': '14/03/2024', 'Unit Cost [USD]': '$120.00', 'Stock_Qty (units)': '450 units', 'Lead Time (Days)': '12' },
      { 'Product ID #': 'SKU-503', 'Vendor Name (CN)': 'Luxshare ICT', 'Ship Date/Time': '2024/03/15 14:30', 'Unit Cost [USD]': '$18.50', 'Stock_Qty (units)': '2,800 pcs', 'Lead Time (Days)': '-3' }, // 负交期
      { 'Product ID #': 'SKU-504', 'Vendor Name (CN)': 'Pegatron Corp', 'Ship Date/Time': '03-18-2024', 'Unit Cost [USD]': '$82.10', 'Stock_Qty (units)': null, 'Lead Time (Days)': '10' },
      { 'Product ID #': 'SKU-505', 'Vendor Name (CN)': 'Foxconn Tech', 'Ship Date/Time': '2024-03-20', 'Unit Cost [USD]': '$45.20', 'Stock_Qty (units)': '950 pcs', 'Lead Time (Days)': '7' },
      { 'Product ID #': 'SKU-506', 'Vendor Name (CN)': 'Delta Electronics', 'Ship Date/Time': '22/03/2024', 'Unit Cost [USD]': '$64.00', 'Stock_Qty (units)': '320 pcs', 'Lead Time (Days)': '15' },
      { 'Product ID #': 'SKU-507', 'Vendor Name (CN)': 'BYD Precision ', 'Ship Date/Time': '2024-03-25', 'Unit Cost [USD]': null, 'Stock_Qty (units)': '150 units', 'Lead Time (Days)': '14' },
      { 'Product ID #': 'SKU-508', 'Vendor Name (CN)': 'Goertek Inc', 'Ship Date/Time': '2024-03-28 09:00', 'Unit Cost [USD]': '$33.40', 'Stock_Qty (units)': '1,600 pcs', 'Lead Time (Days)': '5' },
    ]
  },
  {
    id: 'social_sentiment',
    title: '⑥ 社交媒体文本情感语料预处理',
    subtitle: '特殊符号过滤与整洁数据重塑',
    domain: 'NLP 与社交网络舆情',
    description: '从 Twitter/微博抓取的产品口碑语料。推文混杂大量 HTML 转义符、URL 垃圾外链、换行符；多道问卷题目呈宽表展开，需使用 tidyr 展开为整洁长表。',
    targetCleaningPoints: [
      '推文正文包含 HTML 实体符 (&amp;, &lt;, &gt;, &quot;)',
      '包含大量的网址链接 (https://t.co/...) 与表情符号噪声',
      '多道满意度题项以宽表形式展开 (Q1_UI, Q2_Speed, Q3_Price) 违背整洁数据规范',
      '点赞数与转发数缺失或被记录为文字 "None"',
      '包含无意义的纯符号推文与机器刷评重复内容'
    ],
    recommendedSteps: [
      '使用 stringr::str_replace_all 清洗 HTML 转义实体与超链接正则',
      '过滤非文本 emoji 或将其转化为 ASCII 规范描述',
      '使用 tidyr::pivot_longer(cols = starts_with("q"), names_to="dimension", values_to="score") 转换为 Hadley 整洁长表',
      '将点赞转发文字 "None" 转换为数值 0 或 NA',
      '剔除清洗后长度低于 3 个字符的无意义灌水推文'
    ],
    primaryKey: 'Post_ID',
    rawColumns: ['Post_ID', 'User_Handle', 'Post_Text_Raw', 'Likes_Count', 'Shares_Count', 'Q1_UI_Score', 'Q2_Speed_Score', 'Q3_Price_Score'],
    rawData: [
      { 'Post_ID': 'TWT-7001', 'User_Handle': '@alex_tech', 'Post_Text_Raw': 'Really loved the new update! &amp; performance is fast! https://bit.ly/test33', 'Likes_Count': '142', 'Shares_Count': '28', 'Q1_UI_Score': '5', 'Q2_Speed_Score': '5', 'Q3_Price_Score': '4' },
      { 'Post_ID': 'TWT-7002', 'User_Handle': '@sarah_dev', 'Post_Text_Raw': 'App crashes repeatedly on login &lt;sad&gt;... please fix!', 'Likes_Count': '85', 'Shares_Count': '12', 'Q1_UI_Score': '2', 'Q2_Speed_Score': '1', 'Q3_Price_Score': '3' },
      { 'Post_ID': 'TWT-7003', 'User_Handle': '@bot_promo99', 'Post_Text_Raw': 'Check out free discounts here &gt;&gt;&gt; https://spam.link/promo', 'Likes_Count': '0', 'Shares_Count': '0', 'Q1_UI_Score': null, 'Q2_Speed_Score': null, 'Q3_Price_Score': null },
      { 'Post_ID': 'TWT-7004', 'User_Handle': '@data_nerd', 'Post_Text_Raw': 'Clean tidy data makes modeling 10x easier. Thanks @tidyverse', 'Likes_Count': '312', 'Shares_Count': '64', 'Q1_UI_Score': '5', 'Q2_Speed_Score': '4', 'Q3_Price_Score': '5' },
      { 'Post_ID': 'TWT-7005', 'User_Handle': '@mike_g', 'Post_Text_Raw': 'Price is too high for basic features... &quot;overpriced&quot;', 'Likes_Count': '45', 'Shares_Count': '5', 'Q1_UI_Score': '3', 'Q2_Speed_Score': '3', 'Q3_Price_Score': '1' },
      { 'Post_ID': 'TWT-7006', 'User_Handle': '@emily_r', 'Post_Text_Raw': 'Outstanding customer service team!   ', 'Likes_Count': '98', 'Shares_Count': '16', 'Q1_UI_Score': '5', 'Q2_Speed_Score': '4', 'Q3_Price_Score': '4' },
      { 'Post_ID': 'TWT-7001', 'User_Handle': '@alex_tech', 'Post_Text_Raw': 'Really loved the new update! &amp; performance is fast! https://bit.ly/test33', 'Likes_Count': '142', 'Shares_Count': '28', 'Q1_UI_Score': '5', 'Q2_Speed_Score': '5', 'Q3_Price_Score': '4' }, // 重复抓取
      { 'Post_ID': 'TWT-7007', 'User_Handle': '@luke_sky', 'Post_Text_Raw': 'Decent experience so far, battery life could be better.', 'Likes_Count': '27', 'Shares_Count': '2', 'Q1_UI_Score': '4', 'Q2_Speed_Score': '3', 'Q3_Price_Score': '3' },
    ]
  }
];
