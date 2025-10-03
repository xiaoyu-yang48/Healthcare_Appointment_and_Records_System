/**
 * Observer Pattern Implementation
 * 
 * 用途：实现发布-订阅模式，当事件发生时自动通知所有订阅者
 * Why: 解耦事件触发者和事件处理者，支持多个观察者同时接收通知
 */

// 观察者接口
class Observer {
    update(event, data) {
        throw new Error('Update method must be implemented');
    }
}

// 具体观察者：邮件通知
class EmailNotificationObserver extends Observer {
    update(event, data) {
        console.log(`[Email Notification] Event: ${event}`);
        console.log(`Sending email to: ${data.recipientEmail}`);
        console.log(`Subject: ${data.subject}`);
        console.log(`Content: ${data.content}`);
        // 实际项目中这里会调用邮件发送服务
        return {
            type: 'email',
            sent: true,
            recipient: data.recipientEmail,
            timestamp: new Date()
        };
    }
}

// 具体观察者：短信通知
class SMSNotificationObserver extends Observer {
    update(event, data) {
        console.log(`[SMS Notification] Event: ${event}`);
        console.log(`Sending SMS to: ${data.recipientPhone}`);
        console.log(`Message: ${data.message}`);
        // 实际项目中这里会调用短信发送服务
        return {
            type: 'sms',
            sent: true,
            recipient: data.recipientPhone,
            timestamp: new Date()
        };
    }
}

// 具体观察者：应用内通知
class InAppNotificationObserver extends Observer {
    constructor(noticeModel) {
        super();
        this.noticeModel = noticeModel;
    }

    async update(event, data) {
        console.log(`[In-App Notification] Event: ${event}`);
        try {
            // 创建应用内通知记录
            const notice = await this.noticeModel.create({
                recipientId: data.recipientId,
                senderId: data.senderId,
                type: data.noticeType,
                title: data.title,
                content: data.content,
                relatedId: data.relatedId,
                relatedType: data.relatedType
            });
            
            return {
                type: 'in-app',
                created: true,
                noticeId: notice._id,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Failed to create in-app notification:', error);
            return {
                type: 'in-app',
                created: false,
                error: error.message
            };
        }
    }
}

// 具体观察者：日志记录
class LoggingObserver extends Observer {
    update(event, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            data: data,
            level: data.level || 'info'
        };
        
        console.log('[System Log]', JSON.stringify(logEntry, null, 2));
        
        // 实际项目中这里会写入日志文件或日志系统
        return {
            type: 'log',
            logged: true,
            timestamp: new Date()
        };
    }
}

// 主题（Subject）- 通知中心
class NotificationCenter {
    constructor() {
        this.observers = [];
        this.eventHistory = [];
    }

    /**
     * 添加观察者
     */
    attach(observer) {
        if (!(observer instanceof Observer)) {
            throw new Error('Observer must be instance of Observer class');
        }
        this.observers.push(observer);
        console.log(`Observer attached. Total observers: ${this.observers.length}`);
    }

    /**
     * 移除观察者
     */
    detach(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
            console.log(`Observer detached. Total observers: ${this.observers.length}`);
        }
    }

    /**
     * 通知所有观察者
     */
    async notify(event, data) {
        console.log(`\n[NotificationCenter] Broadcasting event: ${event}`);
        console.log(`Total observers to notify: ${this.observers.length}`);
        
        const results = [];
        
        for (const observer of this.observers) {
            try {
                const result = await observer.update(event, data);
                results.push(result);
            } catch (error) {
                console.error(`Observer notification failed:`, error);
                results.push({
                    type: 'unknown',
                    error: error.message,
                    timestamp: new Date()
                });
            }
        }

        // 记录事件历史
        this.eventHistory.push({
            event,
            data,
            results,
            timestamp: new Date()
        });

        return results;
    }

    /**
     * 获取事件历史
     */
    getEventHistory(limit = 10) {
        return this.eventHistory.slice(-limit);
    }

    /**
     * 清空观察者
     */
    clearObservers() {
        this.observers = [];
        console.log('All observers cleared');
    }
}

// 创建单例通知中心
let notificationCenterInstance = null;

const getNotificationCenter = () => {
    if (!notificationCenterInstance) {
        notificationCenterInstance = new NotificationCenter();
    }
    return notificationCenterInstance;
};

module.exports = {
    Observer,
    EmailNotificationObserver,
    SMSNotificationObserver,
    InAppNotificationObserver,
    LoggingObserver,
    NotificationCenter,
    getNotificationCenter
};

