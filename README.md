# Multi-tenancy-Grading-System
In this project I will be creating a Multi-Tenant, Cloud Scale, Multi-AZ SaaS App in Amazon Web Services.

Operations Requirements:

- The solution is contained within a VPC in Oregon (US-WEST-2)
- Using Amazon Application Load Balancer
- Each student is a "tenant" and must be isolated within their own AMI/Instance(s).
- The solution supports Data Multi-Tenancy by managing Extension Columnin a single Relational Database using Amazon RDS.
- Building a Single Page App for the Java Source Code to be submitted and graded.
- Provide a "Grader" login that will then "Pin" all interactions with the App to the respective Tenant Instances.
- For Grading Page, graders are allowed to do Tenant Specific customization such that grading Attributes (Scale, Points, Complete/Not Complete, and Comments) can be customized.

Technolog used:
- AWS EC2
- AWS Application Load Balancer
- AWS Elastic Scaling
- Nodejs
- MongoDB
- AWS RDS MySQL
