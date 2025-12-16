cmake_minimum_required(VERSION 3.10)
project(edge)

find_package(CURL REQUIRED)

add_executable(edge main.cpp)

target_link_libraries(edge PRIVATE CURL::libcurl)