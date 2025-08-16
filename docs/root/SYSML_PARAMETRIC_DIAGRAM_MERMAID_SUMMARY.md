# SysML参数图Mermaid代码总结

## 📊 概述

本文档总结了医疗预约系统SysML参数图对应的Mermaid代码，包括6个主要参数图的完整Mermaid表示。

---

## 🎯 Mermaid图表类型选择

### 为什么选择classDiagram？

对于SysML参数图，我们选择使用 `classDiagram`而不是其他Mermaid图表类型，原因如下：

1. **约束块表示**：classDiagram可以很好地表示约束块（Constraint Block）
2. **参数关系**：可以清晰显示参数之间的约束关系
3. **值属性**：能够表示具体的数值和属性
4. **关系连接**：支持约束、输入、输出等关系的表示

### 其他图表类型的适用性

- **sequenceDiagram**：适用于时序图，不适合参数关系
- **erDiagram**：适用于实体关系图，不适合约束关系
- **flowchart**：适用于流程图，不适合数学约束

---

## 📋 参数图Mermaid代码清单

### 1. 系统性能约束参数图

```mermaid
classDiagram
    class UserCapacityConstraint {
        +TotalUsers = Patients + Doctors + Admins
        +TotalUsers ≤ MaxUsers
        +Patients ≤ MaxPatients
        +Doctors ≤ MaxDoctors
    }
  
    class MaxUsers {
        +value: 10000
    }
  
    class MaxDoctors {
        +value: 500
    }
  
    class MaxPatients {
        +value: 9500
    }
  
    class CurrentPatients {
        +value: 2500
    }
  
    class CurrentDoctors {
        +value: 150
    }
  
    class CurrentAdmins {
        +value: 10
    }
  
    class TotalUsers {
        +value: 2660
    }
  
    class Utilization {
        +value: 26.6%
    }
  
    UserCapacityConstraint --> MaxUsers : constraint
    UserCapacityConstraint --> MaxDoctors : constraint
    UserCapacityConstraint --> MaxPatients : constraint
    UserCapacityConstraint --> CurrentPatients : input
    UserCapacityConstraint --> CurrentDoctors : input
    UserCapacityConstraint --> CurrentAdmins : input
    UserCapacityConstraint --> TotalUsers : output
    UserCapacityConstraint --> Utilization : output
```

### 2. 预约系统性能参数图

```mermaid
classDiagram
    class AppointmentCapacityConstraint {
        +DailyAppointments ≤ MaxDailyAppointments
        +ConcurrentUsers ≤ MaxConcurrentUsers
        +AvgResponseTime ≤ ResponseTime
        +SystemLoad = ConcurrentUsers / MaxConcurrentUsers
    }
  
    class MaxDailyAppointments {
        +value: 1000
    }
  
    class MaxConcurrentUsers {
        +value: 500
    }
  
    class ResponseTime {
        +value: 2s
    }
  
    class DailyAppointments {
        +value: 450
    }
  
    class ConcurrentUsers {
        +value: 120
    }
  
    class AvgResponseTime {
        +value: 1.8s
    }
  
    class SystemLoad {
        +value: 24%
    }
  
    class CapacityUtilization {
        +value: 45%
    }
  
    AppointmentCapacityConstraint --> MaxDailyAppointments : constraint
    AppointmentCapacityConstraint --> MaxConcurrentUsers : constraint
    AppointmentCapacityConstraint --> ResponseTime : constraint
    AppointmentCapacityConstraint --> DailyAppointments : input
    AppointmentCapacityConstraint --> ConcurrentUsers : input
    AppointmentCapacityConstraint --> AvgResponseTime : input
    AppointmentCapacityConstraint --> SystemLoad : output
    AppointmentCapacityConstraint --> CapacityUtilization : output
```

### 3. 数据库性能参数图

