package com.ucebuslink.supervisor.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;

@Configuration
@EnableScheduling
public class SchedulerConfig implements SchedulingConfigurer {

    // Without an explicit scheduler, Spring Boot falls back to a single-threaded
    // pool shared by every @Scheduled method across all modules. A slow task (e.g.
    // the 5s tracking snapshot job under heavy bus traffic) then delays every other
    // one, including the GPS buffer flush, letting it grow unbounded.
    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("scheduled-task-");
        scheduler.initialize();
        taskRegistrar.setTaskScheduler(scheduler);
    }
}