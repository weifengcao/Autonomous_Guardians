# **Product Requirements Document (PRD): Autonomous Guardians (AG) MVP**

Product Name: Autonomous Guardians (AG)  
Version: 1.0 (Minimum Viable Product)  
Date: December 16, 2025  
Owner: Product Management  
Status: Ready for Implementation

## **1\. Introduction and Goals**

The **Autonomous Guardians (AG)** MVP is a highly advanced, Vision-Language-Agent (VLA)-powered security ground vehicle designed to augment human security teams in complex perimeter monitoring and safety-critical rapid alarm verification. The strategic goal of this MVP is to establish a secure, resilient, and continuously operational platform that adheres to the **Human-Robot Teaming (HrT)** model, shifting the human role from routine patrol to complex, agentic oversight and decision-making.

### **1.1. Strategic Goals (Based on Research Sections I & V)**

* **Operational Augmentation:** Implement routine security tasks to free up human personnel for critical, high-level security tasks, maximizing operational efficiency.  
* **Continuous Endurance:** Provide 24/7, unwavering perimeter monitoring capacity.  
* **Foundational Security:** Establish a Zero Trust architecture as a safety-critical engineering function to mitigate the high-impact cyber and platform integrity risks identified in the research.  
* **HrT Enablement:** Ensure seamless human control, validation, and intervention in all scenarios.

## **2\. Target Users and Use Cases**

### **2.1. Target Users**

| Role | Primary Responsibility | Critical Need |
| :---- | :---- | :---- |
| **Security Operator (Tier 1\)** | Remote monitoring and manual override of the robot. | Real-time, reliable telemetry and video feed to make rapid decisions. |
| **Security Manager (Tier 2\)** | Defining patrol routes, managing incidents, and system availability. | Confirmed, high-accuracy threat reports and system health status. |
| **IT/OT Security Team** | Patch management and network configuration. | Automated update mechanisms and network segmentation controls. |
| **External Developer/Partner** | Integrating AG data/control into third-party security platforms (VMS/PSIM) using the SDK. | Secure, well-documented, and reliable APIs/SDKs for interaction. |

### **2.2. Use Cases (MVP Scope)**

1. **Automated Routine Patrol (Core Function):** The robot executes a predefined, timed route, checking perimeter integrity, gates, and doors, and confirming the absence of visible risks (Section I, 1.1).  
2. **Alarm Verification and Dispatch (Core Function):** Upon receiving a trigger signal from a connected legacy system (e.g., door sensor), the robot autonomously navigates to the alarm location to provide immediate visual data to the human operator (Section I, 1.1).  
3. **Manual Intervention (HrT Critical):** A human operator takes immediate manual control of the robot in case of an operational failure, threat, or the need for a non-routine inspection (Section V, 5.2).

## **3\. Functional Requirements (FR)**

| ID | Feature | Description | Priority |
| :---- | :---- | :---- | :---- |
| **FR 1.0** | **Route Management** | System allows T2 users to upload, store, and modify predefined patrol paths. | High |
| **FR 2.0** | **Autonomous Navigation** | The UGV must autonomously navigate the defined route using its sensor suite (LiDAR/SLAM/GPS). It must avoid obstacles and report navigation deviation errors. | High |
| **FR 3.0** | **Real-Time Surveillance** | The UGV must continuously stream high-definition video and sensor data (thermal/LiDAR data feed) to the Operator Console. | High |
| **FR 4.0** | **AI-Powered Object Recognition** | The system must distinguish accurately between humans and inanimate objects and flag any deviations (e.g., an unexpected vehicle, a person where none should be). | High |
| **FR 5.0** | **Incident Reporting & Logging** | The system must generate a high-fidelity incident report (with video snippet, time, and location) for any detected security or safety risk, alerting the T1 operator in real-time. | High |
| **FR 6.0** | **Human Manual Override** | The T1 Operator Console must provide a reliable, low-latency interface to take over manual control of the UGV at any point during patrol or alarm response. | Critical |
| **FR 7.0** | **Secure External API & SDK** | Provide a RESTful API and lightweight SDK for secure, authenticated integration of AG telemetry and incident data with approved third-party Video Management Systems (VMS) and alarm panels. | High |

## **4\. Non-Functional Requirements (NFR): Security and Resilience**

The following requirements are derived directly from the **Strategic Mitigation Blueprint (Section III)** and are mandatory for the MVP to address safety-critical risks.

### **4.1. Architecture and Network Hardening (Zero Trust Robotics)**