```mermaid
classDiagram
    class DatabasePerformanceConstraint {
        +ActiveConnections ≤ MaxConnections
        +QueryResponseTime ≤ QueryTimeout
        +UsedStorage ≤ StorageSize
        +ConnectionUtilization = ActiveConnections/MaxConnections
        +StorageUtilization = UsedStorage/StorageSize
    }
  
    class MaxConnections {
        +value: 100
    }
  
    class QueryTimeout {
        +value: 30s
    }
  
    class StorageSize {
        +value: 100GB
    }
  
    class ActiveConnections {
        +value: 45
    }
  
    class QueryResponseTime {
        +value: 0.8s
    }
  
    class UsedStorage {
        +value: 25GB
    }
  
    class ConnectionUtilization {
        +value: 45%
    }
  
    class StorageUtilization {
        +value: 25%
    }
  
    DatabasePerformanceConstraint --> MaxConnections : constraint
    DatabasePerformanceConstraint --> QueryTimeout : constraint
    DatabasePerformanceConstraint --> StorageSize : constraint
    DatabasePerformanceConstraint --> ActiveConnections : input
    DatabasePerformanceConstraint --> QueryResponseTime : input
    DatabasePerformanceConstraint --> UsedStorage : input
    DatabasePerformanceConstraint --> ConnectionUtilization : output
    DatabasePerformanceConstraint --> StorageUtilization : output
```

### 4. 系统响应时间参数图

```mermaid
classDiagram
    class ResponseTimeConstraint {
        +TotalResponseTime = NetworkLatency + APICallTime + DBQueryTime + ProcessingTime
        +PageLoadTime ≤ MaxPageLoad
        +APICallTime ≤ MaxAPICall
        +DBQueryTime ≤ MaxDBQuery
    }
  
    class MaxPageLoad {
        +value: 3s
    }
  
    class MaxAPICall {
        +value: 1s
    }
  
    class MaxDBQuery {
        +value: 0.5s
    }
  
    class NetworkLatency {
        +value: 0.2s
    }
  
    class APICallTime {
        +value: 0.6s
    }
  
    class DBQueryTime {
        +value: 0.3s
    }
  
    class ProcessingTime {
        +value: 0.1s
    }
  
    class TotalResponseTime {
        +value: 1.2s
    }
  
    ResponseTimeConstraint --> MaxPageLoad : constraint
    ResponseTimeConstraint --> MaxAPICall : constraint
    ResponseTimeConstraint --> MaxDBQuery : constraint
    ResponseTimeConstraint --> NetworkLatency : input
    ResponseTimeConstraint --> APICallTime : input
    ResponseTimeConstraint --> DBQueryTime : input
    ResponseTimeConstraint --> ProcessingTime : input
    ResponseTimeConstraint --> TotalResponseTime : output
```

### 5. 系统可用性参数图

```mermaid
classDiagram
    class AvailabilityConstraint {
        +UptimePercentage = (TotalTime - Downtime) / TotalTime
        +UptimePercentage ≥ TargetUptime
        +AnnualDowntime ≤ MaxDowntime
        +MonthlyMaintenance ≤ MaintenanceWindow
        +MTTR = Mean Time To Repair
        +MTBF = Mean Time Between Failures
    }
  
    class TargetUptime {
        +value: 99.9%
    }
  
    class MaxDowntime {
        +value: 8.76h/year
    }
  
    class MaintenanceWindow {
        +value: 2h/month
    }
  
    class CurrentUptime {
        +value: 99.95%
    }
  
    class AnnualDowntime {
        +value: 4.38h
    }
  
    class MonthlyMaintenance {
        +value: 1.5h
    }
  
    class MTTR {
        +value: 2h
    }
  
    class MTBF {
        +value: 720h
    }
  
    AvailabilityConstraint --> TargetUptime : constraint
    AvailabilityConstraint --> MaxDowntime : constraint
    AvailabilityConstraint --> MaintenanceWindow : constraint
    AvailabilityConstraint --> CurrentUptime : input
    AvailabilityConstraint --> AnnualDowntime : input
    AvailabilityConstraint --> MonthlyMaintenance : input
    AvailabilityConstraint --> MTTR : output
    AvailabilityConstraint --> MTBF : output
```

