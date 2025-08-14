# SysML 图示例

## 1. Requirements Diagram
```
 +-------------------+
 |  User Management  |
 +-------------------+
	 |
 +-------------------+
 |Appointment Mgmt   |
 +-------------------+
	 |
 +-------------------+
 |Medical Records    |
 +-------------------+
	 |
 +-------------------+
 | Messaging System  |
 +-------------------+
	 |
 +-------------------+
 |   Security        |
 +-------------------+
```
![requirements-diagram](./assets/sysml-requirements.png)

## 2. Block Definition Diagram (BDD)
```
 +---------+     +--------------+
 |  User   |-----| Appointment  |
 +---------+     +--------------+
	 |                |
	 |                v
	 |         +--------------+
	 |         | MedicalRecord|
	 |         +--------------+
	 |                |
	 v                v
 +--------------+  +--------------+
 |DoctorSchedule|  |   Message    |
 +--------------+  +--------------+
```
![bdd-diagram](./assets/sysml-bdd.png)

## 3. Parametric Diagram
```
 [Patient]--(books)-->[Appointment]--(assigned to)-->[Doctor]
 [Doctor]--(creates)-->[MedicalRecord]--(belongs to)-->[Patient]
 [User]--(sends/receives)-->[Message]--(relates to)-->[Appointment]
```
![parametric-diagram](./assets/sysml-parametric.png)

> 请将实际绘制的 SysML 图（如 draw.io、PlantUML 或专业工具导出）放入 assets 目录，并替换上述图片。
