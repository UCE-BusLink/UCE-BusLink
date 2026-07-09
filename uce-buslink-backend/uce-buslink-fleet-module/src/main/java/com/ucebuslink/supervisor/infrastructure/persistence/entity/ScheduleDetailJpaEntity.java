package com.ucebuslink.supervisor.infrastructure.persistence.entity;

import com.ucebuslink.shared.constant.ScheduleType;
import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "schedule_details")
@Getter
@Setter
public class ScheduleDetailJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    // Back-reference to the parent (Master)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private ScheduleJpaEntity schedule;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false)
    private ScheduleType type;

    @ElementCollection(targetClass = DayOfWeek.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "schedule_detail_days", joinColumns = @JoinColumn(name = "schedule_detail_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private Set<DayOfWeek> daysOfWeek = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "schedule_fixed_times", joinColumns = @JoinColumn(name = "schedule_detail_id"))
    @Column(name = "departure_time")
    @OrderBy("departure_time ASC")
    private List<LocalTime> fixedDepartureTimes = new ArrayList<>();

    @Column(name = "frequency_start_time")
    private LocalTime frequencyStartTime;

    @Column(name = "frequency_end_time")
    private LocalTime frequencyEndTime;

    @Column(name = "frequency_interval_minutes")
    private Integer frequencyIntervalMinutes;
}