| ID | Requirement | Source / Rationale |
| :---- | :---- | :---- |
| **NFR 1.1** | **Network Isolation** | The UGV and its operator console connection must operate on an isolated Virtual Local Area Network (VLAN). (Sec 3.1) |
| **NFR 1.2** | **Access Control Lists (ACLs)** | ACLs must be strictly configured to limit inbound/outbound network traffic to only necessary and authorized communication ports and services. (Sec 3.1) |
| **NFR 1.3** | **Physical Port Hardening** | All non-essential physical connectivity points (e.g., accessible USB ports) and wireless components (e.g., unused WiFi chips) must be disabled or physically secured if the UGV relies on stationary or wired connections. (Sec 3.1) |
| **NFR 1.4** | **Least Privilege Access** | All default users must be removed, and custom access profiles based on the Principle of Least Privilege must be implemented for robot login and inter-component access. (Sec 3.1) |

### **4.2. Secure Communication and Platform Integrity**

| ID | Requirement | Source / Rationale |
| :---- | :---- | :---- |
| **NFR 2.1** | **End-to-End Encryption** | All wireless communication (long-range) must utilize WPA2 or a higher secure transport layer. (Sec 3.2) |
| **NFR 2.2** | **Message Integrity** | All command and telemetry messages transmitted between the UGV and the console must be digitally signed and/or encrypted to prevent MitM and spoofing attacks. (Sec 3.2) |
| **NFR 2.3** | **Component Authentication** | All system components (robot, console, charging station) must authenticate themselves before initiating communication. (Sec 3.2) |
| **NFR 2.4** | **Automated Patch Management** | The system must support and execute unattended, continuous deployment of software, firmware, and security patches without relying on human intervention. (Sec 3.2) |
| **NFR 2.5** | **Availability Redundancy** | The UGV must be designed with multiple long-range communication transport layers (e.g., WiFi and 4G/5G Cellular data) to provide a critical failover path against jamming or DoS attacks. (Sec 3.3) |

### **4.3. Model & Developer Ecosystem Security (New)**

| ID | Requirement | Source / Rationale |
| :---- | :---- | :---- |
| **NFR 3.1** | **On-Device Model Hardening** | The VLA model running on the UGV edge-compute must be protected via Adversarial Fine-Tuning and rigorous runtime monitoring to ensure resilience against adversarial manipulation and model compromise. (Sec 2.4, 3.4) |
| **NFR 3.2** | **API Ecosystem Security** | The external API (FR 7.0) must enforce OAuth 2.0 or equivalent token-based security and implement robust rate-limiting and input sanitization to ensure scalability and prevent denial-of-service or injection attacks. |
| **NFR 3.3** | **Secure SDK Implementation** | The provided SDK must manage credential storage and rotation securely on behalf of the developer, limiting access only to vetted API endpoints based on the principle of least privilege. |

## **5\. Operational and Ethical Requirements (HrT & Governance)**

The following requirements ensure the UGV operates responsibly and facilitates effective Human-Robot Teaming (HrT).

| ID | Requirement | Source / Rationale |
| :---- | :---- | :---- |
| **OER 1.1** | **Mutual Performance Monitoring** | The UGV must provide continuous, real-time feedback on its resource status (e.g., battery life, processor load, sensor health) to the T1 Operator Console. (Sec 5.2) |
| **OER 1.2** | **Operational Failure Flagging** | The UGV must automatically flag and alert the T1 operator upon detecting internal operational failures, such as excessive battery drain or navigation system errors. (Sec 2.3, 5.2) |
| **OER 1.3** | **Active Surveillance Transparency** | When the UGV's cameras and microphones are actively recording (beyond navigation data), a clear, visible/audible cue (e.g., a flashing light, a soft tone) must be engaged to inform surrounding individuals of data collection. (Sec 4.1) |
| **OER 1.4** | **Data Minimization** | The system must be configured to only collect, store, and transmit the specific data (e.g., video, telemetry) strictly necessary for the security mission, enforcing a policy of data minimization. (Sec 4.1) |
| **OER 1.5** | **Liability Documentation** | The system must continuously log all inputs (manual controls, commands) and autonomous outputs (decisions, actions) to create an irrefutable audit trail to support liability attribution in the event of an incident. (Sec 4.3) |

## **6\. Definition of Success**

The **Autonomous Guardians (AG)** MVP will be considered a success if:

1. It reliably completes 98% of all scheduled routine patrols over a 30-day period without requiring human manual intervention for routine navigation.  
2. All security incidents flagged by the AI are confirmed, reviewed, and acted upon by a human operator within five minutes, demonstrating successful HrT integration.  
3. The system passes a third-party audit of its Zero Trust network configuration, automated patch management efficacy, and external API security posture.