# AWS IoT Setup for Autonomous Guardians

This document outlines the steps to set up AWS IoT for the Autonomous Guardians project.

## 1. Prerequisites

- An AWS account
- AWS CLI installed and configured

## 2. Create a Thing

A "thing" is a representation of your device in the AWS IoT registry.

```bash
aws iot create-thing --thing-name "autonomous_guardian_device_1"
```

## 3. Create and Attach Certificates

Create a certificate for the device to securely connect to AWS IoT.

```bash
aws iot create-keys-and-certificate --set-as-active \
    --certificate-pem-outfile "device.pem.crt" \
    --public-key-outfile "device.pem.pub" \
    --private-key-outfile "device.pem.key"
```

Download the Amazon Root CA file.

```bash
curl -o root.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem
```

## 4. Create a Policy

Create a policy that defines the permissions for the device.

Create a file named `policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:client/autonomous_guardian_device_1"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:topic/guardians/data"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:topicfilter/guardians/commands"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Receive",
      "Resource": "arn:aws:iot:REGION:ACCOUNT_ID:topic/guardians/data"
    }
  ]
}
```

Create the policy in AWS IoT:

```bash
aws iot create-policy --policy-name "AutonomousGuardianPolicy" --policy-document file://policy.json
```

## 5. Attach Policy to Certificate

Attach the policy to the certificate you created.

```bash
aws iot attach-policy --policy-name "AutonomousGuardianPolicy" --target "CERTIFICATE_ARN"
```

## 6. Attach Thing to Certificate

Attach the thing to the certificate.

```bash
aws iot attach-thing-principal --thing-name "autonomous_guardian_device_1" --principal "CERTIFICATE_ARN"
```

## 7. Device SDK

Use the AWS IoT Device SDK for C++ to connect your device to AWS IoT.
This will be implemented in the `iot-device` directory.

```