package com.sharevax.core.service;

import com.sharevax.core.facade.SimulationFacade;
import com.sharevax.core.model.Country;
import com.sharevax.core.model.Delivery;
import com.sharevax.core.model.Demand;
import com.sharevax.core.model.Supply;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SimulationService {

    private static int DAY_COUNTER = 1;

    private final SimulationFacade simulationFacade;

    // Coefficient of distance between two harbors
    private static double DISTANCE_FACTOR = 1;

    // The coefficient of urgency in calculating the urgency score
    private static double URGENCY_FACTOR = 1;

    private static double GIVEN_URGENCY_FACTOR = 1;

    // How much we take into account the Vaccination Rate of the country when calculating urgency
    private static final double VACCINATION_RATE_FACTOR = 1;

    // Daily vaccine consumption / stock ratio to determine if the country is in need of vaccines, increase urgency
    private static final double DAILY_VAX_CONSUMPTION_TO_STOCK_FACTOR = 1;

    public SimulationService(SimulationFacade simulationFacade) {
        this.simulationFacade = simulationFacade;
    }

    public void simulateDay() {
        DAY_COUNTER++;
        triggerEvents();    // TODO: implement this
        updateShipLocations();  //TODO: implement this

        updateVaccineStocks();
        updateVaccinationRates();

        matchSupplyAndDemand();

        System.out.println("Day: " + DAY_COUNTER);
    }

    private void matchSupplyAndDemand() {
        // Get current set of supplies
        // Get current set of demands
        // Match them intelligently

        var supplies = simulationFacade.getUnmatchedSupplies();
        var demands = simulationFacade.getUnmatchedDemands();

        if (supplies.isEmpty() || demands.isEmpty()) {
            return;
        }

        Map<Demand.Urgency, Integer> enumToUrgencyScore = new HashMap<>(){{
                put(Demand.Urgency.NORMAL, 1);
                put(Demand.Urgency.URGENT, 2);
                put(Demand.Urgency.CRITICAL, 3);
        }};

        HashMap<Demand, Integer> givenDemandUrgencies = demands.stream()
                .collect(HashMap::new, (m, v) -> m.put(v, enumToUrgencyScore.get(v.getUrgency())), HashMap::putAll);

        HashMap<Demand, Double> demandToVaccinationRates = new HashMap<>();
        for (Demand demand : demands) {
            demandToVaccinationRates.put(demand, demand.getCountry().getVaccinationRate());
        }

        HashMap<Demand, Double> demandToDailyVaccineConsumptionToStock = new HashMap<>();
        for (Demand demand : demands) {
            demandToDailyVaccineConsumptionToStock.put(demand,
                    demand.getCountry()
                            .getDailyVaccineConsumption().doubleValue() / demand.getCountry().getVaccineStock().doubleValue());
        }

        var estimatedUrgencyScores = getEstimatedUrgencyScores(
                givenDemandUrgencies,
                demandToVaccinationRates,
                demandToDailyVaccineConsumptionToStock);

        var distanceScores = getDistanceScoresForPairs(supplies, demands);
        var matchedBestPairs = findBestPairs(demands, estimatedUrgencyScores, distanceScores);

        for (var demand : matchedBestPairs.keySet()) {
            var supply = matchedBestPairs.get(demand);
            if (supply != null) {
                System.out.println("Matched " + demand + " with " + supply);
            }

            // Create the Delivery
            Delivery delivery = simulationFacade.createDelivery(
                    supply.getCountry().getHarbors().get(0), // TODO use closest harbor
                    demand.getCountry().getHarbors().get(0), // TODO use closest harbor
                    // 5 days later
                    new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 5), // TODO calculate est. date based on distance
                    supply,
                    demand
            );

            System.out.println("Created delivery: " + delivery);
        }
    }

    private HashMap<Demand, Supply> findBestPairs(List<Demand> demands,
                               HashMap<Demand, Double> estimatedUrgencyScores,
                               HashMap<Demand, ImmutablePair<Double, Supply>> distanceScores) {
        // Sort demands by distance and urgency
        // Use cumulative score to sort demands
        HashMap<Demand, Double> demandToCumulativeScore = new HashMap<>();
        HashMap<Demand, Supply> demandToClosestSupply = new HashMap<>();

        for (Demand demand : demands) {
            var urgencyScore = estimatedUrgencyScores.get(demand);
            var distanceScore = distanceScores.get(demand).getLeft();
            demandToCumulativeScore.put(demand, calculateCumulativeScore(urgencyScore, distanceScore));
            demandToClosestSupply.put(demand, distanceScores.get(demand).getRight());
        }

        // Sort descending based on demandToCumulativeScore
        demands.sort((d1, d2) -> demandToCumulativeScore.get(d2).compareTo(demandToCumulativeScore.get(d1)));

        // Match demands to supplies
        HashMap<Demand, Supply> demandToSupply = new HashMap<>();

        // Until all supplies are matched, or all demands are matched
        while (!demands.isEmpty() && !demandToClosestSupply.isEmpty()) {
            // Get the demand with the highest cumulative score
            var demand = demands.get(0);
            var supply = demandToClosestSupply.get(demand);

            // Match the demand to the supply
            demandToSupply.put(demand, supply);

            // Remove the demand from the list of demands
            demands.remove(demand);

            // Remove the supply from the list of supplies
            demandToClosestSupply.remove(demand);
        }

        return demandToSupply;
    }

    private double calculateCumulativeScore(double urgencyScore, double distanceScore) {
        return urgencyScore * GIVEN_URGENCY_FACTOR + distanceScore * DISTANCE_FACTOR;
    }

    private HashMap<Demand, Double> getEstimatedUrgencyScores(HashMap<Demand, Integer> givenDemandUrgencies,
                                                              HashMap<Demand, Double> demandToVaccinationRates,
                                        HashMap<Demand, Double> demandToDailyVaccineConsumptionToStock) {
        /**
         * Calculate the urgency score for each demand, based on the following factors:
         * 1. Given urgency scores
         * 2. Demand to vaccination rates
         * 3. Demand to daily vaccine consumption to stock
         * Normalize these values and calculate the score,
         * Based on the defined static coefficients
         */
        HashMap<Demand, Double> demandToUrgencyScores = new HashMap<>();
        // Normalize each score factor
        double maxGivenUrgencyScore = givenDemandUrgencies.values().stream().mapToDouble(Integer::doubleValue).max().getAsDouble();

        double maxVaccinationRate = demandToVaccinationRates.values().stream().mapToDouble(Double::doubleValue).max().getAsDouble();
        double maxDailyVaccineConsumptionToStock = demandToDailyVaccineConsumptionToStock.values().stream().mapToDouble(Double::doubleValue).max().getAsDouble();

        for (Demand demand : givenDemandUrgencies.keySet()) {
            double urgencyScore = calculateUrgencyScore(givenDemandUrgencies.get(demand), maxGivenUrgencyScore,
                    demandToVaccinationRates.get(demand), maxVaccinationRate,
                    demandToDailyVaccineConsumptionToStock.get(demand), maxDailyVaccineConsumptionToStock);

            demandToUrgencyScores.put(demand, urgencyScore);
        }

        return demandToUrgencyScores;
    }

    private double calculateUrgencyScore(Integer givenUrgency, double maxGivenUrgency,
                                         Double vaccinationRate, double maxVaccinationRate,
                                         Double dailyVaccineConsumptionToStock, double maxDailyVaccineConsumptionToStock) {
         
        return givenUrgency / maxGivenUrgency * GIVEN_URGENCY_FACTOR +
                // lower the vaccination rate, higher the score should be
                (maxVaccinationRate - vaccinationRate) / maxVaccinationRate * VACCINATION_RATE_FACTOR +
                dailyVaccineConsumptionToStock / maxDailyVaccineConsumptionToStock * DAILY_VAX_CONSUMPTION_TO_STOCK_FACTOR;
    }

    private HashMap<Demand, ImmutablePair<Double, Supply>> getDistanceScoresForPairs(List<Supply> supplies,
                                                                                     List<Demand> demands) {
        /**
         * Calculate the distance score for each supply-demand pair which is inverse of the shortest distance
         * Return the demand -> (distance score, closestSupply) pair
         */
        HashMap<Demand, ImmutablePair<Double, Supply>> distanceScores = new HashMap<>();
        for (Demand demand : demands) {
            double minDistance = Double.MAX_VALUE;
            Supply closestSupply = null;

            // For each demand we find the closest supply
            for (Supply supply : supplies) {
                double distance = simulationFacade.findShortestDistanceBetweenDemandAndSupply(demand, supply);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSupply = supply;
                }
            }

            var distanceScore = calculateDistanceScore(minDistance);

            distanceScores.put(demand, new ImmutablePair<>(distanceScore, closestSupply));
        }

        // Normalize the distance scores to be between 0 and 1, 1 being the best and closest pair
        double maxDistanceScore = distanceScores.values().stream().mapToDouble(ImmutablePair::getLeft).max().getAsDouble();
        for (Demand demand : distanceScores.keySet()) {
            distanceScores.put(demand,
                    new ImmutablePair<>(distanceScores.get(demand).getLeft() / maxDistanceScore,
                            distanceScores.get(demand).getRight()));
        }

        return distanceScores;
    }

    private double calculateDistanceScore(double shortestDistanceBetweenHarbors) {
        // Score is the inverse of the distance
        return 1 / shortestDistanceBetweenHarbors;
    }

    private void updateVaccineStocks() {
        // update vaccine stock based on vaccine production and consumption
        var countries = simulationFacade.getAllCountries();
        for (Country country : countries) {
            var production = country.getDailyVaccineProduction();
            var consumption = country.getDailyVaccineConsumption();
            var stock = country.getVaccineStock();

            var updatedStock = stock.add(production).subtract(consumption);
            country.setVaccineStock(updatedStock);
        }
    }

    private void updateVaccinationRates() {
        var countries = simulationFacade.getAllCountries();
        for (Country country : countries) {
            var consumption = country.getDailyVaccineConsumption();
            var population = country.getPopulation();

            // consume daily amount of vaccines and update vaccination rate
            var updatedVaccinationRate = country.getVaccinationRate() + (consumption.doubleValue() / population.doubleValue());
            country.setVaccinationRate(updatedVaccinationRate);
        }
    }

    private void triggerEvents() {
        // TODO
        // Check for events that should be triggered
    }

    private void updateShipLocations() {
        // TODO
        // Update delivery routes every day
        // Update fields routeHistory, futureRoute and remainingDaysToNextHarbor
        // Also set updatedAt field of delivery after updating.
    }

    public int getDay() {
        return DAY_COUNTER;
    }
}