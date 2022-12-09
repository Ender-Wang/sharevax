package com.sharevax.core.model.dto;


import com.sharevax.core.model.Delivery;
import lombok.*;
import org.locationtech.jts.geom.LineString;

import java.math.BigInteger;
import java.util.Date;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDto {
    Integer deliveryId;
    HarborSummaryDto startHarbor;
    HarborSummaryDto destinationHarbor;
    String deliveryStatus;
    Date createdAt;
    BigInteger quantity;
    String urgency;
    String vaccineType;
    Date estimatedArrivalDate;
    Date currentArrivalDate;

    // Optional fields
    Date updatedAt;
    Integer remainingDaysToNextHarbor;
    LineString routeHistory;
    LineString futureRoute;

    public static DeliveryDto from(Delivery delivery) {
        return DeliveryDto.builder()
                .deliveryId(delivery.getId())
                .startHarbor(HarborSummaryDto.from(delivery.getStartHarbor()))
                .destinationHarbor(HarborSummaryDto.from(delivery.getDestinationHarbor()))
                .deliveryStatus(delivery.getDeliveryStatus().toString())
                .createdAt(delivery.getCreatedAt())
                .quantity(delivery.getSupply().getQuantity())
                .urgency(delivery.getDemand().getUrgency().toString())
                .vaccineType(delivery.getSupply().getVaccineType().toString())
                .estimatedArrivalDate(delivery.getEstimatedArrivalDate())
                .currentArrivalDate(delivery.getCurrentArrivalDate())
                .updatedAt(delivery.getUpdatedAt())
                .remainingDaysToNextHarbor(delivery.getRemainingDaysToNextHarbor())
                .routeHistory(delivery.getRouteHistory())
                .futureRoute(delivery.getFutureRoute())
                .build();
    }

        public String getRouteHistoryString(){
        if(this.routeHistory.isEmpty()){
            return "";
        }
        return this.routeHistory.toString();
    }

    public String getFutureRouteString(){
        if(this.futureRoute.isEmpty()){
            return "";
        }
        return this.futureRoute.toString();
    }

}
