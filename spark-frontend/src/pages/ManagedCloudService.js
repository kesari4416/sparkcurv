import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, Cloud, Server, GitBranch, Box, Activity, Database } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import FAQSection from '../components/FAQSection';
import SEO from '../components/SEO';
const subPages = {
  'overview': {
    title: 'Managed Cloud Service',
    subtitle: 'End-to-End Cloud & Infrastructure Management',
    description: 'We provide comprehensive managed cloud services — from cloud infrastructure and CI/CD automation to containerization, monitoring, and database management. Let us handle your infrastructure so you can focus on building your product.',
    image: '/images/services/managed-cloud-hero.jpg',
    features: [
      'Cloud Infrastructure Setup & Management',
      'CI/CD Pipeline Automation',
      'Infrastructure as Code with CloudFormation & Terraform',
      'Docker & Kubernetes Containerization',
      '24/7 Cloud & Database Monitoring',
      'Database Administration & Optimization',
      'Disaster Recovery & High Availability',
      'Security & Compliance Management',
    ],
    subServices: [
      { name: 'Cloud Services', path: '/managed-cloud-service/cloud-services', icon: Cloud, description: 'AWS, Azure, GCP cloud infrastructure setup and management' },
      { name: 'CI/CD Automation', path: '/managed-cloud-service/cicd-automation', icon: GitBranch, description: 'Automated build, test, and deployment pipelines' },
      { name: 'Infrastructure as Code', path: '/managed-cloud-service/infrastructure-as-code', icon: Server, description: 'CloudFormation, Terraform, and Ansible automation' },
      { name: 'Containerization', path: '/managed-cloud-service/containerization', icon: Box, description: 'Docker, Kubernetes, and orchestration solutions' },
      { name: '24/7 Monitoring', path: '/managed-cloud-service/monitoring', icon: Activity, description: 'Round-the-clock cloud and database monitoring' },
      { name: 'Database Management', path: '/managed-cloud-service/database-management', icon: Database, description: 'MySQL, PostgreSQL, MongoDB administration' },
    ],
    faqs: [
      { question: 'What does Managed Cloud Service include?', answer: 'Our managed cloud service covers the complete infrastructure lifecycle — cloud setup, CI/CD automation, infrastructure as code, containerization with Docker and Kubernetes, 24/7 monitoring, and database management. We handle everything so your team can focus on building products.' },
      { question: 'Which cloud platforms do you support?', answer: 'We work with all major cloud providers including AWS, Microsoft Azure, Google Cloud Platform, DigitalOcean, and Linode. We can also manage hybrid and multi-cloud architectures based on your requirements.' },
      { question: 'Do you offer 24/7 infrastructure support?', answer: 'Yes, we provide round-the-clock monitoring and support for your cloud infrastructure and databases. Our team proactively detects and resolves issues before they impact your users, with guaranteed SLAs.' },
      { question: 'Can you migrate our existing infrastructure to the cloud?', answer: 'Absolutely. We specialize in cloud migration strategies including lift-and-shift, re-platforming, and full re-architecture. We assess your current setup, plan a zero-downtime migration, and optimize your infrastructure post-migration.' },
      { question: 'How do you ensure security and compliance?', answer: 'We implement industry best practices including IAM policies, VPC isolation, encryption at rest and in transit, security audits, and compliance with standards like SOC 2, HIPAA, and GDPR. We also set up automated vulnerability scanning and patching.' },
    ],
    seo: {
  title:
    "Managed Cloud Services | AWS, Azure, GCP & DevOps Infrastructure Management | SparkCurv",
  description:
    "SparkCurv provides managed cloud services including AWS, Azure, and Google Cloud (GCP) infrastructure management, DevOps automation, CI/CD pipelines, Kubernetes, Docker containerization, monitoring, security, cloud migration, and 24/7 support.",
  keywords:
    "managed cloud services, cloud infrastructure management, AWS cloud services, Azure cloud services, Google Cloud Platform services, DevOps services, CI/CD automation, Kubernetes management, Docker services, cloud migration services, cloud security, cloud monitoring, cloud consulting services",
  canonical:
    "https://sparkcurv.com/managed-cloud-service",
}
  },
  'cloud-services': {
    title: 'Cloud Services',
    subtitle: 'Scalable Cloud Infrastructure Solutions',
    description: 'Deploy, manage, and scale your applications on the world\'s leading cloud platforms. We handle everything from initial setup to ongoing optimization and cost management.',
    image: '/images/services/cloud-services-hero.jpg',
    features: [
      'Multi-Cloud Strategy & Architecture',
      'Cloud Migration & Modernization',
      'Auto-Scaling & Load Balancing',
      'Cloud Security & IAM Management',
      'Cost Optimization & FinOps',
      'Serverless Architecture',
      'Virtual Private Cloud (VPC) Setup',
      'Cloud Backup & Disaster Recovery',
    ],
    tools: [
      { name: 'AWS', logo: '/images/tools/aws.svg' },
      { name: 'Azure', logo: '/images/tools/azure.png' },
      { name: 'Google Cloud', logo: '/images/tools/gcp.svg' },
      { name: 'DigitalOcean', logo: '/images/tools/digitalocean.svg' },
      { name: 'Linode', logo: '/images/tools/linode.png' },
      { name: 'Terraform', logo: '/images/tools/terraform.svg' },
      { name: 'CloudFormation', logo: '/images/tools/aws.svg' },
      { name: 'Firebase', logo: '/images/tools/firebase.png' },
    ],
    faqs: [
      { question: 'What cloud platforms do you manage?', answer: 'We manage infrastructure across AWS, Azure, Google Cloud Platform, DigitalOcean, and Linode. We can also set up and manage multi-cloud or hybrid cloud architectures for redundancy and cost optimization.' },
      { question: 'Can you help reduce our cloud costs?', answer: 'Yes, cloud cost optimization is a core part of our service. We analyze your usage patterns, right-size instances, implement auto-scaling, leverage reserved instances and spot pricing, and set up FinOps dashboards for ongoing cost visibility.' },
      { question: 'Do you handle cloud security?', answer: 'Absolutely. We implement comprehensive security measures including IAM policies, VPC configuration, security groups, encryption, DDoS protection, and regular security audits. We also ensure compliance with industry standards.' },
      { question: 'What is your approach to cloud migration?', answer: 'We follow a phased approach: assessment of your current infrastructure, migration planning with risk analysis, pilot migration, full migration with rollback capability, and post-migration optimization. We ensure zero or minimal downtime throughout.' },
      { question: 'Do you support serverless architectures?', answer: 'Yes, we design and deploy serverless solutions using AWS Lambda, Azure Functions, and Google Cloud Functions. Serverless architectures can significantly reduce costs and operational overhead for event-driven workloads.' },
    ],
    seo: {
  title:
    "Cloud Services | AWS, Azure & Google Cloud Solutions | DevOps & Infrastructure | SparkCurv",
  description:
    "SparkCurv offers cloud services including AWS, Azure, and Google Cloud Platform (GCP) solutions, DevOps automation, CI/CD pipelines, Kubernetes, Docker, cloud migration, infrastructure management, security, monitoring, and scalable cloud architecture.",
  keywords:
    "cloud services, cloud computing services, AWS services, Azure cloud services, Google Cloud Platform, GCP services, cloud infrastructure, DevOps services, CI/CD pipelines, Kubernetes services, Docker containers, cloud migration, cloud security, cloud architecture, cloud consulting",
  canonical:
    "https://sparkcurv.com/managed-cloud-service",
}
  },
  'cicd-automation': {
    title: 'CI/CD Automation',
    subtitle: 'Automated Build, Test & Deploy Pipelines',
    description: 'Accelerate your software delivery with fully automated CI/CD pipelines. We design and implement continuous integration and deployment workflows that ensure code quality, rapid releases, and zero-downtime deployments.',
    image: '/images/services/cicd-hero.jpg',
    features: [
      'CI/CD Pipeline Design & Implementation',
      'Automated Testing Integration',
      'Blue-Green & Canary Deployments',
      'GitOps Workflow Automation',
      'Artifact Management & Versioning',
      'Rollback & Recovery Automation',
      'Multi-Environment Deployment',
      'Pipeline Monitoring & Analytics',
    ],
    tools: [
      { name: 'Jenkins', logo: '/images/tools/jenkins.svg' },
      { name: 'GitHub Actions', logo: '/images/tools/github-actions.svg' },
      { name: 'GitLab CI', logo: '/images/tools/gitlab.svg' },
      { name: 'CircleCI', logo: '/images/tools/circleci.svg' },
      { name: 'ArgoCD', logo: '/images/tools/argocd.png' },
      { name: 'Bitbucket', logo: '/images/tools/bitbucket.png' },
      { name: 'GitHub', logo: '/images/tools/github.png' },
      { name: 'Terraform', logo: '/images/tools/terraform.svg' },
      { name: 'Ansible', logo: '/images/tools/ansible.png' },
    ],
    faqs: [
      { question: 'What CI/CD tools do you work with?', answer: 'We work with all major CI/CD platforms including Jenkins, GitHub Actions, GitLab CI/CD, CircleCI, ArgoCD, and Bitbucket Pipelines. We recommend the best tool based on your tech stack, team size, and workflow requirements.' },
      { question: 'How do you ensure zero-downtime deployments?', answer: 'We implement deployment strategies like blue-green deployments, canary releases, and rolling updates. Combined with automated health checks and instant rollback capabilities, we ensure your users experience no service interruptions during releases.' },
      { question: 'Can you set up CI/CD for our existing project?', answer: 'Yes, we can integrate CI/CD pipelines into any existing project regardless of its maturity. We assess your current workflow, identify automation opportunities, and implement pipelines incrementally without disrupting your development process.' },
      { question: 'How do you handle testing in the CI/CD pipeline?', answer: 'We integrate automated testing at every stage — unit tests, integration tests, end-to-end tests, security scans, and performance tests. Tests run automatically on every commit, ensuring only quality code reaches production.' },
      { question: 'What is GitOps and do you implement it?', answer: 'GitOps is an operational framework where Git is the single source of truth for infrastructure and application deployments. We implement GitOps workflows using tools like ArgoCD and Flux, enabling version-controlled, auditable, and automated deployments.' },
    ],
    seo: {
  title:
    "CI/CD Automation Services | DevOps Pipelines & Deployment Automation | SparkCurv",
  description:
    "SparkCurv provides CI/CD automation services including automated build and deployment pipelines, GitOps workflows, testing integration, container deployment, blue-green deployments, and zero-downtime release strategies to accelerate software delivery.",
  keywords:
    "CI/CD automation, continuous integration, continuous deployment, DevOps pipelines, deployment automation, GitOps workflows, Jenkins pipelines, GitHub Actions, GitLab CI, automated testing, blue-green deployment, release automation, DevOps services",
  canonical:
    "https://sparkcurv.com/managed-cloud-service/cicd-automation",
}
  },
  'infrastructure-as-code': {
    title: 'Infrastructure as Code',
    subtitle: 'Automate Your Infrastructure with Code',
    description: 'Define, provision, and manage your entire infrastructure through code. We use industry-leading IaC tools like CloudFormation, Terraform, and Ansible to create reproducible, version-controlled infrastructure that scales effortlessly.',
    image: '/images/services/iac-hero.jpg',
    features: [
      'Terraform Infrastructure Provisioning',
      'AWS CloudFormation Templates',
      'Ansible Configuration Management',
      'Infrastructure Version Control',
      'Environment Replication & Templating',
      'Compliance as Code',
      'Drift Detection & Remediation',
      'Multi-Cloud IaC Strategy',
    ],
    tools: [
      { name: 'Terraform', logo: '/images/tools/terraform.svg' },
      { name: 'CloudFormation', logo: '/images/tools/aws.svg' },
      { name: 'Ansible', logo: '/images/tools/ansible.png' },
      { name: 'AWS', logo: '/images/tools/aws.svg' },
      { name: 'Google Cloud', logo: '/images/tools/gcp.svg' },
      { name: 'Python', logo: '/images/tools/python.svg' },
    ],
    faqs: [
      { question: 'What is Infrastructure as Code (IaC)?', answer: 'Infrastructure as Code is the practice of managing and provisioning infrastructure through code rather than manual processes. It enables version control, reproducibility, and automation of your entire infrastructure, reducing human error and speeding up deployments.' },
      { question: 'Which IaC tools do you use?', answer: 'We primarily use Terraform for multi-cloud provisioning, AWS CloudFormation for AWS-specific infrastructure, and Ansible for configuration management. We select the best combination based on your cloud environment and requirements.' },
      { question: 'Can IaC work with our existing infrastructure?', answer: 'Yes, we can import and codify your existing infrastructure into IaC templates. This process involves auditing current resources, writing corresponding code, and gradually transitioning management to the IaC workflow without disrupting running services.' },
      { question: 'How does IaC help with compliance?', answer: 'IaC enables "Compliance as Code" where security policies and compliance rules are embedded directly in your infrastructure definitions. Every change is version-controlled, auditable, and reviewed before deployment, ensuring continuous compliance.' },
      { question: 'What is drift detection and why does it matter?', answer: 'Drift detection identifies differences between your defined infrastructure code and the actual running infrastructure. It matters because manual changes can introduce security vulnerabilities and inconsistencies. We set up automated drift detection and remediation to keep your infrastructure in sync.' },
    ],
    seo: {
  title:
    "Managed Cloud Services | AWS, Azure & GCP Cloud Management | SparkCurv",
  description:
    "Simplify your cloud operations with SparkCurv Managed Cloud Services. We provide AWS, Azure, and Google Cloud management, monitoring, migration, optimization, security, and cost control for scalable infrastructure.",
  keywords:
    "managed cloud services, cloud management services, AWS management, Azure cloud services, Google Cloud Platform, cloud migration services, cloud optimization, cloud security, DevOps cloud support, infrastructure management",
  canonical:
    "https://sparkcurv.com/cloud-services/managed-cloud-services",
}
  },
  'containerization': {
    title: 'Containerization',
    subtitle: 'Docker & Kubernetes Solutions',
    description: 'Modernize your applications with containerization. We design and implement container strategies using Docker and Kubernetes to achieve portability, scalability, and efficient resource utilization across any environment.',
    image: '/images/services/containerization-hero.jpg',
    features: [
      'Docker Container Development',
      'Kubernetes Cluster Management',
      'Microservices Architecture',
      'Container Registry Management',
      'Helm Chart Development',
      'Service Mesh Implementation',
      'Container Security & Scanning',
      'Auto-Scaling & Self-Healing',
    ],
    tools: [
      { name: 'Docker', logo: '/images/tools/docker.png' },
      { name: 'Kubernetes', logo: '/images/tools/kubernetes.png' },
      { name: 'Helm', logo: '/images/tools/helm.svg' },
      { name: 'OpenShift', logo: '/images/tools/openshift.svg' },
      { name: 'Terraform', logo: '/images/tools/terraform.svg' },
      { name: 'Prometheus', logo: '/images/tools/prometheus.png' },
    ],
    faqs: [
      { question: 'What is containerization and why should we use it?', answer: 'Containerization packages your application and its dependencies into isolated, portable containers. It ensures consistent behavior across development, testing, and production environments, reduces infrastructure costs, and enables rapid scaling.' },
      { question: 'What is the difference between Docker and Kubernetes?', answer: 'Docker is a platform for creating and running containers, while Kubernetes is an orchestration system that manages multiple containers at scale. Docker builds the containers; Kubernetes deploys, scales, and manages them across clusters of machines.' },
      { question: 'Can you containerize our existing applications?', answer: 'Yes, we specialize in containerizing legacy and existing applications. We analyze your application architecture, create optimized Dockerfiles, set up container registries, and implement orchestration — all with minimal changes to your codebase.' },
      { question: 'How do you handle container security?', answer: 'We implement multi-layered container security including image vulnerability scanning, runtime security monitoring, network policies, secrets management, and role-based access control. We use tools like Trivy, Falco, and OPA for comprehensive protection.' },
      { question: 'Do you support microservices migration?', answer: 'Absolutely. We help decompose monolithic applications into microservices, containerize each service, implement inter-service communication patterns, and deploy them on Kubernetes with proper service mesh, load balancing, and observability.' },
    ],
    seo: {
  title:
    "Containerization Services | Docker & Kubernetes Deployment Solutions | SparkCurv",
  description:
    "Deploy scalable applications with SparkCurv Containerization Services. We specialize in Docker, Kubernetes, microservices architecture, container orchestration, and cloud-native application deployment for high performance and reliability.",
  keywords:
    "containerization services, Docker services, Kubernetes deployment, microservices architecture, container orchestration, cloud native applications, DevOps containerization, application deployment, scalable infrastructure, CI/CD containers",
  canonical:
    "https://sparkcurv.com/devops/containerization",
}
  },
  'monitoring': {
    title: '24/7 Monitoring',
    subtitle: 'Round-the-Clock Cloud & Database Monitoring',
    description: 'Never miss a critical issue with our 24/7 monitoring services. We provide real-time alerting, performance tracking, and proactive incident response for your cloud infrastructure and databases.',
    image: '/images/services/monitoring-hero.jpg',
    features: [
      'Real-Time Infrastructure Monitoring',
      'Database Performance Monitoring',
      'Custom Alert Rules & Escalation',
      'Log Aggregation & Analysis',
      'Uptime & SLA Monitoring',
      'Performance Dashboards & Reporting',
      'Incident Response & Root Cause Analysis',
      'Capacity Planning & Forecasting',
    ],
    tools: [
      { name: 'Prometheus', logo: '/images/tools/prometheus.png' },
      { name: 'Grafana', logo: '/images/tools/grafana.svg' },
      { name: 'Datadog', logo: '/images/tools/datadog.png' },
      { name: 'New Relic', logo: '/images/tools/newrelic.png' },
      { name: 'Nagios', logo: '/images/tools/nagios.png' },
      { name: 'Zabbix', logo: '/images/tools/zabix.png' },
      { name: 'AWS CloudWatch', logo: '/images/tools/aws.svg' },
      { name: 'Elasticsearch', logo: '/images/tools/elasticsearch.png' },
      { name: 'Wazuh', logo: '/images/tools/wazuh.png' },
    ],
    faqs: [
      { question: 'What do you monitor in a 24/7 monitoring service?', answer: 'We monitor server health, CPU/memory/disk usage, network traffic, application performance, database queries, API response times, error rates, and uptime. We also track business-critical metrics customized to your application.' },
      { question: 'What monitoring tools do you use?', answer: 'We use industry-standard tools including Prometheus, Grafana, Datadog, New Relic, Nagios, Zabbix, and AWS CloudWatch. We select the best combination based on your infrastructure and create custom dashboards for real-time visibility.' },
      { question: 'How quickly do you respond to incidents?', answer: 'Our response times depend on severity — critical incidents (P1) are acknowledged within 5 minutes and resolved within 1 hour. We provide automated alerting, escalation procedures, and post-incident root cause analysis for every significant event.' },
      { question: 'Can you monitor both cloud and on-premise infrastructure?', answer: 'Yes, we support hybrid monitoring setups covering cloud resources, on-premise servers, containers, databases, and applications. We create unified dashboards that give you a single view across your entire infrastructure.' },
      { question: 'Do you provide monitoring reports and analytics?', answer: 'Absolutely. We provide weekly and monthly reports covering uptime statistics, performance trends, incident summaries, capacity forecasts, and optimization recommendations. All reports are accessible through real-time dashboards as well.' },
    ],
    seo: {
  title:
    "Cloud Monitoring & Observability Services | 24/7 Infrastructure Monitoring | SparkCurv",
  description:
    "Ensure system reliability with SparkCurv Cloud Monitoring Services. We provide 24/7 infrastructure monitoring, application performance monitoring (APM), logging, alerting, and observability solutions for AWS, Azure, and GCP environments.",
  keywords:
    "cloud monitoring services, infrastructure monitoring, application performance monitoring, APM tools, DevOps monitoring, observability solutions, cloud logging, system alerting, AWS monitoring, Azure monitoring, GCP monitoring",
  canonical:
    "https://sparkcurv.com/devops/monitoring",
}
  },
  'database-management': {
    title: 'Database Management',
    subtitle: 'Reliable, Scalable & Secure Data Solutions',
    description: 'Ensure your data is always available, secure, and performing at its best. We provide end-to-end database management including design, optimization, migration, monitoring, and disaster recovery.',
    image: '/images/platforms/database-hero.jpg',
    features: [
      'Database Design & Architecture',
      'Performance Tuning & Query Optimization',
      'Database Migration & Upgrades',
      '24/7 Database Monitoring & Alerts',
      'Backup & Disaster Recovery',
      'High Availability & Replication',
      'Security Audits & Compliance',
      'Cloud Database Management (AWS RDS, Azure SQL)',
    ],
    tools: [
      { name: 'MySQL', logo: '/images/tools/mysql.png' },
      { name: 'PostgreSQL', logo: '/images/tools/postgresql.png' },
      { name: 'MongoDB', logo: '/images/tools/mongodb.png' },
      { name: 'Redis', logo: '/images/tools/redis.png' },
      { name: 'Oracle', logo: '/images/tools/oracle.png' },
      { name: 'MariaDB', logo: '/images/tools/mariadb.png' },
      { name: 'SQLite', logo: '/images/tools/sqlite.png' },
      { name: 'Cassandra', logo: '/images/tools/cassandra.png' },
      { name: 'Elasticsearch', logo: '/images/tools/elasticsearch.png' },
      { name: 'DynamoDB', logo: '/images/tools/dynamodb.png' },
    ],
    faqs: [
      { question: 'Which databases do you support?', answer: 'We support all major relational and NoSQL databases including MySQL, PostgreSQL, MongoDB, Redis, Oracle, MariaDB, Cassandra, Elasticsearch, DynamoDB, and SQLite. We also manage cloud-native databases like AWS RDS and Azure SQL.' },
      { question: 'What does database performance tuning involve?', answer: 'Performance tuning includes query optimization, index analysis, schema redesign, connection pooling, caching strategies, and resource allocation. We analyze slow queries, identify bottlenecks, and implement changes that can improve performance by 10-100x.' },
      { question: 'How do you handle database backups and disaster recovery?', answer: 'We implement automated backup schedules with point-in-time recovery, cross-region replication, and regular disaster recovery drills. We ensure RPO (Recovery Point Objective) and RTO (Recovery Time Objective) meet your business continuity requirements.' },
      { question: 'Can you migrate our database to the cloud?', answer: 'Yes, we specialize in database migrations — from on-premise to cloud, between cloud providers, or across database engines. We plan migrations with minimal downtime using tools like AWS DMS, and validate data integrity post-migration.' },
      { question: 'Do you offer high availability database setups?', answer: 'Absolutely. We configure master-replica setups, multi-AZ deployments, automatic failover, and read replicas for load distribution. Our HA configurations ensure 99.99% uptime with automated health checks and self-healing capabilities.' },
    ],
    seo: {
  title:
    "Database Management Services | MySQL, PostgreSQL, MongoDB Optimization | SparkCurv",
  description:
    "Optimize and secure your data with SparkCurv Database Management Services. We provide database design, migration, performance tuning, backup, recovery, monitoring, and scaling for MySQL, PostgreSQL, MongoDB, and cloud databases.",
  keywords:
    "database management services, database optimization, MySQL management, PostgreSQL services, MongoDB database, database migration, database performance tuning, database backup and recovery, cloud database management, DBA services",
  canonical:
    "https://sparkcurv.com/data-services/database-management",
}
  },
};