### 6. 综合系统参数图

```mermaid

classDiagram
    class author{
        StudentName: BrainDu
        +StudentID: 12257451
    }
    class SystemCapacityConstraint {
        +TotalUsers = Patients + Doctors + Admins
        +UserUtilization = TotalUsers / MaxUsers
        +UserUtilization ≤ 80% (Safety Margin)
    }
  
    class PerformanceConstraint {
        +SystemLoad = ConcurrentUsers / MaxConcurrentUsers
        +ResponseTime = NetworkLatency + APICallTime + DBQueryTime + ProcessingTime
        +SystemLoad ≤ 70% (Optimal Performance)
    }
  
    class QualityConstraint {
        +UptimePercentage ≥ 99.9%
        +DataAccuracy = 100%
        +SecurityCompliance = 100%
    }
  
    class CurrentSystemStatus {
        +UserUtilization: 26.6% ✓
        +SystemLoad: 24% ✓
        +ResponseTime: 1.2s ✓
        +UptimePercentage: 99.95% ✓
        +OverallPerformance: Excellent
    }


  
    SystemCapacityConstraint --> CurrentSystemStatus : status
    PerformanceConstraint --> CurrentSystemStatus : status
    QualityConstraint --> CurrentSystemStatus : status
```

---

## 🔧 Mermaid代码规范

### 1. 类定义规范

#### 约束块类

```mermaid
classDiagram
    class ConstraintName {
        +MathematicalExpression
        +Constraint1 ≤ Limit1
        +Constraint2 = Expression2
    }
```

#### 参数类

```mermaid
classDiagram
    class ParameterName {
        +value: ParameterValue
    }
```

### 2. 关系定义规范

#### 约束关系

```mermaid
classDiagram
ConstraintBlock --> Parameter : constraint

```

#### 输入关系

```mermaid
classDiagram


ConstraintBlock --> InputParameter : input
```

#### 输出关系

```mermaid
classDiagram

ConstraintBlock --> OutputParameter : output
```

#### 状态关系

```mermaid
classDiagram

ConstraintBlock --> Status : status
```

### 3. 数学表达式表示

#### 基本运算

- 加法：`A + B`
- 减法：`A - B`
- 乘法：`A * B`
- 除法：`A / B`

#### 约束符号

- 小于等于：`≤`
- 大于等于：`≥`
- 等于：`=`

#### 复杂表达式

```mermaid
classDiagram
    class ComplexConstraint {
        +Result = (A + B) / C * D
        +Condition ≤ Limit
    }
```

---

## 📈 使用建议

### 1. 在文档中使用

```markdown
### 参数图示例
```mermaid
classDiagram
    class ExampleConstraint {
        +Output = Input1 + Input2
        +Output ≤ MaxValue
    }
  
    class Input1 {
        +value: 100
    }
  
    class Input2 {
        +value: 200
    }
  
    class MaxValue {
        +value: 500
    }
  
    class Output {
        +value: 300
    }
  
    ExampleConstraint --> Input1 : input
    ExampleConstraint --> Input2 : input
    ExampleConstraint --> MaxValue : constraint
    ExampleConstraint --> Output : output
```

```

### 2. 在演示中使用

- 使用Mermaid Live Editor进行实时编辑
- 在GitHub、GitLab等平台中直接渲染
- 在文档工具中嵌入显示

### 3. 版本控制

- 将Mermaid代码与字符图一起保存
- 使用版本控制跟踪参数变化
- 建立参数图模板库

---

## 🎯 总结

通过使用Mermaid的classDiagram，我们成功地将SysML参数图转换为可执行的代码表示，具有以下优势：

1. **可视化清晰**：约束关系和参数值一目了然
2. **易于维护**：代码化的表示便于版本控制
3. **平台兼容**：支持多种文档和演示平台
4. **实时渲染**：支持在线编辑和实时预览
5. **标准化**：遵循Mermaid语法规范

这些Mermaid代码为医疗预约系统的参数图提供了完整的数字化表示，支持系统的设计、分析和维护工作。
```
