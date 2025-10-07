/**
 * Strategy Pattern Implementation
 * 
 * 用途：提供不同的排序策略，可以在运行时动态切换
 * Why: 解耦排序逻辑，使得添加新的排序方式更加灵活
 */

// 排序策略接口（抽象基类）
class SortingStrategy {
    sort(items) {
        throw new Error('Sort method must be implemented');
    }
}

// 按日期排序策略
class DateSortStrategy extends SortingStrategy {
    constructor(order = 'asc') {
        super();
        this.order = order;
    }

    sort(items) {
        return items.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return this.order === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }
}

// 按状态排序策略
class StatusSortStrategy extends SortingStrategy {
    constructor() {
        super();
        // 状态优先级定义
        this.statusPriority = {
            'pending': 1,
            'confirmed': 2,
            'completed': 3,
            'cancelled': 4,
            'no-show': 5
        };
    }

    sort(items) {
        return items.sort((a, b) => {
            const priorityA = this.statusPriority[a.status] || 999;
            const priorityB = this.statusPriority[b.status] || 999;
            return priorityA - priorityB;
        });
    }
}

// 按优先级排序策略
class PrioritySortStrategy extends SortingStrategy {
    constructor() {
        super();
        // 预约类型优先级
        this.typePriority = {
            'emergency': 1,
            'follow-up': 2,
            'consultation': 3,
            'routine': 4
        };
    }

    sort(items) {
        return items.sort((a, b) => {
            const priorityA = this.typePriority[a.type] || 999;
            const priorityB = this.typePriority[b.type] || 999;
            return priorityA - priorityB;
        });
    }
}

// 按时间槽排序策略
class TimeSlotSortStrategy extends SortingStrategy {
    sort(items) {
        return items.sort((a, b) => {
            // 提取时间槽中的小时数
            const timeA = parseInt(a.timeSlot.split(':')[0]);
            const timeB = parseInt(b.timeSlot.split(':')[0]);
            return timeA - timeB;
        });
    }
}

// 组合排序策略（先按日期，再按时间槽）
class CompositeTimeStrategy extends SortingStrategy {
    sort(items) {
        return items.sort((a, b) => {
            // 先按日期
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
            }
            // 日期相同时按时间槽
            const timeA = parseInt(a.timeSlot.split(':')[0]);
            const timeB = parseInt(b.timeSlot.split(':')[0]);
            return timeA - timeB;
        });
    }
}

// 排序上下文类
class AppointmentSorter {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    sort(appointments) {
        if (!this.strategy) {
            throw new Error('Sorting strategy not set');
        }
        return this.strategy.sort([...appointments]); // 使用副本避免修改原数组
    }
}

module.exports = {
    SortingStrategy,
    DateSortStrategy,
    StatusSortStrategy,
    PrioritySortStrategy,
    TimeSlotSortStrategy,
    CompositeTimeStrategy,
    AppointmentSorter
};