const ManagedCloudService = () => {
  const { subpage } = useParams();
  const page = subpage || 'overview';
  const data = subPages[page];
  useScrollAnimation();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Page not found</p>
      </div>
    );
  }

  const isOverview = page === 'overview';

  return (
    <div data-testid="managed-cloud-page" className="pt-20">
      <SEO
  title={data.seo?.title || data.title}
  description={data.seo?.description || data.description}
  keywords={data.seo?.keywords || ""}
  canonical={data.seo?.canonical}
/>
      {/* Hero Section */}
      <section
        data-testid="cloud-hero"
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#02028B] to-blue-600"
      >
        <div className="absolute inset-0 opacity-20">
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center py-24">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-6 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.2em] text-white font-bold">{data.subtitle}</p>
          </div>
          <h1 className="font-clash text-5xl sm:text-6xl font-bold tracking-tighter mb-6 text-white animate-slide-up">
            {data.title}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {data.description}
          </p>
        </div>
      </section>

      {/* Sub-Navigation for sub-pages */}
      <section className="bg-gray-50 border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex overflow-x-auto gap-1 py-3 scrollbar-hide">
            <Link
              to="/managed-cloud-service"
              data-testid="subnav-overview"
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isOverview ? 'bg-[#02028B] text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overview
            </Link>
            {subPages['overview'].subServices.map((s) => {
              const isActive = `/managed-cloud-service/${page}` === s.path;
              return (
                <Link
                  key={s.path}
                  to={s.path}
                  data-testid={`subnav-${s.path.split('/').pop()}`}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive ? 'bg-[#02028B] text-white' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Overview: Sub-services grid */}
      {isOverview && (
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-16 reveal-on-scroll">
              <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-blue-100 rounded-full px-6 py-2 mb-4">
                <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Our Services</span>
              </div>
              <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Explore Our <span className="text-gradient-blue">Cloud Solutions</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.subServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.path}
                    to={service.path}
                    data-testid={`subservice-card-${index}`}
                    className={`group relative bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-[#02028B]/30 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl reveal-on-scroll delay-${(index % 3) + 1}`}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-[#02028B] to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-clash text-xl font-bold text-gray-900 mb-3 group-hover:text-[#02028B] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.description}</p>
                    <div className="flex items-center text-[#02028B] font-semibold text-sm">
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Features */}
            <div className="mt-24 reveal-on-scroll">
              <div className="text-center mb-12">
                <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  What We <span className="text-gradient-blue">Offer</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {data.features.map((feature, index) => (
                  <div key={index} className={`flex items-start space-x-3 p-4 rounded-xl bg-gray-50 reveal-on-scroll delay-${(index % 4) + 1}`}>
                    <div className="w-6 h-6 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#02028B]" />
                    </div>
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sub-page: Features + Tools */}
      {!isOverview && (
        <section className="py-24 md:py-32 bg-white" data-testid="subpage-content">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="reveal-on-scroll from-left">
                <h2 className="font-clash text-4xl sm:text-5xl font-medium tracking-tight mb-8 text-gray-900">
                  What We Offer
                </h2>
                <ul className="space-y-4">
                  {data.features.map((feature, index) => (
                    <li key={index} data-testid={`feature-${index}`} className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-[#02028B]" />
                      </div>
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 p-12 rounded-3xl shadow-lg reveal-on-scroll from-right">
                <h3 className="font-clash text-3xl font-bold mb-6 text-gray-900">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Let's discuss how our {data.title.toLowerCase()} services can help transform your business and achieve your goals.
                </p>
                <Link
                  to="/contact"
                  data-testid="cloud-cta-button"
                  className="bg-gradient-to-r from-[#02028B] to-blue-600 text-white hover:shadow-xl hover:shadow-[#02028B]/30 transition-all duration-300 rounded-full px-8 py-4 font-bold inline-flex items-center space-x-2 transform hover:scale-105"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Tools Section */}
            {data.tools && (
              <div className="mt-24 reveal-on-scroll">
                <div className="text-center mb-12">
                  <div className="inline-block bg-gradient-to-r from-[#02028B]/10 to-blue-100 rounded-full px-6 py-2 mb-4">
                    <span className="text-sm font-bold text-[#02028B] uppercase tracking-wider">Technologies We Use</span>
                  </div>
                  <h2 className="font-clash text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                    Industry-Leading <span className="text-gradient-blue">{data.title} Tools</span>
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {data.tools.map((tool, index) => (
                    <div
                      key={index}
                      data-testid={`tool-${index}`}
                      className={`group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#02028B]/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center justify-center reveal-on-scroll delay-${(index % 6) + 1}`}
                    >
                      <div className="w-20 h-20 flex items-center justify-center mb-4">
                        <img src={tool.logo} alt={tool.name} className="max-w-full max-h-full object-contain transition-all duration-300" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 group-hover:text-[#02028B] transition-colors text-center">
                        {tool.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {data.faqs && <FAQSection faqs={data.faqs} />}
    </div>
  );
};

export default ManagedCloudService;
