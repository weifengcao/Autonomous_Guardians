#include <iostream>
#include <string>
#include <vector>
#include <chrono>
#include <thread>
#include <memory>
#include <stdexcept>
#include <cstdio>
#include <array>
#include <nlohmann/json.hpp>

// Function to execute a command and get the output
std::string exec(const char* cmd) {
    std::array<char, 128> buffer;
    std::string result;
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(cmd, "r"), pclose);
    if (!pipe) {
        throw std::runtime_error("popen() failed!");
    }
    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
        result += buffer.data();
    }
    return result;
}

// Data structures
struct Waypoint {
    double lat;
    double lon;
};

struct Route {
    std::string id;
    std::string name;
    std::vector<Waypoint> waypoints;
};

// --- Main Simulation ---
int main() {
    const std::string API_URL = "http://127.0.0.1:8000";

    while (true) {
        try {
            // 1. Fetch routes
            std::cout << "Fetching routes from backend..." << std::endl;
            std::string routes_json_str = exec(("curl -s " + API_URL + "/routes").c_str());
            
            if (routes_json_str.empty()) {
                std::cerr << "Could not fetch routes. Is the backend running?" << std::endl;
                std::this_thread::sleep_for(std::chrono::seconds(10));
                continue;
            }

            auto routes_json = nlohmann::json::parse(routes_json_str);
            if (routes_json.empty()) {
                std::cout << "No routes available to patrol. Waiting..." << std::endl;
                std::this_thread::sleep_for(std::chrono::seconds(10));
                continue;
            }

            // 2. Select the first route
            Route current_route;
            const auto& first_route_json = routes_json[0];
            current_route.id = first_route_json["id"];
            current_route.name = first_route_json["name"];
            for(const auto& wp_json : first_route_json["waypoints"]) {
                current_route.waypoints.push_back({wp_json["lat"], wp_json["lon"]});
            }
            
            std::cout << "Starting patrol of route: " << current_route.name << std::endl;

            // 3. Patrol waypoints
            for (size_t i = 0; i < current_route.waypoints.size(); ++i) {
                const auto& waypoint = current_route.waypoints[i];
                std::cout << "Navigating to waypoint " << (i + 1) << "/" << current_route.waypoints.size() 
                          << " (" << waypoint.lat << ", " << waypoint.lon << ")" << std::endl;

                // 4. Report status
                nlohmann::json status_payload;
                status_payload["status_message"] = "Navigating to waypoint";
                status_payload["current_route_id"] = current_route.id;
                status_payload["current_waypoint_index"] = i;

                std::string status_cmd = "curl -s -X POST -H \"Content-Type: application/json\" -d '" + status_payload.dump() + "' " + API_URL + "/robot/status";
                exec(status_cmd.c_str());

                // 5. Simulate travel time
                std::this_thread::sleep_for(std::chrono::seconds(5));
            }

            std::cout << "Route '" << current_route.name << "' completed." << std::endl;
            nlohmann::json final_status_payload;
            final_status_payload["status_message"] = "Route completed. Idle.";
            final_status_payload["current_route_id"] = current_route.id;
            std::string final_status_cmd = "curl -s -X POST -H \"Content-Type: application/json\" -d '" + final_status_payload.dump() + "' " + API_URL + "/robot/status";
            exec(final_status_cmd.c_str());


        } catch (const std::exception& e) {
            std::cerr << "An error occurred: " << e.what() << std::endl;
        }

        std::cout << "Waiting for 10 seconds before next patrol." << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(10));
    }

    return 0;
}